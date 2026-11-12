import Link from "next/link";
import { db } from "@/lib/db";
import { SmartImage } from "@/components/SmartImage";
import { toggleProductAction } from "../../actions";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ deleted?: string; q?: string }> }) {
  const { deleted, q = "" } = await searchParams;
  const products = await db.product.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] } : undefined,
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, _count: { select: { enquiries: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl">Products</h1>
          <p className="mt-2 text-metal">{products.length} product{products.length === 1 ? "" : "s"}{q && ` matching “${q}”`}</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">+ Add product</Link>
      </div>

      {deleted && <p role="status" className="mt-6 border-l-2 border-[#1f7a4d] bg-paper px-5 py-3 text-[14px]">Product deleted.</p>}

      <form className="mt-8 flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search products</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by name or slug" className="field !py-2.5" />
        <button className="btn-dark !py-2.5" type="submit">Search</button>
      </form>

      <div className="mt-6 overflow-x-auto bg-paper">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead className="border-b border-stone text-[11px] tracking-[0.15em] text-metal uppercase">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Featured</th>
              <th className="px-5 py-3">Published</th>
              <th className="px-5 py-3">Enquiries</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-metal">No products yet. <Link href="/admin/products/new" className="text-red underline">Add your first product</Link>.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-linen">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-sand">
                      {p.images[0] && <SmartImage src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                    <div>
                      <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-red">{p.name}</Link>
                      <p className="text-[12px] text-metal">/products/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">{p.category.name}</td>
                <td className="px-5 py-3">
                  <form action={toggleProductAction.bind(null, p.id, "featured")}>
                    <button type="submit" className={`px-2.5 py-1 text-[11px] font-semibold uppercase ${p.featured ? "bg-charcoal text-paper" : "bg-sand text-metal"}`} title="Toggle featured">
                      {p.featured ? "Featured" : "No"}
                    </button>
                  </form>
                </td>
                <td className="px-5 py-3">
                  <form action={toggleProductAction.bind(null, p.id, "published")}>
                    <button type="submit" className={`px-2.5 py-1 text-[11px] font-semibold uppercase ${p.published ? "bg-[#1f7a4d]/12 text-[#1f7a4d]" : "bg-red/10 text-red"}`} title="Toggle published">
                      {p.published ? "Live" : "Hidden"}
                    </button>
                  </form>
                </td>
                <td className="px-5 py-3">{p._count.enquiries}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}`} className="mr-4 font-semibold hover:text-red">Edit</Link>
                  {p.published && <Link href={`/products/${p.slug}`} target="_blank" className="text-metal hover:text-charcoal">View ↗</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
