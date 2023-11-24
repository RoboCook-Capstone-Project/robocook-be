import express from "express";

import { recipeController } from "../controllers/index.js";
import validate from "../middlewares/validate.js";
import recipeValidation from "../validations/recipe.validation.js";

const recipeRouter = express.Router();

recipeRouter
    .route("/")
    .get(validate(recipeValidation.forYouPage), recipeController.getRecipes);

export default recipeRouter;
