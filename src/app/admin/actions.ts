"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { categorySchema, ENQUIRY_STATUSES, productSchema, type ProductInput } from "@/lib/validation";
import { SETTINGS_DEFAULTS, type SettingKey } from "@/lib/settings";

export type ActionState = { ok: boolean; message?: string; errors?: Record<string, string>; id?: string } | null;

function issuesToErrors(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const i of issues) {
    const k = i.path.join(".");
    if (!errors[k]) errors[k] = i.message;
  }
  return errors;
}

function refreshSite() {
  revalidatePath("/", "layout");
}

// ── Auth ───────────────────────────────────────────────

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
let dummyHash: string | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("artly-timing-equaliser", 12));

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const ip = hashIp(await clientIp());
  const limit = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please wait 15 minutes and try again." };

  if (!email || !password) return { ok: false, message: "Enter your email and password." };

  const user = await db.adminUser.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? getDummyHash());
  if (!user || !valid) return { ok: false, message: "Incorrect email or password." };

  await createSession(user);
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!(await bcrypt.compare(current, admin.passwordHash))) return { ok: false, message: "Current password is incorrect." };
  if (next.length < 10) return { ok: false, message: "New password must be at least 10 characters." };
  if (next !== confirm) return { ok: false, message: "New passwords do not match." };
  await db.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true, message: "Password updated." };
}

// ── Products ───────────────────────────────────────────

export async function saveProductAction(id: string | null, input: ProductInput): Promise<ActionState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: issuesToErrors(parsed.error.issues) };
  const d = parsed.data;

  const clash = await db.product.findFirst({ where: { slug: d.slug, NOT: id ? { id } : undefined } });
  if (clash) return { ok: false, message: "Another product already uses this URL slug.", errors: { slug: "Slug already in use" } };
  const category = await db.category.findUnique({ where: { id: d.categoryId } });
  if (!category) return { ok: false, message: "Choose a valid category.", errors: { categoryId: "Choose a category" } };

  const data = {
    name: d.name,
    slug: d.slug,
    categoryId: d.categoryId,
    shortDescription: d.shortDescription,
    description: d.description,
    specs: JSON.stringify(d.specs),
    features: JSON.stringify(d.features),
    variations: JSON.stringify(d.variations),
    featured: d.featured,
    published: d.published,
    sortOrder: d.sortOrder,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
  };
  const images = d.images.map((img, i) => ({ url: img.url, alt: img.alt || d.name, sortOrder: i }));

  const saved = await db.$transaction(async (tx) => {
    if (id) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({ where: { id }, data: { ...data, images: { create: images } } });
    }
    return tx.product.create({ data: { ...data, images: { create: images } } });
  });

  refreshSite();
  return { ok: true, message: id ? "Product updated." : "Product created.", id: saved.id };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  refreshSite();
  redirect("/admin/products?deleted=1");
}

export async function toggleProductAction(id: string, field: "featured" | "published") {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id } });
  if (!p) return;
  await db.product.update({ where: { id }, data: { [field]: !p[field] } });
  refreshSite();
  revalidatePath("/admin/products");
}

// ── Categories ─────────────────────────────────────────

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: issuesToErrors(parsed.error.issues) };
  const clash = await db.category.findFirst({ where: { slug: parsed.data.slug, NOT: id ? { id } : undefined } });
  if (clash) return { ok: false, message: "Another category already uses this slug.", errors: { slug: "Slug already in use" } };

  if (id) await db.category.update({ where: { id }, data: parsed.data });
  else await db.category.create({ data: parsed.data });
  refreshSite();
  revalidatePath("/admin/categories");
  return { ok: true, message: id ? "Category updated." : "Category created." };
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  await requireAdmin();
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) return { ok: false, message: `This category still has ${count} product(s). Move or delete them first.` };
  await db.category.delete({ where: { id } });
  refreshSite();
  revalidatePath("/admin/categories");
  return { ok: true, message: "Category deleted." };
}

// ── Enquiries ──────────────────────────────────────────

export async function updateEnquiryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").slice(0, 5000);
  if (!(ENQUIRY_STATUSES as readonly string[]).includes(status)) return { ok: false, message: "Invalid status." };
  await db.enquiry.update({ where: { id }, data: { status, adminNotes } });
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { ok: true, message: "Enquiry updated." };
}

export async function deleteEnquiryAction(id: string) {
  await requireAdmin();
  await db.enquiry.delete({ where: { id } });
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries");
}

// ── Settings ───────────────────────────────────────────

const urlOrEmpty = z.string().trim().refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Must be a full https:// link");
const imagePath = z.string().trim().refine((v) => v === "" || /^\/(images|uploads)\/[\w\-./]+$/.test(v), "Invalid image path");

const settingsSchema = z.object({
  contactEmail: z.string().trim().refine((v) => v === "" || z.string().email().safeParse(v).success, "Invalid email"),
  contactPhone: z.string().trim().max(40).refine((v) => v === "" || /^[+()\-\s\d]{7,40}$/.test(v), "Invalid phone number"),
  whatsappNumber: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v === "" || /^\+?[\d\s\-()]{8,40}$/.test(v), "Use international format, e.g. +91 98765 43210"),
  address: z.string().trim().max(500),
  businessHours: z.string().trim().max(300),
  mapEmbedUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(v), "Paste the src link from Google Maps → Share → Embed a map"),
  instagramUrl: urlOrEmpty,
  facebookUrl: urlOrEmpty,
  youtubeUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
  heroHeadline: z.string().trim().max(120),
  heroSubtext: z.string().trim().max(400),
  introHeading: z.string().trim().max(120),
  introText: z.string().trim().max(1500),
  ctaHeadline: z.string().trim().max(120),
  heroImage: imagePath,
  lifestyleImage1: imagePath,
  lifestyleImage2: imagePath,
  lifestyleImage3: imagePath,
  aboutWhoWeAre: z.string().trim().max(4000),
  aboutVision: z.string().trim().max(600),
  aboutMission: z.string().trim().max(600),
  footerDescription: z.string().trim().max(400),
}) satisfies z.ZodType<Record<SettingKey, string>>;

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw: Record<string, string> = {};
  for (const key of Object.keys(SETTINGS_DEFAULTS)) raw[key] = String(formData.get(key) ?? "");
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: issuesToErrors(parsed.error.issues) };

  await db.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );
  refreshSite();
  return { ok: true, message: "Settings saved. Changes are live on the website." };
}
