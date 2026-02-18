import { Router } from "express";
import { db } from "../database/db.js";
import { commentary } from "../database/schema.js";
import { createCommentarySchema } from "../validation/comentary.js";
import { matchIdParamSchema, listMatchesQuerySchema } from "../validators/matches.validation.js";
import { desc, asc, eq } from "drizzle-orm";

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {
    try {
        // Validate request parameters (match ID)
        const params = matchIdParamSchema.safeParse(req.params);
        const body = createCommentarySchema.safeParse(req.body);

        if (!params.success) {
            return res.status(400).json({ success: false, errors: params.error.issues });
        }

        if (!body.success) {
            return res.status(400).json({ success: false, errors: body.error.issues });
        }

        const { minutes, ...rest } = body.data
        const [result] = await db.insert(commentary).values({
            matchId: params.data.id,
            minute: minutes,
            ...rest,
        }).returning();

        // Broadcast new commentary to subscribed websocket clients (if websocket server attached)
        if (req.app?.locals?.broadcastCommentry) {
            try {
                req.app.locals.broadcastCommentry(params.data.id, result)
            } catch (err) {
                console.error('Failed to broadcast commentary:', err)
            }
        }

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                errors: error.errors,
            });
        }

        console.error("Error creating commentary:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.get('/', async (req, res) => {
    try {
        // Validate request parameters (match ID)
        const params = matchIdParamSchema.safeParse(req.params);

        // Validate query (limit)
        const query = listMatchesQuerySchema.safeParse(req.query);

        if (!params.success) {
            return res.status(400).json({ success: false, errors: params.error.issues });
        }

        if (!query.success) {
            return res.status(400).json({ success: false, errors: query.error.issues });
        }

        const limit = Math.min(query.data.limit ?? 50, 1000);
        const order = (req.query.order === 'asc') ? asc(commentary.createdAt) : desc(commentary.createdAt);

        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, params.data.id))
            .orderBy(order)
            .limit(limit);

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error listing commentary:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;