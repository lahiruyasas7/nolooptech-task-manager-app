"use client";

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTask } from "@/hooks/use-tasks";
import type { Task } from "@/schemas/task";

type Props = {
  task: Task | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskDialog({ task, open, onOpenChange }: Props) {
  const deleteTask = useDeleteTask();

  async function handleDelete() {
    if (!task) return;

    try {
      await deleteTask.mutateAsync(task.id);
      toast.success("Task deleted successfully.");
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete task.",
      );
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (deleteTask.isPending && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            {task
              ? `“${task.title}” will be permanently deleted. This action cannot be undone.`
              : "This task will be permanently deleted. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTask.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={deleteTask.isPending || !task}
          >
            {deleteTask.isPending ? "Deleting…" : "Delete task"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
