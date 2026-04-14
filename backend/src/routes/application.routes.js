import { Router } from "express";
import { applyForJobController,handleGetApplications } from "../controller/application.controller.js";
const applicationRouter = Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";

applicationRouter.get('/job/:jobId',authMiddleware,applyForJobController);

applicationRouter.get('/applications/:jobId',authMiddleware,handleGetApplications)


export default applicationRouter;