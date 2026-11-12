import Link from "next/link";
import { db } from "@/lib/db";
import { emailConfigured } from "@/lib/mail";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const [products, published, categories, newEnq, totalEnq, recent, s] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { published: true } }),
    db.category.count(),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.enquiry.count(),
    db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { product: { select: { name: true } } } }),
    getSettings(),
  ]);

  const missing = [
    !s.contactPhone && "business phone",
    !s.contactEmail && "business email",
    !s.whatsappNumber && "WhatsApp number",
    !s.address && "address",
    !s.mapEmbedUrl && "Google Maps embed",
  ].filter(Boolean) as string[];

  const stats = [
    { label: "New enquiries", value: newEnq, href: "/admin/enquiries?status=NEW", accent: true },
    { label: "Total enquiries", value: totalEnq, href: "/admin/enquiries" },
    { label: "Products (published)", value: `${published}/${products}`, href: "/admin/products" },
    { label: "Categories", value: categories, href: "/admin/categories" },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-5xl">Dashboard</h1>
      <p className="mt-2 text-metal">Welcome back. Here&apos;s what&apos;s happening on the ARTLY website.</p>

      {missing.length > 0 && (
        <div className="mt-8 border-l-2 border-ember bg-paper px-5 py-4 text-[14px]">
          <strong>Finish setting up:</strong> add your {missing.join(", ")} in{" "}
          <Link href="/admin/settings" className="text-red underline underline-offset-4">Website settings</Link> so they appear on the site.
        </div>
      )}
      {!emailConfigured() && (
        <div className="mt-3 border-l-2 border-steel bg-paper px-5 py-4 text-[14px] text-metal">
          Email notifications are off. Enquiries are saved here; set the SMTP_* variables in your environment to also receive them by email.
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((st) => (
          <Link key={st.label} href={st.href} className={`block p-6 transition-colors ${st.accent ? "bg-charcoal text-paper hover:bg-graphite" : "bg-paper hover:bg-sand"}`}>
            <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase ${st.accent ? "text-steel" : "text-metal"}`}>{st.label}</p>
            <p className="mt-4 font-display text-5xl">{st.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex items-end justify-between">
        <h2 className="text-3xl">Recent enquiries</h2>
        <Link href="/admin/enquiries" className="text-[12px] font-semibold tracking-[0.15em] uppercase hover:text-red">View all →</Link>
      </div>
      <div className="mt-5 overflow-x-auto bg-paper">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="border-b border-stone text-[11px] tracking-[0.15em] text-metal uppercase">
            <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Interest</th><th className="px-5 py-3">Received</th><th className="px-5 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {recent.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-metal">No enquiries yet.</td></tr>
            )}
            {recent.map((e) => (
              <tr key={e.id} className="hover:bg-linen">
                <td className="px-5 py-4"><Link href={`/admin/enquiries?id=${e.id}`} className="font-semibold hover:text-red">{e.fullName}</Link></td>
                <td className="px-5 py-4">{e.interestedIn}{e.product && <span className="text-metal"> · {e.product.name}</span>}</td>
                <td className="px-5 py-4 text-metal">{formatDate(e.createdAt)}</td>
                <td className="px-5 py-4"><StatusBadge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/products/new" className="btn-primary">Add product</Link>
        <Link href="/admin/categories" className="btn-outline-dark">Manage categories</Link>
        <Link href="/admin/settings" className="btn-outline-dark">Edit website content</Link>
      </div>
    </div>
  );
}
