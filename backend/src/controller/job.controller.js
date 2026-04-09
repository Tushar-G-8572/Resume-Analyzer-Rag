import JobModel from "../models/jobs.model.js";
import { buildJobText, storeJobEmbeddings } from "../services/AI-Service/ai.service.js";

export async function createJobController(req, res) {
    try {

        const { role } = req.user;
        const { id } = req.user;
        if (role !== 'recruiter') {
            return res.status(403).json({ success: false, message: "Unauthorised" })
        }

        const { title, company, location,salary, description, skillsRequired, experienceRequired } = req.body;

        const jobCreated = await JobModel.create({
            title,
            company,
            location,
            description,
            skillsRequired,
            salary,
            experienceRequired,
            recruiter: id,
            status: "open",
            embeddingId: ""
        })

        const jobText = buildJobText(jobCreated);
        console.log("jobText",jobText);
        const embeddingId = await storeJobEmbeddings(
            jobCreated._id,
            jobText,
            {
                title,
                company,
                status: "open"  // store for filtering later
            }
        )

        console.log(embeddingId);

        jobCreated.embeddingId = embeddingId;
        await jobCreated.save();

        return res.status(201).json({
            success: true,
            message: "Job created and indexed successfully",
            data: jobCreated
        });


    } catch (err) {
        console.error(err)
    }
}

export async function getAllJobs(req, res) {
    try {
        console.log("Get Jobs hit")
        const jobs = await JobModel.find({})
        console.log(jobs)
        if (jobs.length === 0) return res.status(200).json({ success: true, message: "No jobs created Yet" })

        return res.status(200).json({ success: true, message: " all Jobs found ", data: jobs })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "error while fetching JOBS" });
    }

}

export async function getSpecificJobController(req, res) {
    try {

        const { jobTitle } = req.params;

        if (!jobTitle) return res.status(400).json({ success: false, message: "Job title needed to find jobs" })

        const jobs = await JobModel.find({ title: jobTitle }).lean();

        if (!jobs) return res.status(200).json({ success: false, message: "No jobs found for this jobTitle" })

        return res.status(200).json({ success: true, message: "Job found", data: jobs })


    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error while fetching jobs" })
    }

}

export async function getJobBYSkillController(req, res) {
    try {
        const { skills } = req.params;
        if (!skills) return res.status(400).json({ success: false, message: "Skill needed for job search" })

        const jobs = await JobModel.find({ skillsRequired: skills })
        if (!jobs) return res.status(200).json({ success: true, message: "No jobs found with this skill set" });

        return res.status(200).json({ success: true, message: "Jobs found with relevent skill", jobs: jobs })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "error while fetching jobs based on Skillset" })
    }
}