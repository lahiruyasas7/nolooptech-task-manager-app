import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/schemas/task";

const statusPresentation: Record<
  TaskStatus,
  { label: string; className: string; dotClassName: string }
> = {
  TODO: {
    label: "To do",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    dotClassName: "bg-slate-500",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    dotClassName: "bg-amber-600",
  },
  DONE: {
    label: "Done",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    dotClassName: "bg-emerald-600",
  },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const presentation = statusPresentation[status];

  return (
    <Badge
      className={`gap-1.5 border-0 ${presentation.className}`}
      aria-label={`Status: ${presentation.label}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${presentation.dotClassName}`}
      />
      {presentation.label}
    </Badge>
  );
}
