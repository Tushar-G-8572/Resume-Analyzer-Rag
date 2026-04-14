import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import { parseResume } from "../services/AI-Service/ai.service.js";
import { storeResumeAndGetUrl } from "../services/ImageKit-Services/storage.service.js";
import { extractionResumeData } from "../services/AI-Service/resume.extraction.service.js";


export async function handleRegisterController(req, res) {
    try {
        let { username, email, password, role } = req.body;

        email = email.toLowerCase();

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // ✅ Create user
        const user = await userModel.create({
            username,
            email,
            password,
            role
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Register Error:", err);

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error while registering user"
        });
    }
}

export async function handleLoginController(req, res) {
    try {
        let { email, password } = req.body;

        email = email.toLowerCase();

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"2d"
            }
        );

        res.cookie("token", token);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login Error:", err);

        return res.status(500).json({
            success: false,
            message: "Error while logging in user"
        });
    }
}

export async function handleGetMeController(req, res) {
    try {
        const { id } = req.user;

        const user = await userModel
            .findById(id)
            .select("username email role")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("GetMe Error:", err);

        return res.status(500).json({
            success: false,
            message: "Error while fetching user"
        });
    }
}

export async function handleLogoutController(req, res) {
    try {
        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (err) {
        console.error("Logout Error:", err);

        return res.status(500).json({
            success: false,
            message: "Error while logging out"
        });
    }
}

export async function handleUplaodResume(req,res) {
    try{

        const {id,role} = req.user;
        // console.log(id,role)
        if(role === 'recruiter'){
        return res.status(403).json({success:false,message:"Unauthorised"});
    }

    const resume = req.file
    const buffer = resume.buffer;
    // console.log(buffer);
    const resumeUrl = await storeResumeAndGetUrl(buffer);

    const resumeData = await parseResume(resume);
    const aiSummary = await extractionResumeData(resumeData);

    await userModel.findByIdAndUpdate(id,{
        resumeUrl:resumeUrl,
        resumeParsedData:aiSummary
    })
    
    return res.status(201).json({success:true,message:"Resume Uploaded"})
}catch(error){
    console.error(error);
    return res.status(500).json({success:false,message:"Error while uploading resume"});
}
}