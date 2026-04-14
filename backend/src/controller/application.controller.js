import applicationModel from "../models/application.model.js";
import JobModel from "../models/jobs.model.js";
import UserModel from "../models/user.model.js";
import { matchJob } from "../services/AI-Service/ai.service.js";
import { compareCandidateAndRecrutor } from "../services/AI-Service/resume.extraction.service.js";


export async function applyForJobController(req, res) {
    try {

        const { id } = req.user;

        const { jobId } = req.params;

        const isAlreadyApplied = await applicationModel.findOne({ job: jobId, candidate: id })

        if (isAlreadyApplied) {
            return res.status(200).json({ success: true, message: "You already Applied for this job" })
        }

        const user = await UserModel.findById(id);

        if (!user.resumeUrl) {
            return res.status(400).json({
                success: false,
                message: "Please upload resume first"
            });
        }
        const job = await JobModel.findById(jobId)

        let matchScore = await matchJob(user.resumeParsedData.skills, jobId)
        matchScore = (matchScore*10).toFixed(1)


        const comparison = await compareCandidateAndRecrutor(
            JSON.stringify(user.resumeParsedData),
            JSON.stringify(job)
        );

        await applicationModel.create({
            candidate: id,
            job: jobId,
            resumeUrl: user.resumeUrl, // reuse
            matchScore,
            matchedSkills: comparison.matchSkills,
            missingSkills: comparison.missingSkills,
            experienceGap: comparison.experienceGap,
            aiFeedback: comparison.feedback
        });

        return res.status(201).json({ success: true, message: "Your application is Submitted" })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Error while applying job" });
    }

}

export async function handleGetApplications(req,res) {
    try{

        const {role} = req.user;
        const {jobId} = req.params;
        const applications = await applicationModel.find({job:jobId}).populate("candidate");
        if(role === 'candidate'){
            return res.status(200).json({success:true,message:"Total applications fetched",length:applications.length})
        }
        
        return res.status(200).json({
            success:true,
            message:"Total applications fetched",
            length:applications.length,
            applications:applications.map(app => {
                return {    
                    id:app._id,
                    candidateName:app.candidate.username,
                    candidateEmail:app.candidate.email,
                    resumeUrl:app.resumeUrl,
                    matchScore:app.matchScore,
                    matchedSkills:app.matchedSkills,
                    missingSkills:app.missingSkills,
                    experienceGap:app.experienceGap,
                    aiFeedback:app.aiFeedback,
                    status:app.status
                }
            })
        })
        
    }catch(err){
        console.error(err);
        return res.status(500).json({success:false,message:"Error while getting Applications"});
    }


}

