"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="mt-10 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state?.message && !state.ok && (
        <p role="alert" className="border border-red/30 bg-red/5 px-4 py-3 text-[14px] text-red">{state.message}</p>
      )}
      <button type="submit" disabled={pending} className="btn-dark w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
