import { Router, type IRouter } from "express";
import healthRouter from "./health";
import affirmationsRouter from "./affirmations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(affirmationsRouter);

export default router;
