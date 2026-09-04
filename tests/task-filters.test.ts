import { describe, expect, it } from 'vitest';
import { taskFilterSchema } from '@/features/tasks/queries';

/** URL search params reach the page as unknown values. Bad input must not drop good input. */
describe('taskFilterSchema', () => {
  it('keeps valid status and priority', () => {
    expect(
      taskFilterSchema.parse({ status: 'pending', priority: 'high' })
    ).toEqual({
      status: 'pending',
      priority: ['high'],
    });
  });

  it('reads a comma separated priority list', () => {
    expect(taskFilterSchema.parse({ priority: 'high,low' })).toEqual({
      status: undefined,
      priority: ['high', 'low'],
    });
  });

  it('reads a repeated priority key', () => {
    expect(taskFilterSchema.parse({ priority: ['high', 'medium'] })).toEqual({
      status: undefined,
      priority: ['high', 'medium'],
    });
  });

  it('drops a bad priority and keeps the good one', () => {
    expect(taskFilterSchema.parse({ priority: 'high,bogus' })).toEqual({
      status: undefined,
      priority: ['high'],
    });
  });

  it('drops an invalid status but keeps a valid priority', () => {
    expect(taskFilterSchema.parse({ status: 'bogus', priority: 'low' })).toEqual(
      {
        status: undefined,
        priority: ['low'],
      }
    );
  });

  it('takes the first value when the status key repeats in the URL', () => {
    expect(taskFilterSchema.parse({ status: ['completed', 'pending'] })).toEqual(
      {
        status: 'completed',
        priority: [],
      }
    );
  });

  it('returns empty filters for unknown input', () => {
    expect(taskFilterSchema.parse({ status: 42, priority: null })).toEqual({
      status: undefined,
      priority: [],
    });
  });

  it('returns empty filters when no params are present', () => {
    expect(taskFilterSchema.parse({})).toEqual({
      status: undefined,
      priority: [],
    });
  });
});
