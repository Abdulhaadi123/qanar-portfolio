-- Row level security test. Run in Supabase -> SQL editor.
-- It acts as a visitor (anon), as a logged-in user who is NOT an admin, and as an admin (a throw-away user),
-- tries things that must work and things that must fail, and returns one JSON result.
-- Everything is rolled back at the end: no data is changed.
--
-- Expected result: see the "expect" notes after each key. 42501 = permission denied / RLS violation, 23514 = check constraint,
-- 22023 = invalid input, 54000 = rate limited.

create or replace function pg_temp.rls_test()
returns jsonb
language plpgsql
as $fn$
declare
  r jsonb := '{}'::jsonb;
  fake uuid := gen_random_uuid();
  n bigint;
  s_id uuid;
begin
  begin
    insert into auth.users (id, instance_id, aud, role, email)
    values (fake, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-test@example.invalid');
    select id into s_id from public.series order by position limit 1;

    -- =========================== visitor (anon) ===========================
    set local role anon;
    select count(*) into n from public.works;           r := r || jsonb_build_object('anon_works', n);            -- expect 39
    select count(*) into n from public.series;          r := r || jsonb_build_object('anon_series', n);           -- expect 4
    select count(*) into n from public.site_settings;   r := r || jsonb_build_object('anon_site_settings', n);    -- expect 1
    select count(*) into n from public.journal_posts;   r := r || jsonb_build_object('anon_posts', n);            -- expect 3
    select count(*) into n from public.record_entries;  r := r || jsonb_build_object('anon_record', n);           -- expect 14

    begin select count(*) into n from public.admins;
      r := r || jsonb_build_object('anon_reads_admins', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_reads_admins', sqlstate); end;      -- expect 42501
    begin perform public.is_admin();
      r := r || jsonb_build_object('anon_calls_is_admin', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_calls_is_admin', sqlstate); end;   -- expect 42501
    begin select count(*) into n from public.enquiries;
      r := r || jsonb_build_object('anon_reads_enquiries', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_reads_enquiries', sqlstate); end; -- expect 42501
    begin insert into public.enquiries (name, email, message) values ('x', 'x@example.com', 'hello there');
      r := r || jsonb_build_object('anon_inserts_enquiry_directly', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_inserts_enquiry_directly', sqlstate); end; -- expect 42501
    begin insert into public.works (no, series_id, ratio, photo, photo_md, photo_thumb) values ('zz', s_id, 1, '/a', '/a', '/a');
      r := r || jsonb_build_object('anon_inserts_work', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_inserts_work', sqlstate); end;  -- expect 42501
    begin update public.works set title = 'hacked';
      r := r || jsonb_build_object('anon_updates_work', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_updates_work', sqlstate); end;   -- expect 42501
    begin delete from public.works;
      r := r || jsonb_build_object('anon_deletes_work', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_deletes_work', sqlstate); end;   -- expect 42501
    begin update public.site_settings set name = 'hacked';
      r := r || jsonb_build_object('anon_updates_site', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_updates_site', sqlstate); end;   -- expect 42501
    begin insert into storage.objects (bucket_id, name) values ('media', 'zz/test.webp');
      r := r || jsonb_build_object('anon_uploads_media', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_uploads_media', sqlstate); end; -- expect 42501

    -- the contact form: 3 messages from one address pass, the 4th is refused; bad input is refused
    begin perform public.submit_enquiry('Buy an artwork', 'Test', 'rlstest@example.com', '', '', '', 'first message here');
          perform public.submit_enquiry('Buy an artwork', 'Test', 'RLSTEST@example.com', '', '', '', 'second message here');
          perform public.submit_enquiry('Buy an artwork', 'Test', 'rlstest@example.com', '', '', '', 'third message here');
      r := r || jsonb_build_object('anon_form_3_ok', true); exception when others then r := r || jsonb_build_object('anon_form_3_ok', sqlstate || ' ' || sqlerrm); end;     -- expect true
    begin perform public.submit_enquiry('x', 'Test', 'rlstest@example.com', '', '', '', 'fourth message here');
      r := r || jsonb_build_object('anon_form_4th', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_form_4th', sqlstate); end;         -- expect 54000
    begin perform public.submit_enquiry('x', 'Test', 'not-an-email', '', '', '', 'hello world');
      r := r || jsonb_build_object('anon_form_bad_email', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_form_bad_email', sqlstate); end; -- expect 22023
    begin perform public.submit_enquiry('x', '', 'a@example.com', '', '', '', 'hello world');
      r := r || jsonb_build_object('anon_form_no_name', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_form_no_name', sqlstate); end;       -- expect 22023
    begin perform public.submit_enquiry('x', 'T', 'b@example.com', '', '', '', 'hey');
      r := r || jsonb_build_object('anon_form_short_msg', 'ALLOWED'); exception when others then r := r || jsonb_build_object('anon_form_short_msg', sqlstate); end;   -- expect 22023
    reset role;

    -- hidden things stay hidden from visitors
    update public.works set visible = false where no = '01';
    update public.journal_posts set published = false where slug = 'nastaliq-the-hanging-script';
    set local role anon;
    select count(*) into n from public.works;           r := r || jsonb_build_object('anon_works_after_hide', n);     -- expect 38
    select count(*) into n from public.journal_posts;   r := r || jsonb_build_object('anon_posts_after_unpublish', n); -- expect 2
    reset role;

    -- ================== logged in, but not an admin ==================
    perform set_config('request.jwt.claims', json_build_object('sub', fake::text, 'role', 'authenticated')::text, true);
    set local role authenticated;
    r := r || jsonb_build_object('user_is_admin', public.is_admin());                                              -- expect false
    update public.works set title = 'hacked' where no = '02';
    get diagnostics n = row_count;                       r := r || jsonb_build_object('user_updates_work_rows', n);   -- expect 0
    begin insert into public.works (no, series_id, ratio, photo, photo_md, photo_thumb) values ('zz', s_id, 1, '/a', '/a', '/a');
      r := r || jsonb_build_object('user_inserts_work', 'ALLOWED'); exception when others then r := r || jsonb_build_object('user_inserts_work', sqlstate); end;    -- expect 42501
    delete from public.series;
    get diagnostics n = row_count;                       r := r || jsonb_build_object('user_deletes_series_rows', n); -- expect 0
    select count(*) into n from public.enquiries;       r := r || jsonb_build_object('user_sees_enquiries', n);      -- expect 0
    select count(*) into n from public.works;           r := r || jsonb_build_object('user_sees_works', n);          -- expect 38 (hidden one stays hidden)
    begin insert into storage.objects (bucket_id, name) values ('media', 'zz/test.webp');
      r := r || jsonb_build_object('user_uploads_media', 'ALLOWED'); exception when others then r := r || jsonb_build_object('user_uploads_media', sqlstate); end;  -- expect 42501
    reset role;

    -- ============================ admin ============================
    insert into public.admins (user_id) values (fake);
    set local role authenticated;
    r := r || jsonb_build_object('admin_is_admin', public.is_admin());                                             -- expect true
    select count(*) into n from public.works;           r := r || jsonb_build_object('admin_sees_works', n);         -- expect 39 (hidden included)
    select count(*) into n from public.journal_posts;   r := r || jsonb_build_object('admin_sees_posts', n);        -- expect 3 (unpublished included)
    update public.works set title = 'Admin edit' where no = '02';
    get diagnostics n = row_count;                       r := r || jsonb_build_object('admin_updates_work_rows', n);  -- expect 1
    insert into public.works (no, series_id, ratio, photo, photo_md, photo_thumb) values ('zz', s_id, 1, '/a', '/a', '/a');
    delete from public.works where no = 'zz';
    get diagnostics n = row_count;                       r := r || jsonb_build_object('admin_adds_and_deletes_work', n); -- expect 1
    update public.site_settings set bio = bio;
    get diagnostics n = row_count;                       r := r || jsonb_build_object('admin_updates_site_rows', n);  -- expect 1
    begin insert into public.site_settings (id, name) values (2, 'x');
      r := r || jsonb_build_object('admin_inserts_second_site_row', 'ALLOWED'); exception when others then r := r || jsonb_build_object('admin_inserts_second_site_row', sqlstate); end;  -- expect 42501
    select count(*) into n from public.enquiries;       r := r || jsonb_build_object('admin_sees_enquiries', n);     -- expect 3
    update public.enquiries set status = 'read' where email = 'rlstest@example.com';
    get diagnostics n = row_count;                       r := r || jsonb_build_object('admin_updates_enquiries', n);  -- expect 3
    begin insert into storage.objects (bucket_id, name) values ('media', 'zz/test.webp');
      r := r || jsonb_build_object('admin_uploads_media', true); exception when others then r := r || jsonb_build_object('admin_uploads_media', sqlstate || ' ' || sqlerrm); end;  -- expect true
    begin insert into storage.objects (bucket_id, name) values ('other-bucket', 'zz/test.webp');
      r := r || jsonb_build_object('admin_uploads_other_bucket', 'ALLOWED'); exception when others then r := r || jsonb_build_object('admin_uploads_other_bucket', sqlstate); end;   -- expect 42501 or 23503 (no such bucket)

    -- the database's own checks hold for the admin too
    begin update public.site_settings set hero_image = 'javascript:alert(1)';
      r := r || jsonb_build_object('admin_bad_image_url', 'ALLOWED'); exception when others then r := r || jsonb_build_object('admin_bad_image_url', sqlstate); end;   -- expect 23514
    begin update public.works set h_cm = null where no = '02';
      r := r || jsonb_build_object('admin_height_without_width', 'ALLOWED'); exception when others then r := r || jsonb_build_object('admin_height_without_width', sqlstate); end;   -- expect 23514
    begin update public.series set slug = 'Bad Slug!' where id = s_id;
      r := r || jsonb_build_object('admin_bad_slug', 'ALLOWED'); exception when others then r := r || jsonb_build_object('admin_bad_slug', sqlstate); end;   -- expect 23514
    begin delete from public.series where id = s_id;
      r := r || jsonb_build_object('admin_deletes_series_with_works', 'ALLOWED'); exception when others then r := r || jsonb_build_object('admin_deletes_series_with_works', sqlstate); end;  -- expect 23503
    reset role;

    raise exception 'rollback_marker';
  exception when others then
    if sqlerrm <> 'rollback_marker' then
      r := r || jsonb_build_object('FATAL', sqlerrm || ' @' || sqlstate);
    end if;
  end;
  return r;
end
$fn$;

select pg_temp.rls_test() as result;
