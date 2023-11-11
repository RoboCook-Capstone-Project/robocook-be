import express from "express";

import { postController } from "../controllers/index.js";
import { postValidation } from "../validations/index.js";
import validate from "../middlewares/validate.js";

const postRouter = express.Router();

postRouter
    .route("/")
    .get(postController.getPosts)
    .post(validate(postValidation.createPost), postController.createPost);

postRouter
    .route("/:id")
    .delete(validate(postValidation.deletePost), postController.deletePost);

export default postRouter;
