"use client";

import { useState, useTransition } from "react";
import { changePasswordAction, type ActionState } from "../../actions";

export function PasswordForm() {
  const [state, setState] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-10 bg-paper p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const res = await changePasswordAction(null, fd);
          setState(res);
          if (res?.ok) form.reset();
        });
      }}
    >
      <h2 className="text-2xl">Change admin password</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="pw-current" className="field-label">Current password</label>
          <input id="pw-current" name="current" type="password" autoComplete="current-password" required className="field" />
        </div>
        <div>
          <label htmlFor="pw-next" className="field-label">New password</label>
          <input id="pw-next" name="next" type="password" autoComplete="new-password" minLength={10} required className="field" />
        </div>
        <div>
          <label htmlFor="pw-confirm" className="field-label">Confirm new</label>
          <input id="pw-confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required className="field" />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
        {state?.message && <p role="status" className={state.ok ? "text-[14px] text-[#1f7a4d]" : "text-[14px] text-red"}>{state.message}</p>}
        <button type="submit" disabled={pending} className="btn-dark !py-3">{pending ? "Updating…" : "Update password"}</button>
      </div>
    </form>
  );
}
