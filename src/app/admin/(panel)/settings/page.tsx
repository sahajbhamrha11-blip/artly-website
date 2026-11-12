import { db } from "@/lib/db";
import { SETTINGS_DEFAULTS } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Website settings" };

export default async function SettingsPage() {
  const rows = await db.setting.findMany();
  const values: Record<string, string> = { ...SETTINGS_DEFAULTS };
  for (const r of rows) if (r.key in values && r.value !== "") values[r.key] = r.value;

  return (
    <div className="max-w-4xl">
      <h1 className="text-5xl">Website settings</h1>
      <p className="mt-2 text-metal">Business details, social links and editable page content. Empty contact fields are hidden on the website.</p>
      <SettingsForm values={values} />
      <PasswordForm />
    </div>
  );
}
