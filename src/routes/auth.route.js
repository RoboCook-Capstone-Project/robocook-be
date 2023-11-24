import express from "express";

import { authController } from "../controllers/index.js";
import validate from "../middlewares/validate.js";
import { authValidation } from "../validations/index.js";

const authRouter = express.Router();

authRouter
    .route("/register")
    .post(validate(authValidation.register), authController.register);

authRouter
    .route("/login")
    .post(validate(authValidation.login), authController.login);

authRouter.post("/logout", authController.logout);
authRouter.post("/refresh-tokens", authController.refreshTokens);
authRouter.post("/verify-email", authController.verifyEmail);

export default authRouter;
