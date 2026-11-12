import { z } from "zod";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

const isoDateSchema = z.iso.date();
const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const taskSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: taskStatusSchema,
  dueDate: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const taskListSchema = z.array(taskSchema);

const taskInputFields = {
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  status: taskStatusSchema.optional(),
};

const apiDueDateSchema = z.union([isoDateSchema, isoDateTimeSchema, z.null()]);

export const createTaskSchema = z.object({
  ...taskInputFields,
  dueDate: apiDueDateSchema.optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskFormSchema = z.object({
  ...taskInputFields,
  status: taskStatusSchema,
  dueDate: z.union([z.literal(""), isoDateSchema]),
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskSort = "asc" | "desc";
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;

function toUtcIsoDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export function toCreateTaskInput(values: TaskFormValues): CreateTaskInput {
  const { dueDate, ...taskFields } = values;

  return createTaskSchema.parse({
    ...taskFields,
    ...(dueDate ? { dueDate: toUtcIsoDate(dueDate) } : {}),
  });
}

export function toUpdateTaskInput(values: TaskFormValues): UpdateTaskInput {
  const { dueDate, ...taskFields } = values;

  return updateTaskSchema.parse({
    ...taskFields,
    dueDate: dueDate ? toUtcIsoDate(dueDate) : null,
  });
}
