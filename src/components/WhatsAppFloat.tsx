import { getSettings } from "@/lib/settings";
import { whatsappHref } from "@/lib/utils";
import { WhatsApp } from "./Icons";

export async function WhatsAppFloat() {
  const s = await getSettings();
  const href = whatsappHref(s.whatsappNumber, "Hello ARTLY, I would like to know more about your fireplaces and cooking stoves.");
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with ARTLY on WhatsApp"
      className="fixed right-5 bottom-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:scale-105"
    >
      <WhatsApp className="h-7 w-7" />
    </a>
  );
}
