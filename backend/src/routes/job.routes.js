import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { createJobController,getSpecificJobController,getAllJobs, getJobBYSkillController } from "../controller/job.controller.js";

const jobRouter = Router();


jobRouter.post('/create-job',authMiddleware,createJobController)

jobRouter.get('/get-jobs',authMiddleware,getAllJobs)

jobRouter.get('/job/:jobTitle',authMiddleware,getSpecificJobController)

jobRouter.get('/job/skill/:skills',authMiddleware,getJobBYSkillController);

export default jobRouter;