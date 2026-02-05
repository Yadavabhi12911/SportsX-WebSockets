import { text, serial, pgTable, pgEnum, timestamp, integer } from "drizzle-orm/pg-core"

const matchStatusEnum = pgEnum("match_status", ['scheduled', 'live', 'finished'])

export const matches = pgTable('matches', {
    id: serial('id').primaryKey(),
    sport: text('sport').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    status: matchStatusEnum('status').default('scheduled').notNull(),
    startTime: timestamp('start_time'),
    endTime: timestamp('end_time'),
    homeScore: integer('home_score').notNull().default(0),
    awayScore: integer('away_score').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow()

});

export const commentry = pgTable('commentary', {
    id: serial('id').primaryKey(),
    matchId: integer('match_id').notNull().references(() => matches.id),
    minute: integer('minute'),
    sequence: integer('sequence'),
    period: integer('peroid'),
    eventType: text('event_type'),
    actor: text('actor'),
    team: text('team'),
    message: text('message').notNull(),
    metadata: jsonb('metadata'),
    tags: text('tags').array(),
    createdAt: timestamp('created_at').notNull().defaultNow(),

});


