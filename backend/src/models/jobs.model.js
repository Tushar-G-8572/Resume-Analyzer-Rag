import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Job title is required"],
        trim: true
    },

    company: {
        type: String,
        required: [true, "Company name is required"],
        trim: true
    },

    location: {
        type: String,
        default: "Remote"
    },

    description: {
        type: String,
        required: [true, "Job description is required"]
    },

    skillsRequired: [{
        type: String,
        required: true
    }],

    experienceRequired: {
        type: Number, // in years
        required: true
    },

    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    embeddingId: {
        type: String // reference to vector DB (Pinecone/Chroma)
    },

    // Optional: store chunks for debugging
    jdChunks: [{
        type: String
    }],

    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    }

}, {
    timestamps: true
});


jobSchema.index({ title: "text", description: "text" });

const JobModel = mongoose.model("job", jobSchema);
export default JobModel;