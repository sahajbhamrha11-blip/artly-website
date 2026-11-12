import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "../actions";
import { AdminNav } from "./AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const newCount = await db.enquiry.count({ where: { status: "NEW" } });

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-stone bg-paper lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-6 py-6">
          <Logo height={32} href="/admin" />
          <span className="text-[10px] font-semibold tracking-[0.25em] text-metal uppercase">Admin</span>
        </div>
        <AdminNav newCount={newCount} />
        <div className="mt-auto hidden space-y-3 border-t border-stone px-6 py-6 lg:block">
          <p className="truncate text-[12px] text-metal" title={admin.email}>{admin.email}</p>
          <div className="flex items-center justify-between gap-3">
            <Link href="/" target="_blank" className="text-[12px] font-semibold tracking-[0.15em] uppercase hover:text-red">View site ↗</Link>
            <form action={logoutAction}>
              <button type="submit" className="text-[12px] font-semibold tracking-[0.15em] text-red uppercase hover:text-red-bright">Log out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-end gap-5 border-b border-stone bg-paper px-5 py-3 lg:hidden">
          <Link href="/" target="_blank" className="text-[12px] font-semibold tracking-[0.15em] uppercase">View site ↗</Link>
          <form action={logoutAction}>
            <button type="submit" className="text-[12px] font-semibold tracking-[0.15em] text-red uppercase">Log out</button>
          </form>
        </div>
        <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
