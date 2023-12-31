import Joi from "joi";

const forYouPage = {
    query: Joi.object().keys({
        page: Joi.number().integer(),
        size: Joi.number().integer().max(100),
    }),
};

const createRecipe = {
    body: Joi.object().keys({
        title: Joi.string().required(),
        ingredients: Joi.string().required(),
        steps: Joi.string().required(),
    }),
};

const getRecipe = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const searchRecipes = {
    query: Joi.object().keys({
        keyword: Joi.string().min(1).required(),
        page: Joi.number().integer(),
        size: Joi.number().integer(),
    }),
};

const fusionRecipes = {
    query: Joi.object().keys({
        first_recipe_id: Joi.number().integer().required(),
        second_recipe_id: Joi.number().integer().required(),
    }),
};

const addFavoriteRecipe = {
    body: Joi.object().keys({
        recipe_id: Joi.number().integer().required(),
    }),
};

export default {
    forYouPage,
    createRecipe,
    getRecipe,
    searchRecipes,
    fusionRecipes,
    addFavoriteRecipe,
};
