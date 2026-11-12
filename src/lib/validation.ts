import { z } from "zod";

export const INTEREST_OPTIONS = ["Fireplace", "Cooking Stove", "Other"] as const;
export const ENQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"] as const;

const phoneRegex = /^[+()\-\s\d]{7,20}$/;

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  companyName: z.string().trim().max(120).optional().default(""),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Please enter a valid phone number.")
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Please enter a valid phone number."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(160),
  interestedIn: z.enum(INTEREST_OPTIONS, { errorMap: () => ({ message: "Please choose an option." }) }),
  message: z.string().trim().min(10, "Please tell us a little more (at least 10 characters).").max(3000),
  productSlug: z.string().trim().max(120).optional().default(""),
  sourcePage: z.string().trim().max(200).optional().default(""),
  // anti-spam
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
  startedAt: z.coerce.number().optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;

const specSchema = z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().max(200) });

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens")
    .max(80),
  categoryId: z.string().min(1, "Choose a category"),
  shortDescription: z.string().trim().max(300).default(""),
  description: z.string().trim().max(10000).default(""),
  specs: z.array(specSchema).max(60).default([]),
  features: z.array(z.string().trim().min(1).max(200)).max(60).default([]),
  variations: z.array(z.string().trim().min(1).max(200)).max(60).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
  seoTitle: z.string().trim().max(120).default(""),
  seoDescription: z.string().trim().max(300).default(""),
  images: z
    .array(
      z.object({
        url: z.string().trim().regex(/^\/(images|uploads)\/[\w\-./]+$/, "Invalid image path"),
        alt: z.string().trim().max(200).default(""),
      }),
    )
    .max(30)
    .default([]),
});

export type ProductInput = z.input<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens"),
  tagline: z.string().trim().max(120).default(""),
  description: z.string().trim().max(1000).default(""),
  image: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\/(images|uploads)\/[\w\-./]+$/.test(v), "Invalid image path")
    .default(""),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});
