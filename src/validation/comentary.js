import { z } from 'zod';

/**
 * Schema for listing commentaries with limit validation
 */
export const listCommentaryQuerySchema = z.object({
    limit: z.coerce.number().positive().max(100).optional(),
});

/**
 * Schema for creating a new commentary entry
 */
export const createCommentarySchema = z.object({
    minute: z.number().int().nonnegative(),
    sequence: z.coerce.number().int().nonnegative(),
    period: z.coerce.number().int().nonnegative(),
    eventType: z.string(),
    actor: z.string(),
    team: z.string(),
    message: z.string().min(1, 'Message is required'),
    metadata: z.record(z.any()),
    tags: z.array(z.string()),
});
