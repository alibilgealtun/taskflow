import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '@/features/auth/schemas';
import { createTaskSchema, updateTaskSchema } from '@/features/tasks/schemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 6 characters', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates matching passwords', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createTaskSchema', () => {
    it('validates valid task data with optional due date', () => {
      const result = createTaskSchema.safeParse({
        title: 'Complete task challenge',
        description: 'Detailed instructions',
        status: 'in_progress',
        priority: 'high',
        due_date: '2026-09-04',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = createTaskSchema.safeParse({
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects title longer than 200 chars', () => {
      const result = createTaskSchema.safeParse({
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid date format', () => {
      const result = createTaskSchema.safeParse({
        title: 'Test date',
        due_date: '04/09/2026',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid calendar date like Feb 31', () => {
      const result = createTaskSchema.safeParse({
        title: 'Test invalid calendar date',
        due_date: '2026-02-31',
      });
      expect(result.success).toBe(false);
    });

    it('accepts a due date with hour and minute', () => {
      const result = createTaskSchema.safeParse({
        title: 'Timed task',
        due_date: '2026-09-04T14:30',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an invalid hour', () => {
      const result = createTaskSchema.safeParse({
        title: 'Bad hour',
        due_date: '2026-09-04T25:00',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an invalid minute', () => {
      const result = createTaskSchema.safeParse({
        title: 'Bad minute',
        due_date: '2026-09-04T14:60',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('requires valid UUID', () => {
      const result = updateTaskSchema.safeParse({
        id: 'not-a-uuid',
        title: 'Valid title',
        status: 'pending',
        priority: 'none',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid UUID and fields', () => {
      const result = updateTaskSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Valid title',
        status: 'completed',
        priority: 'medium',
        due_date: '2026-10-15',
      });
      expect(result.success).toBe(true);
    });
  });
});
