"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  taskSchema,
  taskListSchema,
  type CreateTaskInput,
  type TaskSort,
  type TaskStatus,
} from "@/schemas/task";

export type TaskFilters = {
  status?: TaskStatus;
  sort?: TaskSort;
};

export const taskQueryKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters) =>
    [
      ...taskQueryKeys.all,
      { status: filters.status ?? null, sort: filters.sort ?? null },
    ] as const,
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskQueryKeys.list(filters),
    queryFn: async ({ signal }) => {
      const response = await api.get<unknown>("/tasks", {
        params: {
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.sort ? { sort: filters.sort } : {}),
        },
        signal,
      });

      return taskListSchema.parse(response);
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: CreateTaskInput) => {
      const response = await api.post<unknown, CreateTaskInput>("/tasks", task);
      return taskSchema.parse(response);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
  });
}
