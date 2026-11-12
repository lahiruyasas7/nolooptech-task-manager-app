"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { TaskFilters } from "@/components/tasks/task-filters";
import {
  TaskListEmpty,
  TaskListError,
  TaskTable,
  TaskTableSkeleton,
} from "@/components/tasks/task-table";
import { useTasks } from "@/hooks/use-tasks";
import type { TaskSort, TaskStatus } from "@/schemas/task";

export function TaskList() {
  const [status, setStatus] = useState<TaskStatus>();
  const [sort, setSort] = useState<TaskSort>();

  const tasksQuery = useTasks({ status, sort });
  const allTasksQuery = useTasks();

  const counts = useMemo(() => {
    const tasks = allTasksQuery.data ?? [];
    return {
      ALL: tasks.length,
      TODO: tasks.filter((task) => task.status === "TODO").length,
      IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      DONE: tasks.filter((task) => task.status === "DONE").length,
    };
  }, [allTasksQuery.data]);

  const retryMessage =
    tasksQuery.error instanceof Error
      ? tasksQuery.error.message
      : "Please check your connection and try again.";

  function toggleSort() {
    setSort((current) =>
      current === undefined ? "asc" : current === "asc" ? "desc" : undefined,
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-2.5 px-4 sm:px-6">
          <span className="flex size-7 items-center justify-center rounded-lg bg-violet-600 text-white">
            <Check aria-hidden="true" className="size-4 stroke-[3]" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900">
            Task Manager
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-4 pb-10 pt-7 sm:px-6 sm:pt-9">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {allTasksQuery.isLoading
              ? "Loading your tasks…"
              : `${counts.ALL} ${counts.ALL === 1 ? "task" : "tasks"} · ${counts.IN_PROGRESS} in progress · ${counts.DONE} done`}
          </p>
        </div>

        <TaskFilters
          status={status}
          counts={counts}
          sort={sort}
          onStatusChange={setStatus}
          onSortToggle={toggleSort}
        />

        <section className="mt-5" aria-label="Tasks">
          {tasksQuery.isPending ? (
            <TaskTableSkeleton />
          ) : tasksQuery.isError ? (
            <TaskListError
              message={retryMessage}
              onRetry={() => void tasksQuery.refetch()}
              isRetrying={tasksQuery.isFetching}
            />
          ) : tasksQuery.data.length === 0 ? (
            <TaskListEmpty
              status={status}
              onClearFilter={() => setStatus(undefined)}
            />
          ) : (
            <TaskTable tasks={tasksQuery.data} />
          )}
        </section>

        {!tasksQuery.isPending && !tasksQuery.isError && (
          <p className="mt-4 text-xs text-slate-500" aria-live="polite">
            Showing {tasksQuery.data?.length ?? 0}
            {status ? ` ${status.toLowerCase().replace("_", " ")} ` : " "}
            {tasksQuery.data?.length === 1 ? "task" : "tasks"}
          </p>
        )}
      </main>
    </div>
  );
}
