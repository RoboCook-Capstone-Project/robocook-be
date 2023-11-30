import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";

const prisma = new PrismaClient();

const getRecipes = catchAsync(async (req, res) => {
    const userId = req.user_id;
    let { page = 1, size = 10 } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    // TODO: Validate user id token!!

    // TODO: Get result from ML model

    const result = await prisma.$transaction([
        prisma.recipe.findMany({
            take: size,
            skip: (page - 1) * size,
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

    const total = Math.ceil(result[1] / size);

    return ApiResponse(res, httpStatus.OK, "Success get recipes data!", {
        recipeList: recipes,
        pageMeta: { current_page: page, total_page: total, page_size: size },
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

    firstRecipeId = parseInt(firstRecipeId);
    secondRecipeId = parseInt(secondRecipeId);

    const result = await prisma.$transaction([
        prisma.recipe.findMany({
            take: 10,
            skip: 0,
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
    let { page = 1, size = 10 } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    const result = await prisma.$transaction([
        prisma.userFavorite.findMany({
            take: size,
            skip: (page - 1) * size,
            where: {
                user_id: userId
            },
            select: {
                recipe: true
            },
        }),

        prisma.userFavorite.count({
            where: {
                user_id: userId
            }
        }),
    ]);

    const recipes = result[0].map((favorite) => ({
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
                id: recipe.author
            },
            select: {
                name: true
            }
        });
        recipe.author = author.name;
    }

    const total = Math.ceil(result[1] / size);

    return ApiResponse(res, httpStatus.OK,
        recipes.length
            ? "Recipes fetched successfully"
            : "No favorite recipes yet!", 
        {
            recipeList: recipes,
            pageMeta: { current_page: page, total_page: total, page_size: size },
        }
    );
});

export default { 
    getRecipes,
    getSearchRecipes,
    getFusionRecipes,
    getFavorites,
};
