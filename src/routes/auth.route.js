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

export default authRouter;
