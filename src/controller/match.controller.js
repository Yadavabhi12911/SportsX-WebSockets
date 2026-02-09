import { createMatchSchema, listMatchesQuerySchema } from "../validators/matches.validation.js"
import { db } from '../database/db.js'
import { matches } from "../database/schema.js"
import { getMatchStatus } from "../utils/match.status.js"
import { desc } from "drizzle-orm"


const createMatch = async (req, res) => {

    const parsed = createMatchSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: parsed.error.issues
        })
    }

    const { startTime, endTime, homeScore, awayScore } = parsed.data

    try {

        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning()

        if (req.app.locals.broadcastMatchCreated) {
            req.app.locals.broadcastMatchCreated(event)
        }

        res.status(201).json({ data: event })

    } catch (error) {
        res.status(500).json({
            error: "Failed to create match",
            details: error.message
        })
    }
}


const getMatches = async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query)

    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues })
    }

    const Max_limit = parsed.data?.Max_limit
    const limit = Math.min(parsed.data.limit ?? 50, Max_limit)


    try {
        const data = await db
            .select()
            .from(matches)
            .orderBy(desc(matches.createdAt))
            .limit(limit)

        res.status(200).json({ data })
    } catch (error) {
        res.status(500).json({ error: "failed to list matches" })
    }
}
export { createMatch, getMatches }


