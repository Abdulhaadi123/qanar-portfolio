import { AdminForm } from "@/components/admin/Form";
import ImageUpload from "@/components/admin/ImageUpload";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { SHEET_L, SHEET_W } from "@/lib/bark";
import { saveImages } from "../../actions/site";

export const metadata = { title: "Hero & portrait" };

export default async function ImagesPage() {
  const { supabase } = await requireAdmin();
  const { data: s } = await supabase.from("site_settings").select("hero_image,portrait_image,portrait_blur").eq("id", 1).maybeSingle();
  if (!s) return <PageTitle title="Hero & portrait" note="The site settings row is missing from the database." />;

  return (
    <>
      <PageTitle title="Hero & portrait" note="The two pictures that are not part of the works list: the bark sheet that unrolls at the top of the home page, and your portrait." />
      <AdminForm action={saveImages}>
        <Card title="The sheet at the top of the home page" note="A photograph of one of your works. It is wrapped on the 3D sheet, so it is cut to the sheet's tall shape.">
          <ImageUpload
            kind="hero"
            label="Picture on the sheet"
            aspect={SHEET_W / SHEET_L}
            previewUrl={s.hero_image}
            initial={{ hero_image: s.hero_image }}
            hint="Use a sharp, well-lit photograph of the work, as flat-on as you can."
          />
        </Card>
        <Card title="Your portrait" note="Shown on the home page and the About page.">
          <ImageUpload
            kind="portrait"
            label="Portrait photograph"
            aspect={4 / 5}
            previewUrl={s.portrait_image}
            initial={{ portrait_image: s.portrait_image, portrait_blur: s.portrait_blur }}
            hint="A portrait (tall) photograph works best. Faces stay in view when you move the sliders."
          />
        </Card>
      </AdminForm>
    </>
  );
}
