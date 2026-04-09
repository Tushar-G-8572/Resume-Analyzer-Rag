import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export async function authMiddleware(req, res, next) {
    try {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();

    } catch (err) {
        console.error("Auth Middleware Error:", err);

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}