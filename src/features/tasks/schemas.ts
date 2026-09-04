import { z } from 'zod';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isValidCalendarDate(val: string): boolean {
  const parts = val.split('-');
  if (parts.length !== 3) return false;
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, monthIndex, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
  );
}

function isValidDueDate(val: string): boolean {
  if (DATE_ONLY.test(val)) {
    return isValidCalendarDate(val);
  }

  if (!DATE_TIME.test(val)) {
    return false;
  }

  const [datePart, timePart] = val.split('T');
  if (!datePart || !timePart) {
    return false;
  }

  const [hourText, minuteText] = timePart.split(':');
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  if (hours > 23 || minutes > 59) {
    return false;
  }

  return isValidCalendarDate(datePart);
}

const dueDateSchema = z
  .string()
  .refine(
    (val) => DATE_ONLY.test(val) || DATE_TIME.test(val),
    'Invalid date format (must be YYYY-MM-DD or YYYY-MM-DDTHH:mm)'
  )
  .refine(isValidDueDate, 'Invalid calendar date or time')
  .optional()
  .nullable();

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z.string().optional().nullable(),
  status: z
    .enum(['backlog', 'pending', 'in_progress', 'completed', 'cancelled'])
    .default('pending'),
  priority: z.enum(['none', 'low', 'medium', 'high']).default('none'),
  due_date: dueDateSchema,
});

export const updateTaskSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z.string().optional().nullable(),
  status: z.enum(['backlog', 'pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['none', 'low', 'medium', 'high']),
  due_date: dueDateSchema,
});

export const updateStatusSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
  status: z.enum(['backlog', 'pending', 'in_progress', 'completed', 'cancelled']),
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
