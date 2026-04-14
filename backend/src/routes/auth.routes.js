import { Router } from "express";
import { handleGetMeController, handleLoginController, handleLogoutController,handleUplaodResume, handleRegisterController } from "../controller/auth.controller.js";
import { registerValidator,loginValidation } from "../validators/auth.validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import multer from "multer";

const authRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

authRouter.post('/register',registerValidator,handleRegisterController);

authRouter.post('/upload',upload.single('resume'),authMiddleware,handleUplaodResume);

authRouter.post('/login',loginValidation,handleLoginController);

authRouter.post('/logout',authMiddleware,handleLogoutController);

authRouter.get('/get-me',authMiddleware,handleGetMeController);

export default authRouter;