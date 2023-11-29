import express from "express";

import { recipeController } from "../controllers/index.js";
import validate from "../middlewares/validate.js";
import recipeValidation from "../validations/recipe.validation.js";
import auth from "../middlewares/auth.js";

const recipeRouter = express.Router();

recipeRouter
    .route("/")
    .get(
        auth,
        validate(recipeValidation.forYouPage),
        recipeController.getRecipes
    );

recipeRouter
    .route("/toasty")
    .get(
        auth,
        recipeController.getToasty
    );

recipeRouter
    .route("/search")
    .get(
        auth,
        validate(recipeValidation.searchRecipes),
        recipeController.getSearchRecipes
    );

recipeRouter
    .route("/fusion")
    .get(
        auth,
        validate(recipeValidation.fusionRecipes),
        recipeController.getFusionRecipes
    );

export default recipeRouter;
