import express from "express";

import { authController } from "../controllers/index.js";

const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refresh-tokens", authController.refreshTokens);
authRouter.post("/verify-email", authController.verifyEmail);

export default authRouter;
