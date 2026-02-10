import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../database/db.js";
import { commentary } from "../database/schema.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/comentary.js";
import { matchIdParamSchema } from "../validators/matches.validation.js";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
    try {
        // Validate request parameters (match ID)
        const params = matchIdParamSchema.parse(req.params);

        // Validate request query (limit)
        const query = listCommentaryQuerySchema.parse(req.query);

        // Set limit with safety cap
        const MAX_LIMIT = 100;
        const limit = Math.min(query.limit || 100, MAX_LIMIT);

        // Fetch commentaries for the match, ordered by newest first
        const results = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, params.id))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                errors: error.errors,
            });
        }

        console.error("Error fetching commentaries:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post("/", async (req, res) => {
    try {
        // Validate request parameters (match ID)
        const params = matchIdParamSchema.parse(req.params);

        // Validate request body (commentary entries)
        const body = createCommentarySchema.parse(req.body);

        const result = await db.insert(commentary).values({
            matchId: params.id,
            ...body,
        }).returning();

        res.status(201).json({
            success: true,
            data: result[0],
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

export default router;