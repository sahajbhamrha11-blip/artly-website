"use client";

import { useState, useTransition } from "react";
import { deleteEnquiryAction, updateEnquiryAction, type ActionState } from "../../actions";
import { ENQUIRY_STATUSES } from "@/lib/validation";
import { STATUS_LABELS } from "../StatusBadge";

export function EnquiryEditor({ id, status, notes }: { id: string; status: string; notes: string }) {
  const [state, setState] = useState<ActionState>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="mt-6 space-y-4 border-t border-stone pt-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => setState(await updateEnquiryAction(null, fd)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="status" className="field-label">Status</label>
        <select id="status" name="status" defaultValue={status} className="field !py-2.5">
          {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="adminNotes" className="field-label">Internal notes</label>
        <textarea id="adminNotes" name="adminNotes" rows={3} defaultValue={notes} className="field" placeholder="Visible only to admins" />
      </div>
      {state?.message && <p role="status" className={state.ok ? "text-[14px] text-[#1f7a4d]" : "text-[14px] text-red"}>{state.message}</p>}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-[12px] font-semibold tracking-[0.15em] text-red uppercase"
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this enquiry permanently? This cannot be undone.")) start(() => deleteEnquiryAction(id));
          }}
        >
          Delete
        </button>
        <button type="submit" disabled={pending} className="btn-dark !py-3">{pending ? "Saving…" : "Update"}</button>
      </div>
    </form>
  );
}
