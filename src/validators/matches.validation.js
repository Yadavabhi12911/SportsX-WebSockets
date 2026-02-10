import { z } from 'zod'

export const statusEnum = z.enum(['scheduled', 'live', 'finished'])

export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1),
    homeTeam: z.string().trim().min(1),
    awayTeam: z.string().trim().min(1),
    status: statusEnum.optional(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => data.homeTeam !== data.awayTeam, {
    message: 'Home and away teams must be different',
    path: ['awayTeam'],
  })


export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
})

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional()
})

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
})

