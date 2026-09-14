import { Router, type IRouter } from "express";
import healthRouter from "./health";
import zubaanRouter from "./zubaan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(zubaanRouter);

export default router;
