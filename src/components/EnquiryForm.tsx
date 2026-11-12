"use client";

import { useEffect, useRef, useState } from "react";
import { enquirySchema, INTEREST_OPTIONS } from "@/lib/validation";
import { ArrowRight, Check } from "./Icons";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<string, string>>;
type Status = "idle" | "submitting" | "success" | "error";

export function EnquiryForm({
  product,
  defaultInterest,
  tone = "light",
  sourcePage,
}: {
  product?: { slug: string; name: string } | null;
  defaultInterest?: (typeof INTEREST_OPTIONS)[number];
  tone?: "light" | "dark";
  sourcePage?: string;
}) {
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverMessage, setServerMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "success") successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") ?? ""),
      companyName: String(fd.get("companyName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      interestedIn: String(fd.get("interestedIn") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
      productSlug: product?.slug ?? "",
      sourcePage: sourcePage ?? (typeof window !== "undefined" ? window.location.pathname : ""),
      startedAt: startedAt.current,
    };

    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const fe: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      const first = Object.keys(fe)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");
    setServerMessage("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; fieldErrors?: Errors };
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setServerMessage(data.message || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setServerMessage(data.message || "Thank you — we have received your enquiry.");
      formRef.current?.reset();
    } catch {
      setServerMessage("We couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const dark = tone === "dark";
  const labelCls = cn("field-label", dark && "!text-steel");
  const fieldCls = cn("field", dark && "!border-paper/15 !bg-graphite !text-paper focus:!border-paper/60");

  if (status === "success") {
    return (
      <div ref={successRef} role="status" className={cn("flex flex-col items-start gap-5 border p-10", dark ? "border-paper/15 text-paper" : "border-stone bg-linen")}>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red text-paper">
          <Check className="h-5 w-5" />
        </span>
        <h3 className="text-3xl">Thank you.</h3>
        <p className={cn("max-w-md leading-relaxed", dark ? "text-steel" : "text-metal")}>{serverMessage}</p>
        <button type="button" className={dark ? "btn-outline-light" : "btn-outline-dark"} onClick={() => { setStatus("idle"); startedAt.current = Date.now(); }}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-2 text-[13px] text-red-bright">
        {errors[name]}
      </p>
    ) : null;

  const a11y = (name: string) => ({
    "aria-invalid": errors[name] ? ("true" as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6 sm:grid-cols-2" aria-label="Enquiry form">
      {product && (
        <div className={cn("sm:col-span-2 flex items-center gap-3 border-l-2 border-red py-2 pl-4 text-[14px]", dark ? "text-paper/80" : "text-charcoal/80")}>
          Enquiring about: <strong className="font-semibold">{product.name}</strong>
        </div>
      )}

      <div>
        <label htmlFor="fullName" className={labelCls}>Full name *</label>
        <input id="fullName" name="fullName" autoComplete="name" className={fieldCls} required maxLength={100} {...a11y("fullName")} />
        {err("fullName")}
      </div>
      <div>
        <label htmlFor="companyName" className={labelCls}>Company name <span className="normal-case tracking-normal">(optional)</span></label>
        <input id="companyName" name="companyName" autoComplete="organization" className={fieldCls} maxLength={120} {...a11y("companyName")} />
        {err("companyName")}
      </div>
      <div>
        <label htmlFor="phone" className={labelCls}>Phone number *</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={fieldCls} required maxLength={20} {...a11y("phone")} />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="email" className={labelCls}>Email address *</label>
        <input id="email" name="email" type="email" autoComplete="email" className={fieldCls} required maxLength={160} {...a11y("email")} />
        {err("email")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="interestedIn" className={labelCls}>Interested in *</label>
        <select id="interestedIn" name="interestedIn" className={cn(fieldCls, "appearance-none")} defaultValue={defaultInterest ?? ""} required {...a11y("interestedIn")}>
          <option value="" disabled>Select an option</option>
          {INTEREST_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {err("interestedIn")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className={labelCls}>Message *</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={cn(fieldCls, "resize-y")}
          required
          maxLength={3000}
          defaultValue={product ? `I'm interested in the ${product.name}. ` : ""}
          {...a11y("message")}
        />
        {err("message")}
      </div>

      {/* Honeypot — hidden from people, tempting for bots */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn("text-[13px]", dark ? "text-steel" : "text-metal")}>
          We use your details only to respond to your enquiry.
        </p>
        <button type="submit" className="btn-primary" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              Send enquiry <ArrowRight />
            </>
          )}
        </button>
      </div>

      {status === "error" && serverMessage && (
        <p role="alert" className="border border-red/40 bg-red/5 px-4 py-3 text-[14px] text-red sm:col-span-2">
          {serverMessage}
        </p>
      )}
    </form>
  );
}
