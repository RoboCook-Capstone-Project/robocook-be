import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import { uploadObject } from "../utils/cloudStorage.js";
import axios from "axios";

const prisma = new PrismaClient();

const getRecipes = catchAsync(async (req, res) => {
    const userId = req.user_id;
    let { page = 1, size = 10 } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    const userFavorites = await prisma.userFavorite.findMany({
        where: {
            user_id: userId,
        },
        select: {
            recipe_id: true,
        },
    });

    const start = (page - 1) * size + 1;
    const end = page * size;

    const i = Math.floor(start / 100);
    const newStart = start % 100 === 0 ? 100 : start % 100;
    const newEnd = end % 100 === 0 ? 100 : end % 100;
    let recipeId = 1;

    if (i < userFavorites.length) {
        recipeId = userFavorites[i].recipe_id;
    } else {
        recipeId = Math.floor(Math.random() * 15643 + 1);
    }

    let recipeIdsResult = [];

    try {
        const response = await axios.get(
            `${process.env.ML_SERVER_URL}/api/recipe-model/fyp?recipe_id=${recipeId}&start=${newStart}&end=${newEnd}`
        );
        recipeIdsResult = response.data;
    } catch (e) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "There are some error, please try again later!"
        );
    }

    const result = await prisma.$transaction([
        prisma.recipe.findMany({
            where: {
                id: {
                    in: recipeIdsResult,
                },
            },
            select: {
                id: true,
                title: true,
                ingredients: true,
                steps: true,
                image_url: true,
                author: true, // Include the author details
            },
        }),

        prisma.recipe.count(),
    ]);

    const recipes = result[0].map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        author: recipe.author?.name || null,
        image_url: recipe.image_url,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
    }));

    recipes.forEach((recipe) => {
        recipe.ingredients = recipe.ingredients.replaceAll("--", "\n");
        recipe.steps = recipe.steps.replaceAll("--", "\n");
    });

    const total = Math.ceil(result[1] / size);

    return ApiResponse(res, httpStatus.OK, "Success get recipes data!", {
        recipeList: recipes,
        pageMeta: { current_page: page, total_page: total, page_size: size },
    });
});

const createRecipe = catchAsync(async (req, res) => {
    const userId = req.user_id;
    let { title, ingredients, steps } = req.body;
    let image_url = null;

    if (req.file) {
        image_url = await uploadObject(req.file, "recipe-thumbnails/");
    } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image is required!");
    }

    ingredients = ingredients.replaceAll(/\n|\./g, "--");
    steps = steps.replaceAll(/\n|\./g, "--");

    const recipe = await prisma.recipe.create({
        data: {
            title,
            author_id: userId,
            ingredients,
            steps,
            image_url,
        },
        select: {
            id: true,
            title: true,
            author: true,
            image_url: true,
            ingredients: true,
            steps: true,
        },
    });

    if (!recipe) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Error create recipe!"
        );
    }

    recipe.ingredients = recipe.ingredients.replaceAll("--", "\n");
    recipe.steps = recipe.steps.replaceAll("--", "\n");
    recipe.author = recipe.author.name;

    return ApiResponse(res, httpStatus.CREATED, "Recipe created successfully", {
        recipe: recipe,
    });
});

const getRecipe = catchAsync(async (req, res) => {
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: id,
        },
        select: {
            id: true,
            title: true,
            author: true,
            image_url: true,
            ingredients: true,
            steps: true,
        },
    });

    if (!recipe) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            `No recipe found by id ${id}!`
        );
    }

    recipe.ingredients = recipe.ingredients.replaceAll("--", "\n");
    recipe.steps = recipe.steps.replaceAll("--", "\n");
    recipe.author = recipe.author.name;

    return ApiResponse(res, httpStatus.OK, "Recipe fetched successfully", {
        recipe: recipe,
    });
});

const getToasty = catchAsync(async (req, res) => {
    const recipe_count = await prisma.recipe.count();
    const random_recipe = Math.floor(Math.random() * recipe_count + 1);

    let recipe = await prisma.recipe.findMany({
        take: 1,
        skip: random_recipe - 1,
        select: {
            id: true,
            title: true,
            author: true,
            image_url: true,
            ingredients: true,
            steps: true,
        },
    });

    recipe = recipe.at(0);

    if (!recipe) {
        return ApiResponse(res, httpStatus.OK, "No recipe available yet!");
    }

    recipe.ingredients = recipe.ingredients.replaceAll("--", "\n");
    recipe.steps = recipe.steps.replaceAll("--", "\n");
    recipe.author = recipe.author.name;

    return ApiResponse(res, httpStatus.OK, "Recipe fetched successfully", {
        recipe: recipe,
    });
});

const getSearchRecipes = catchAsync(async (req, res) => {
    let { page = 1, size = 10, keyword } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    const result = await prisma.$transaction([
        prisma.recipe.findMany({
            take: size,
            skip: (page - 1) * size,
            where: {
                OR: [
                    {
                        title: {
                            contains: keyword,
                        },
                    },
                    {
                        ingredients: {
                            contains: keyword,
                        },
                    },
                ],
            },
            select: {
                id: true,
                title: true,
                ingredients: true,
                steps: true,
                image_url: true,
                author: true, // Include the author details
            },
        }),

        prisma.recipe.count({
            where: {
                OR: [
                    {
                        title: {
                            contains: keyword,
                        },
                    },
                    {
                        ingredients: {
                            contains: keyword,
                        },
                    },
                ],
            },
        }),
    ]);

    const recipes = result[0].map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        author: recipe.author?.name || null,
        image_url: recipe.image_url,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
    }));

    recipes.forEach((recipe) => {
        recipe.ingredients = recipe.ingredients.replaceAll("--", "\n");
        recipe.steps = recipe.steps.replaceAll("--", "\n");
    });

    const total = Math.ceil(result[1] / size);

    return ApiResponse(
        res,
        httpStatus.OK,
        recipes.length
            ? `Success get recipes data by ${keyword} keyword!`
            : `No recipes found by ${keyword} keyword!`,
        {
            recipeList: recipes,
            pageMeta: {
                current_page: page,
                total_page: total,
                page_size: size,
            },
        }
    );
});

const getFusionRecipes = catchAsync(async (req, res) => {
    const userId = req.user_id;
    let { first_recipe_id: firstRecipeId, second_recipe_id: secondRecipeId } =
        req.query;

    const recipeIds = [parseInt(firstRecipeId), parseInt(secondRecipeId)];

    const recipeIngredients = await prisma.recipe.findMany({
        where: {
            id: {
                in: recipeIds,
            },
        },
        select: {
            ingredients: true,
        },
    });

    const ingredient1 =
        recipeIngredients.length > 0
            ? recipeIngredients[0].ingredients
            : "Ayam Ikan Daging Telur";
    const ingredient2 =
        recipeIngredients.length > 1
            ? recipeIngredients[1].ingredients
            : "Kambing Sapi Udang Tahu Tempe Tofu";

    let recipeIdsResult = [];

    try {
        const response = await axios.post(
            `${process.env.ML_SERVER_URL}/api/recipe-model/fusion`,
            {
                ingredient1,
                ingredient2,
            }
        );
        recipeIdsResult = response.data;
    } catch (e) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "There are some error, please try again later!"
        );
    }

    const result = await prisma.recipe.findMany({
        where: {
            id: {
                in: recipeIdsResult,
            },
        },
        select: {
            id: true,
            title: true,
            ingredients: true,
            steps: true,
            image_url: true,
            author: true, // Include the author details
        },
    });

    const recipes = result.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        author: recipe.author?.name || null,
        image_url: recipe.image_url,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
    }));

    recipes.forEach((recipe) => {
        recipe.ingredients = recipe.ingredients.replaceAll("--", "\n");
        recipe.steps = recipe.steps.replaceAll("--", "\n");
    });

    return ApiResponse(
        res,
        httpStatus.OK,
        "Success get recipes data from fusion!",
        {
            recipeList: recipes,
        }
    );
});

const getFavorites = catchAsync(async (req, res) => {
    const userId = req.user_id;

    const result = await prisma.userFavorite.findMany({
        where: {
            user_id: userId,
        },
        select: {
            recipe: true,
        },
    });

    const recipes = result.map((favorite) => ({
        id: favorite.recipe.id,
        title: favorite.recipe.title,
        author: favorite.recipe.author_id,
        image_url: favorite.recipe.image_url,
        ingredients: favorite.recipe.ingredients,
        steps: favorite.recipe.steps,
    }));

    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const author = await prisma.user.findUnique({
            where: {
                id: recipe.author,
            },
            select: {
                name: true,
            },
        });
        recipe.author = author.name;
        recipe.ingredients = recipe.ingredients.replaceAll("--", "\n");
        recipe.steps = recipe.steps.replaceAll("--", "\n");
    }

    return ApiResponse(
        res,
        httpStatus.OK,
        recipes.length
            ? "Recipes fetched successfully"
            : "No favorite recipes yet!",
        {
            recipeList: recipes,
        }
    );
});

const addFavoriteRecipe = catchAsync(async (req, res) => {
    const userId = req.user_id;
    let { recipe_id } = req.body;

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: recipe_id,
        },
    });

    if (!recipe) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            `No recipe found by id ${recipe_id}!`
        );
    }

    const favorite = await prisma.userFavorite.findFirst({
        where: {
            recipe_id,
            user_id: userId,
        },
    });

    if (favorite) {
        return ApiResponse(
            res,
            httpStatus.OK,
            "Recipe already exists in favorites"
        );
    }

    const user_favorite = await prisma.userFavorite.create({
        data: {
            recipe_id,
            user_id: userId,
        },
    });

    if (!user_favorite) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Error adding recipe to favorites!"
        );
    }

    return ApiResponse(
        res,
        httpStatus.CREATED,
        "Added recipe to favorites successfully"
    );
});

export default {
    getRecipes,
    createRecipe,
    getRecipe,
    getToasty,
    getSearchRecipes,
    getFusionRecipes,
    getFavorites,
    addFavoriteRecipe,
};
