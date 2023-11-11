import express from "express";

import { userController } from "../controllers/index.js";
import { userValidation } from "../validations/index.js";
import validate from "../middlewares/validate.js";
import auth from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter
    .route("/")
    .get(userController.getUsers)
    .post(validate(userValidation.createUser), userController.createUser);

userRouter
    .route("/:id")
    // Example of authentication layer
    // .get(auth, validate(userValidation.getUserById), userController.getUserById)
    .get(validate(userValidation.getUserById), userController.getUserById)
    .put(validate(userValidation.updateUser), userController.updateUser)
    .delete(validate(userValidation.deleteUser), userController.deleteUser);

userRouter
    .route("/:id/posts")
    .get(validate(userValidation.getUserPosts), userController.getUserPosts);

userRouter
    .route("/:id/drafts")
    .get(validate(userValidation.getUserDrafts), userController.getUserDrafts);

export default userRouter;
