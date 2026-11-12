"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "artly-cookie-notice";

/**
 * The site only uses strictly necessary storage (this notice preference and,
 * for administrators, a login cookie). No analytics or tracking cookies are
 * set, so a simple notice — not a consent wall — is appropriate.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {}
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 z-[70] animate-fade-up sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md"
    >
      <div className="border border-paper/10 bg-charcoal/95 p-6 text-paper shadow-2xl backdrop-blur">
        <p className="text-[14px] leading-relaxed text-paper/80">
          We only use essential cookies needed for this website to work. No tracking or advertising cookies.{" "}
          <Link href="/privacy" className="text-paper underline underline-offset-4 hover:text-ember">
            Privacy &amp; cookies
          </Link>
        </p>
        <button type="button" onClick={dismiss} className="btn-primary mt-5 !py-3">
          Understood
        </button>
      </div>
    </div>
  );
}
