import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/tasks/status-badge";
import type { Task, TaskStatus } from "@/schemas/task";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function isOverdue(task: Task): boolean {
  return (
    task.dueDate !== null &&
    task.status !== "DONE" &&
    task.dueDate.slice(0, 10) < new Date().toISOString().slice(0, 10)
  );
}

function DueDate({ task }: { task: Task }) {
  if (!task.dueDate) {
    return <span className="text-slate-500">No due date</span>;
  }

  const overdue = isOverdue(task);

  return (
    <span className={overdue ? "font-medium text-red-600" : "text-slate-700"}>
      {dateFormatter.format(new Date(task.dueDate))}
      {overdue && <span className="hidden sm:inline"> · Overdue</span>}
      {overdue && <span className="sr-only">, overdue</span>}
    </span>
  );
}

export function TaskTableSkeleton() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div className="flex h-11 items-center gap-8 border-b bg-slate-50 px-5">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex h-[62px] items-center gap-8 border-b px-5 last:border-0"
          >
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <Skeleton className="mb-3 h-4 w-2/3" />
            <Skeleton className="mb-4 h-3 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Task
              </TableHead>
              <TableHead className="h-11 w-40 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-11 w-44 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Due date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="h-[62px]">
                <TableCell className="max-w-0 px-5 py-3">
                  <p className="truncate font-semibold text-slate-800">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {task.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <DueDate task={task} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="break-words font-semibold text-slate-800">
              {task.title}
            </h2>
            {task.description && (
              <p className="mt-1 break-words text-sm text-slate-500">
                {task.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={task.status} />
              <span className="text-sm">
                <DueDate task={task} />
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function TaskListError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl border border-red-200 bg-white px-5 py-12 text-center"
    >
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle aria-hidden="true" className="size-5" />
      </span>
      <h2 className="font-semibold text-slate-900">Couldn&apos;t load tasks</h2>
      <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-4 rounded-md px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50"
      >
        {isRetrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}

export function TaskListEmpty({
  status,
  onClearFilter,
  onCreateTask,
}: {
  status: TaskStatus | undefined;
  onClearFilter: () => void;
  onCreateTask: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
      <Badge className="mb-3 border-0 bg-violet-50 px-3 py-1 text-violet-700">
        {status ? "No matching tasks" : "No tasks yet"}
      </Badge>
      <p className="max-w-sm text-sm text-slate-600">
        {status
          ? "There are no tasks with this status. Choose another filter to see more."
          : "Create a task to start organizing your work."}
      </p>
      {status && (
        <button
          type="button"
          onClick={onClearFilter}
          className="mt-3 rounded-md px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          Clear filter
        </button>
      )}
      {!status && (
        <Button type="button" className="mt-4" onClick={onCreateTask}>
          Create task
        </Button>
      )}
    </div>
  );
}
