/**
 * Seeds the database with ARTLY's categories, the products shown in the
 * supplied photographs, default site settings and the first admin user.
 *
 * Safe to run more than once: existing records are left untouched.
 *
 * Product names and descriptions describe only what is visible in the
 * photographs. Technical specifications are left blank ("On request")
 * until real data is entered in the admin panel.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TBC = ""; // empty value = displayed as "On request" on the website

const categories = [
  {
    name: "Fireplaces",
    slug: "fireplaces",
    tagline: "Warmth, framed in steel",
    description:
      "Wood-burning fireplaces and heating stoves with a wide viewing glass, decorative scrollwork and a matte black finish — designed to be the centrepiece of a room.",
    image: "/images/products/panorama-fireplace-front.jpg",
    sortOrder: 1,
  },
  {
    name: "Cooking Stoves",
    slug: "cooking-stoves",
    tagline: "Heat that also cooks",
    description:
      "Wood oven and cooking stoves that combine a firebox with a dedicated oven compartment, bringing warmth and everyday cooking together in one piece.",
    image: "/images/products/twin-door-oven-stove-front.jpg",
    sortOrder: 2,
  },
];

const baseSpecs = (extra: { label: string; value: string }[] = []) => [
  { label: "Fuel", value: "Wood" },
  { label: "Finish", value: "Matte black" },
  ...extra,
  { label: "Dimensions (W × D × H)", value: TBC },
  { label: "Weight", value: TBC },
  { label: "Flue diameter", value: TBC },
  { label: "Material / thickness", value: TBC },
  { label: "Heating capacity", value: TBC },
];

const products = [
  {
    slug: "heritage-hearth-stove",
    name: "Heritage Hearth Stove",
    category: "fireplaces",
    featured: true,
    sortOrder: 1,
    shortDescription:
      "A compact wood-burning stove with an oval viewing glass, ornate scrollwork door and a matching raised hearth tray.",
    description:
      "The Heritage Hearth Stove pairs a clean, matte black body with a richly detailed door frame. An oval viewing window lets you enjoy the fire, while brushed metal knobs control the door and the ventilated ash section below.\n\nIt is supplied on a raised hearth tray with a contrasting trim and its own ARTLY badge — a finished look that sits beautifully in a living room, lounge or reception area.",
    specs: baseSpecs([
      { label: "Door", value: "Single door with oval viewing glass" },
      { label: "Flue outlet", value: "Top mounted" },
      { label: "Base", value: "Raised hearth tray with legs" },
    ]),
    features: [
      "Oval viewing glass framed by embossed scrollwork",
      "Brushed metal door and vent control knobs",
      "Ventilated lower section for airflow",
      "Raised hearth tray with contrasting trim",
      "Top-mounted flue outlet",
      "ARTLY badge on stove and hearth tray",
    ],
    variations: ["Customisation available on request"],
    images: [
      { url: "/images/products/heritage-hearth-stove-front.jpg", alt: "ARTLY Heritage Hearth Stove in matte black on a raised hearth tray, front view" },
    ],
  },
  {
    slug: "panorama-fireplace",
    name: "Panorama Fireplace",
    category: "fireplaces",
    featured: true,
    sortOrder: 2,
    shortDescription:
      "A wide-format wood fireplace with a large panoramic glass door, sculpted scrollwork legs and twin air vents.",
    description:
      "Designed around the view of the fire, the Panorama Fireplace features a broad rectangular glass door that opens up the firebox. Ventilation rows above and below the door are each fitted with a brushed metal control knob.\n\nEmbossed scrollwork corners on the door and sculpted decorative legs give it a strong presence in larger living spaces.",
    specs: baseSpecs([
      { label: "Door", value: "Single wide door with panoramic glass" },
      { label: "Flue outlet", value: "Top mounted" },
      { label: "Legs", value: "Decorative scrollwork legs" },
    ]),
    features: [
      "Wide panoramic viewing glass",
      "Upper and lower ventilation rows with control knobs",
      "Embossed scrollwork door corners",
      "Sculpted decorative legs",
      "Top-mounted flue outlet",
    ],
    variations: ["Customisation available on request"],
    images: [
      { url: "/images/products/panorama-fireplace-front.jpg", alt: "ARTLY Panorama Fireplace with wide glass door and decorative legs, front view" },
    ],
  },
  {
    slug: "tower-fireplace",
    name: "Tower Fireplace",
    category: "fireplaces",
    featured: true,
    sortOrder: 3,
    shortDescription:
      "An upright wood-burning fireplace with a tall glass door, polished top plate and vertical flue.",
    description:
      "The Tower Fireplace has a slim, upright footprint that suits corners and smaller rooms. A tall glass door with embossed corners shows off the fire, finished with a polished metal top plate and a vertical flue pipe.\n\nA brushed metal knob controls the ventilated lower section, and the door handle carries the ARTLY emblem.",
    specs: baseSpecs([
      { label: "Door", value: "Single tall door with viewing glass" },
      { label: "Flue outlet", value: "Top mounted, vertical" },
      { label: "Top plate", value: "Polished metal" },
    ]),
    features: [
      "Tall viewing glass with embossed corners",
      "Polished metal top plate",
      "Vertical flue pipe",
      "ARTLY emblem door knob",
      "Ventilated lower section with control knob",
    ],
    variations: ["Customisation available on request"],
    images: [
      { url: "/images/products/tower-fireplace-front.jpg", alt: "ARTLY Tower Fireplace, upright wood-burning fireplace with flue pipe, front view" },
    ],
  },
  {
    slug: "heritage-compact-stove",
    name: "Heritage Compact Stove",
    category: "fireplaces",
    featured: false,
    sortOrder: 4,
    shortDescription:
      "A compact heating stove with an oval viewing glass, ornate scrollwork door and ventilated base.",
    description:
      "The Heritage Compact Stove brings the signature ARTLY door — an oval viewing glass framed in embossed scrollwork — to a compact body with a wide, flat top.\n\nBrushed metal knobs operate the door and the ventilated base, and the stove stands on sturdy legs.",
    specs: baseSpecs([
      { label: "Door", value: "Single door with oval viewing glass" },
    ]),
    features: [
      "Oval viewing glass framed by embossed scrollwork",
      "Wide flat top",
      "Ventilated base with control knob",
      "Brushed metal door knob",
      "Sturdy integrated legs",
    ],
    variations: ["Customisation available on request"],
    images: [
      { url: "/images/products/heritage-compact-stove-front.jpg", alt: "ARTLY Heritage Compact Stove with oval glass door, front view" },
    ],
  },
  {
    slug: "twin-door-oven-stove",
    name: "Twin Door Oven Stove",
    category: "cooking-stoves",
    featured: true,
    sortOrder: 1,
    shortDescription:
      "A wood oven stove with an upper oven compartment and a lower firebox, each behind its own glass door.",
    description:
      "The Twin Door Oven Stove combines heating and cooking in one upright unit. The lower door opens to the firebox, while the upper door gives access to a separate oven compartment — both with viewing glass framed in embossed scrollwork.\n\nA ventilated base with a brushed metal control knob and a flat top complete a design that is as practical as it is elegant.",
    specs: baseSpecs([
      { label: "Doors", value: "Two — upper oven and lower firebox, both glazed" },
      { label: "Oven compartment", value: TBC },
    ]),
    features: [
      "Separate oven compartment above the firebox",
      "Two glazed doors with embossed scrollwork",
      "Ventilated base with control knob",
      "Flat top surface",
      "Brushed metal door knobs",
    ],
    variations: ["Customisation available on request"],
    images: [
      { url: "/images/products/twin-door-oven-stove-front.jpg", alt: "ARTLY Twin Door Oven Stove with upper oven and lower firebox, front view" },
    ],
  },
];

const defaultSettings: Record<string, string> = {
  contactEmail: "",
  contactPhone: "",
  whatsappNumber: "",
  address: "",
  businessHours: "",
  mapEmbedUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
};

async function main() {
  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: c.slug } });
    const cat = existing ?? (await prisma.category.create({ data: c }));
    categoryIds[c.slug] = cat.id;
  }

  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        specs: JSON.stringify(p.specs),
        features: JSON.stringify(p.features),
        variations: JSON.stringify(p.variations),
        featured: p.featured,
        sortOrder: p.sortOrder,
        categoryId: categoryIds[p.category],
        images: { create: p.images.map((img, i) => ({ ...img, sortOrder: i })) },
      },
    });
  }

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
      await prisma.adminUser.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`Created admin user ${email}`);
    }
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin user created.");
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
