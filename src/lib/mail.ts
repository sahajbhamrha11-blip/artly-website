import "server-only";
import nodemailer from "nodemailer";

export function emailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.ENQUIRY_NOTIFY_TO);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendEnquiryNotification(e: {
  id: string;
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  interestedIn: string;
  message: string;
  productName?: string | null;
}) {
  if (!emailConfigured()) return false;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });

  const rows: [string, string][] = [
    ["Name", e.fullName],
    ["Company", e.companyName || "—"],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Interested in", e.interestedIn],
    ["Product", e.productName || "—"],
  ];
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.ENQUIRY_NOTIFY_TO,
    replyTo: e.email,
    subject: `New ARTLY enquiry — ${e.fullName} (${e.interestedIn})`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${e.message}\n\nView in admin: ${site}/admin/enquiries?id=${e.id}`,
    html: `<div style="font-family:Arial,sans-serif;color:#1a1a1a">
      <h2 style="margin:0 0 12px">New website enquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse">${rows
        .map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`)
        .join("")}</table>
      <p style="white-space:pre-wrap;border-left:3px solid #a31d24;padding-left:12px">${escapeHtml(e.message)}</p>
      <p><a href="${site}/admin/enquiries?id=${e.id}">Open in ARTLY admin</a></p></div>`,
  });
  return true;
}
