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
    .route("/")
    .post(
        auth,
        validate(recipeValidation.createRecipe),
        recipeController.createRecipe
    );

recipeRouter.route("/toasty").get(auth, recipeController.getToasty);

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

recipeRouter
    .route("/favorites")
    .get(
        auth,
        validate(recipeValidation.getFavorites),
        recipeController.getFavorites
    );

recipeRouter
    .route("/favorites")
    .post(
        auth,
        validate(recipeValidation.addFavoriteRecipe),
        recipeController.addFavoriteRecipe
    );

recipeRouter
    .route("/:id")
    .get(
        auth,
        validate(recipeValidation.getRecipe),
        recipeController.getRecipe
    );

export default recipeRouter;