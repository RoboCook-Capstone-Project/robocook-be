import express from "express";

import { recipeController } from "../controllers/index.js";

const recipeRouter = express.Router();

recipeRouter.route("/").get(recipeController.getRecipes);

export default recipeRouter;
