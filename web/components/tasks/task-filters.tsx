"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { TaskSort, TaskStatus } from "@/schemas/task";

const statusFilters = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
] as const;

type Props = {
  status: TaskStatus | undefined;
  counts: Record<"ALL" | TaskStatus, number>;
  sort: TaskSort | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
  onSortToggle: () => void;
};

export function TaskFilters({
  status,
  counts,
  sort,
  onStatusChange,
  onSortToggle,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={status ?? "ALL"}
        onValueChange={(value) => {
          if (typeof value !== "string") return;
          if (value === "ALL") {
            onStatusChange(undefined);
          } else if (statusFilters.some((filter) => filter.value === value)) {
            onStatusChange(value as TaskStatus);
          }
        }}
        className="min-w-0"
      >
        <TabsList
          aria-label="Filter tasks by status"
          className="group-data-horizontal/tabs:h-auto grid w-full grid-cols-2 justify-start gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:flex sm:w-fit"
        >
          {statusFilters.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="group h-9 w-full min-w-0 flex-none gap-2 rounded-lg px-3 text-xs data-active:bg-violet-600 data-active:text-white sm:w-auto sm:text-sm"
            >
              {filter.label}
              <span
                className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] leading-none text-slate-500 group-data-[active]:bg-white/20 group-data-[active]:text-white"
                aria-label={`${counts[filter.value]} tasks`}
              >
                {counts[filter.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        type="button"
        variant="outline"
        onClick={onSortToggle}
        aria-label={`Sort by due date${sort === "asc" ? ", ascending" : sort === "desc" ? ", descending" : ", unsorted"}`}
        className="h-10 w-full justify-between border-slate-200 bg-white px-3 sm:w-auto sm:justify-center"
      >
        <span className="text-muted-foreground">Sort by</span>
        <span className="font-medium text-foreground">Due date</span>
        {sort === "asc" ? (
          <ArrowUp aria-hidden="true" className="size-4 text-violet-600" />
        ) : sort === "desc" ? (
          <ArrowDown aria-hidden="true" className="size-4 text-violet-600" />
        ) : (
          <ArrowUpDown aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  );
}
