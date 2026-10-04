import { Router, type IRouter } from "express";
import { chooseAffirmation } from "@workspace/affirmations";

const router: IRouter = Router();

router.get("/affirmations/random", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    res.json(chooseAffirmation());
  } catch (err) {
    req.log.error({ err }, "Could not dispense an affirmation");
    res.status(503).json({ error: "The affirmation machine needs a little care. Please try again later." });
  }
});

router.all("/affirmations/random", (_req, res) => {
  res.setHeader("Allow", "GET");
  res.status(405).json({ error: "Method not allowed." });
});

export default router;