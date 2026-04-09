import applicationModel from "../models/application.model.js";
import JobModel from "../models/jobs.model.js";
import { matchJob } from "../services/AI-Service/ai.service.js";
import { parseResume } from "../services/AI-Service/ai.service.js";

const MATCH_THRESHOLD = 0.65;

export async function applyForJobController(req,res) {
    // const {id} = req.user;
    // const {jobId} = req.params;
    const resume = req.file;
    // console.log(resume)
    const resumeData = await parseResume(resume);
    console.log("resumeData",resumeData);

}

