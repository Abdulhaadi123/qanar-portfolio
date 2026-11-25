import WorksBrowser, { type BrowserWork } from "@/components/admin/WorksBrowser";
import { FlashBanner, LinkBtn, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { moveWork, setWorkVisible } from "../../actions/works";

export const metadata = { title: "Works" };

interface Row {
  id: string;
  no: string;
  title: string;
  series_id: string;
  size_text: string;
  medium: string;
  photo_thumb: string;
  ratio: number;
  visible: boolean;
  featured_pos: number | null;
  availability: string;
}

export default async function WorksList({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const [{ data: series }, { data: works }] = await Promise.all([
    supabase.from("series").select("id,title,kind").order("position"),
    supabase.from("works").select("id,no,title,series_id,size_text,medium,photo_thumb,ratio,visible,featured_pos,availability").order("position").order("id"),
  ]);
  const items: BrowserWork[] = ((works ?? []) as Row[]).map((w) => ({
    id: w.id,
    no: w.no,
    title: w.title,
    series_id: w.series_id,
    size_text: w.size_text,
    medium: w.medium,
    photo_thumb: w.photo_thumb,
    ratio: Number(w.ratio),
    visible: w.visible,
    featured: w.featured_pos !== null,
    availability: w.availability,
    moveUp: moveWork.bind(null, w.id, -1),
    moveDown: moveWork.bind(null, w.id, 1),
    toggle: setWorkVisible.bind(null, w.id, !w.visible),
  }));

  return (
    <>
      <PageTitle title="Works" note="The photographs on the site. Use the arrows to change the order inside a series.">
        <LinkBtn href="/admin/works/new" solid>
          + Add a work
        </LinkBtn>
      </PageTitle>
      <FlashBanner params={params} />
      <WorksBrowser series={series ?? []} works={items} />
    </>
  );
}
