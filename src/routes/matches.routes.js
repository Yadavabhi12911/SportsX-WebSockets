
import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { createMatchSchema } from "../validators/matches.validation.js";
import { createMatch, getMatches } from "../controller/match.controller.js";

const router = Router()

router.get("/", (req, res) => {
    res.status(200).json({message:"Matches List"})
})

router.get("/get-matches", getMatches)
router.post("/create-match", createMatch)


export default router
