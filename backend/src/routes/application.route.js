import { Router } from "express";
import { applyForJobController } from "../controller/application.controller.js";
const applyRouter = Router();
import multer from 'multer'


const upload = multer({Storage:multer.memoryStorage()});

applyRouter.post('/job/:jobId',upload.single('resume'),applyForJobController);


export default applyRouter;