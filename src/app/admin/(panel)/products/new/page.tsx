import Link from "next/link";
import { db } from "@/lib/db";
import { ProductEditor } from "../ProductEditor";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="text-[12px] font-semibold tracking-[0.15em] text-metal uppercase hover:text-charcoal">← Products</Link>
      <h1 className="mt-4 text-5xl">Add product</h1>
      {categories.length === 0 ? (
        <p className="mt-8 bg-paper p-6">Create a <Link href="/admin/categories" className="text-red underline">category</Link> first.</p>
      ) : (
        <ProductEditor categories={categories} />
      )}
    </div>
  );
}
