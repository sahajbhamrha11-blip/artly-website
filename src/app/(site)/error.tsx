"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center bg-paper">
      <div className="container-x py-24 text-center">
        <p className="eyebrow justify-center text-red">Something went wrong</p>
        <h1 className="mt-5 text-5xl">We couldn&apos;t load this page.</h1>
        <p className="mx-auto mt-5 max-w-md text-metal">Please try again in a moment. If the problem continues, contact us and we&apos;ll help.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button type="button" onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-outline-dark">Back to home</Link>
        </div>
        {error.digest && <p className="mt-8 text-[12px] text-steel">Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
