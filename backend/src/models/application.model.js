import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({

    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "job",
        required: true
    },

    resumeUrl: {
        type: String, // store file URL (Cloudinary/S3)
        required: true
    },

    // 🔥 RAG OUTPUT FIELDS
    matchScore: {
        type: Number, // 0-10
        default: 0
    },

    matchedSkills: [{
        type: String
    }],

    missingSkills: [{
        type: String
    }],

    experienceGap: {
        type: String // e.g. "2 years less experience"
    },

    aiFeedback: {
        type: String
    },

    status: {
        type: String,
        enum: ["applied", "reviewed", "shortlisted", "rejected"],
        default: "applied"
    }

}, {
    timestamps: true
});


applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

const applicationModel = mongoose.model("application", applicationSchema);
export default applicationModel;