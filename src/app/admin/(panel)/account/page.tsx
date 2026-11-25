import { AdminForm, TextField } from "@/components/admin/Form";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { changePassword } from "../../actions/auth";

export const metadata = { title: "Password" };

export default async function AccountPage() {
  const { user } = await requireAdmin();
  return (
    <>
      <PageTitle title="Password" note={`Signed in as ${user.email}.`} />
      <AdminForm action={changePassword} submitLabel="Change password">
        <Card title="Change your password" note="At least 12 characters, with a small letter, a capital letter and a digit. A sentence of several words works well.">
          <div className="grid max-w-[460px] gap-4">
            <TextField label="Current password" name="current" type="password" autoComplete="current-password" />
            <TextField label="New password" name="next" type="password" autoComplete="new-password" />
            <TextField label="New password again" name="again" type="password" autoComplete="new-password" />
          </div>
        </Card>
      </AdminForm>
    </>
  );
}
