import { db } from "@/lib/db";
import { CategoryForm } from "./CategoryForm";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <div className="max-w-5xl">
      <h1 className="text-5xl">Categories</h1>
      <p className="mt-2 text-metal">Product categories appear as filters on the Products page and as collections on the home page.</p>

      <div className="mt-10 space-y-6">
        {categories.map((c) => (
          <CategoryForm
            key={c.id}
            category={{ id: c.id, name: c.name, slug: c.slug, tagline: c.tagline, description: c.description, image: c.image, sortOrder: c.sortOrder }}
            productCount={c._count.products}
          />
        ))}
      </div>

      <h2 className="mt-14 text-3xl">Add a category</h2>
      <div className="mt-5">
        <CategoryForm />
      </div>
    </div>
  );
}
