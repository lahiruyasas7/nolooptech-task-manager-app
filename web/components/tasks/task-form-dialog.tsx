"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import {
  taskFormSchema,
  toCreateTaskInput,
  toUpdateTaskInput,
  type Task,
  type TaskFormValues,
} from "@/schemas/task";

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  status: "TODO",
  dueDate: "",
};

function getStatusLabel(value: unknown): string {
  switch (value) {
    case "TODO":
      return "To do";
    case "IN_PROGRESS":
      return "In progress";
    case "DONE":
      return "Done";
    default:
      return "Select status";
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
};

function getTaskFormValues(task?: Task): TaskFormValues {
  if (!task) return defaultValues;

  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    dueDate: task.dueDate?.slice(0, 10) ?? "",
  };
}

export function TaskFormDialog({ open, onOpenChange, task }: Props) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });
  const isPending =
    createTask.isPending || updateTask.isPending || isSubmitting;

  useEffect(() => {
    if (open) reset(getTaskFormValues(task));
  }, [open, reset, task]);

  function handleOpenChange(nextOpen: boolean) {
    if (isPending && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  async function handleSave(values: TaskFormValues) {
    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          task: toUpdateTaskInput(values),
        });
        toast.success("Task updated successfully.");
      } else {
        await createTask.mutateAsync(toCreateTaskInput(values));
        toast.success("Task created successfully.");
      }
      reset(defaultValues);
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to ${task ? "update" : "create"} task.`,
      );
    }
  }

  const action = task ? "Save changes" : "Create task";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg"
        showCloseButton={!isPending}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {task ? "Edit task" : "Create task"}
          </DialogTitle>
          <DialogDescription>
            {task
              ? "Update the details for this task."
              : "Add the details for your new task."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleSave)}
          className="grid gap-4"
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              autoFocus
              maxLength={200}
              placeholder="What needs to be done?"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "task-title-error" : undefined}
              disabled={isPending}
              {...register("title")}
            />
            {errors.title && (
              <p id="task-title-error" className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              maxLength={2000}
              placeholder="Add more details (optional)"
              rows={4}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "task-description-error" : undefined
              }
              disabled={isPending}
              {...register("description")}
            />
            {errors.description && (
              <p
                id="task-description-error"
                className="text-sm text-destructive"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <Label htmlFor="task-status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="task-status"
                      className="w-full"
                      aria-invalid={Boolean(errors.status)}
                      aria-describedby={
                        errors.status ? "task-status-error" : undefined
                      }
                      onBlur={field.onBlur}
                    >
                      <SelectValue>{getStatusLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p id="task-status-error" className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="grid content-start gap-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={
                  errors.dueDate ? "task-due-date-error" : undefined
                }
                disabled={isPending}
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p
                  id="task-due-date-error"
                  className="text-sm text-destructive"
                >
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (task ? "Saving…" : "Creating…") : action}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
