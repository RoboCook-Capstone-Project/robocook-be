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

const addFavoriteRecipe = catchAsync(async (req, res) => {
    const userId = req.user_id;
    let { recipe_id } = req.body;

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: recipe_id
        },
    });

    if (!recipe) {
        throw new ApiError(httpStatus.NOT_FOUND, `No recipe found by id ${recipe_id}!`);
    }

    const user_favorite = await prisma.userFavorite.create({
        data: {
            recipe_id,
            user_id: userId
        },
    });

    if (!user_favorite) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error adding recipe to favorites!");
    }

    return ApiResponse(
        res,
        httpStatus.CREATED,
        "Added recipe to favorites successfully",
    );

});

export default { 
    getRecipes, 
    getSearchRecipes, 
    getFusionRecipes,
    addFavoriteRecipe,
};
