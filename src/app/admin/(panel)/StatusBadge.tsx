import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  NEW: "bg-red text-paper",
  IN_PROGRESS: "bg-ember/15 text-clay",
  RESOLVED: "bg-[#1f7a4d]/12 text-[#1f7a4d]",
  ARCHIVED: "bg-sand text-metal",
};

export const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  ARCHIVED: "Archived",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-block px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase", STYLES[status] ?? "bg-sand")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
