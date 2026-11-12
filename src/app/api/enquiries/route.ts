import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquirySchema } from "@/lib/validation";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { sendEnquiryNotification } from "@/lib/mail";

export const runtime = "nodejs";

const MIN_FILL_MS = 2500; // humans take longer than this to fill the form

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const ip = await clientIp();
  const ipHash = hashIp(ip);
  const limit = rateLimit(`enquiry:${ipHash}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "You've sent several enquiries in a short time. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot filled → pretend success so bots learn nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return NextResponse.json({ ok: true, message: "Thank you — we have received your enquiry." });
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0]);
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return NextResponse.json({ ok: false, message: "Please check the highlighted fields.", fieldErrors }, { status: 422 });
  }

  const data = parsed.data;
  if (data.startedAt && Date.now() - data.startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true, message: "Thank you — we have received your enquiry." });
  }
  const linkCount = (data.message.match(/https?:\/\//gi) ?? []).length;
  if (linkCount > 3) {
    return NextResponse.json({ ok: false, message: "Please remove links from your message and try again." }, { status: 422 });
  }

  try {
    const product = data.productSlug
      ? await db.product.findUnique({ where: { slug: data.productSlug }, select: { id: true, name: true } })
      : null;

    const enquiry = await db.enquiry.create({
      data: {
        fullName: data.fullName,
        companyName: data.companyName,
        phone: data.phone,
        email: data.email,
        interestedIn: data.interestedIn,
        message: data.message,
        productId: product?.id,
        sourcePage: data.sourcePage,
        ipHash,
      },
    });

    try {
      const sent = await sendEnquiryNotification({ ...enquiry, productName: product?.name });
      if (sent) await db.enquiry.update({ where: { id: enquiry.id }, data: { emailSent: true } });
    } catch (err) {
      // The enquiry is safely stored; email failure must not fail the request.
      console.error("[enquiry] email notification failed:", err);
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you — we have received your enquiry and will be in touch shortly.",
    });
  } catch (err) {
    console.error("[enquiry] failed to save:", err);
    return NextResponse.json(
      { ok: false, message: "We couldn't send your enquiry right now. Please try again shortly." },
      { status: 500 },
    );
  }
}
