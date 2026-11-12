import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ENQUIRY_STATUSES } from "@/lib/validation";
import { cn, formatDate, telHref, whatsappHref } from "@/lib/utils";
import { StatusBadge, STATUS_LABELS } from "../StatusBadge";
import { EnquiryEditor } from "./EnquiryEditor";

export const metadata = { title: "Enquiries" };

type SP = Promise<{ status?: string; q?: string; id?: string }>;

export default async function EnquiriesPage({ searchParams }: { searchParams: SP }) {
  const { status = "", q = "", id } = await searchParams;

  const where: Prisma.EnquiryWhereInput = {};
  if ((ENQUIRY_STATUSES as readonly string[]).includes(status)) where.status = status;
  if (q) where.OR = [{ fullName: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { companyName: { contains: q } }, { message: { contains: q } }];

  const [enquiries, counts, selected] = await Promise.all([
    db.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { product: { select: { name: true, slug: true } } } }),
    db.enquiry.groupBy({ by: ["status"], _count: true }),
    id ? db.enquiry.findUnique({ where: { id }, include: { product: { select: { name: true, slug: true } } } }) : null,
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((n, c) => n + c._count, 0);

  const qs = (patch: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { status, q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return `/admin/enquiries${s ? `?${s}` : ""}`;
  };

  return (
    <div className="max-w-7xl">
      <h1 className="text-5xl">Enquiries</h1>
      <p className="mt-2 text-metal">Messages sent from the website contact and product forms.</p>

      <div className="mt-8 flex flex-wrap gap-1">
        {[["", `All (${total})`], ...ENQUIRY_STATUSES.map((s) => [s, `${STATUS_LABELS[s]} (${countFor(s)})`])].map(([s, label]) => (
          <Link
            key={s || "all"}
            href={qs({ status: s, id: undefined })}
            className={cn("px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase", status === s ? "bg-charcoal text-paper" : "bg-paper hover:bg-sand")}
          >
            {label}
          </Link>
        ))}
      </div>
      <form className="mt-4 flex max-w-md gap-2" role="search">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="q" className="sr-only">Search enquiries</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search name, email, phone, message" className="field !py-2.5" />
        <button className="btn-dark !py-2.5" type="submit">Search</button>
      </form>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="overflow-x-auto bg-paper">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="border-b border-stone text-[11px] tracking-[0.15em] text-metal uppercase">
              <tr><th className="px-5 py-3">From</th><th className="px-5 py-3">Interest</th><th className="px-5 py-3">Received</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {enquiries.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-metal">No enquiries found.</td></tr>}
              {enquiries.map((e) => (
                <tr key={e.id} className={cn("hover:bg-linen", selected?.id === e.id && "bg-linen")}>
                  <td className="px-5 py-4">
                    <Link href={qs({ id: e.id })} scroll={false} className={cn("hover:text-red", e.status === "NEW" ? "font-bold" : "font-semibold")}>{e.fullName}</Link>
                    <p className="text-[12px] text-metal">{e.email}</p>
                  </td>
                  <td className="px-5 py-4">{e.interestedIn}{e.product && <p className="text-[12px] text-metal">{e.product.name}</p>}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-metal">{formatDate(e.createdAt)}</td>
                  <td className="px-5 py-4"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          {selected ? (
            <div className="bg-paper p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl">{selected.fullName}</h2>
                  {selected.companyName && <p className="text-metal">{selected.companyName}</p>}
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <dl className="mt-6 space-y-3 text-[14px]">
                <div><dt className="field-label !mb-0.5">Email</dt><dd><a className="text-red underline-offset-4 hover:underline" href={`mailto:${selected.email}?subject=${encodeURIComponent("Your enquiry to ARTLY")}`}>{selected.email}</a></dd></div>
                <div>
                  <dt className="field-label !mb-0.5">Phone</dt>
                  <dd className="flex flex-wrap gap-4">
                    <a className="text-red underline-offset-4 hover:underline" href={telHref(selected.phone)}>{selected.phone}</a>
                    {whatsappHref(selected.phone, `Hello ${selected.fullName}, thank you for your enquiry to ARTLY.`) && (
                      <a className="text-[#1f7a4d] underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappHref(selected.phone, `Hello ${selected.fullName}, thank you for your enquiry to ARTLY.`)!}>WhatsApp ↗</a>
                    )}
                  </dd>
                </div>
                <div><dt className="field-label !mb-0.5">Interested in</dt><dd>{selected.interestedIn}{selected.product && <> — <Link href={`/products/${selected.product.slug}`} target="_blank" className="underline">{selected.product.name}</Link></>}</dd></div>
                <div><dt className="field-label !mb-0.5">Received</dt><dd>{formatDate(selected.createdAt)}{selected.sourcePage && <span className="text-metal"> · from {selected.sourcePage}</span>}</dd></div>
                <div><dt className="field-label !mb-0.5">Email notification</dt><dd className="text-metal">{selected.emailSent ? "Sent" : "Not sent"}</dd></div>
              </dl>
              <div className="mt-6 border-l-2 border-red bg-linen p-4 text-[15px] leading-relaxed whitespace-pre-wrap">{selected.message}</div>
              <EnquiryEditor key={selected.id} id={selected.id} status={selected.status} notes={selected.adminNotes} />
            </div>
          ) : (
            <div className="bg-paper p-8 text-center text-metal">Select an enquiry to view details and update its status.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
