import { cache } from "react";
import { db } from "./db";

/**
 * Editable site content & business details. Everything here can be changed
 * from Admin → Settings. Empty strings mean "not configured yet": the site
 * then hides the item or falls back to the contact page, so no dead links
 * are ever rendered.
 */
export const SETTINGS_DEFAULTS = {
  // Business details
  contactEmail: "",
  contactPhone: "",
  whatsappNumber: "",
  address: "",
  businessHours: "",
  mapEmbedUrl: "",
  // Social
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  // Home page content
  heroHeadline: "Bring Warmth. Experience Comfort.",
  heroSubtext:
    "Thoughtfully designed fireplaces and cooking stoves that bring warmth, functionality and elegance to every space.",
  introHeading: "Comfort Designed Around You",
  introText:
    "ARTLY creates fireplaces and cooking stoves for people who want more from the heart of their home. Every piece is built to deliver steady warmth, practical everyday use and a presence that makes a room feel complete — from the detail on a door frame to the way it sits in your space.",
  ctaHeadline: "Make Comfort a Part of Your Space.",
  // Imagery (replace with lifestyle / interior photography from Admin → Settings)
  heroImage: "/images/products/heritage-hearth-stove-front.jpg",
  lifestyleImage1: "/images/products/panorama-fireplace-front.jpg",
  lifestyleImage2: "/images/products/twin-door-oven-stove-front.jpg",
  lifestyleImage3: "/images/products/tower-fireplace-front.jpg",
  // About page content
  aboutWhoWeAre:
    "ARTLY is a brand dedicated to one idea: delivering comfort. We design and build fireplaces and cooking stoves that bring warmth, functionality and elegance together — products made to be used every day and admired for years.\n\nOur focus is on solid construction, considered detailing and dependable performance. We also offer customisation of our models to suit your requirements.",
  aboutVision:
    "To make quality heating and cooking solutions accessible through thoughtfully designed, dependable products.",
  aboutMission:
    "To combine functional design, quality craftsmanship and customer satisfaction in every product.",
  footerDescription:
    "Fireplaces and cooking stoves designed to bring warmth, functionality and elegance to every space.",
} as const;

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const settings: SiteSettings = { ...SETTINGS_DEFAULTS };
  try {
    const rows = await db.setting.findMany();
    for (const row of rows) {
      if (row.key in settings && row.value.trim() !== "") {
        settings[row.key as SettingKey] = row.value;
      }
    }
  } catch (err) {
    console.error("[settings] falling back to defaults:", err);
  }
  return settings;
});

export const SOCIAL_KEYS = [
  { key: "instagramUrl", label: "Instagram" },
  { key: "facebookUrl", label: "Facebook" },
  { key: "youtubeUrl", label: "YouTube" },
  { key: "linkedinUrl", label: "LinkedIn" },
] as const;
