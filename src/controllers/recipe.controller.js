import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import { uploadObject } from "../utils/cloudStorage.js";

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

const createRecipe = catchAsync(async (req, res) => {
    const userId = req.user_id;
    let { title, ingredients, steps } = req.body;
    let image_url = null;

    if (req.file) {
        image_url = await uploadObject(req.file, "recipe-thumbnails/");
    } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image is required!");
    }

    ingredients = ingredients.replaceAll("\n", "--");
    ingredients = ingredients.replaceAll(".", "--");

    steps = steps.replaceAll("\n", "--");
    steps = steps.replaceAll(".", "--");

    let recipe = await prisma.recipe.create({
        data: {
            title,
            author_id: userId,
            ingredients,
            steps,
            image_url,
        },
    });

    if (!recipe) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error create recipe!");
    }

    const recipe_author = await prisma.user.findUnique({
        where: {
            id: recipe.author_id,
        },
        select: {
            name: true,
        },
    });

    recipe = (({ 
        id,
        title,
        image_url,
        ingredients,
        steps 
    }) => ({ 
        id,
        title,
        author: recipe_author.name,
        image_url,
        ingredients,
        steps 
    }))(recipe);

    return ApiResponse(
        res,
        httpStatus.CREATED,
        "Recipe created successfully",
        {
            recipe : recipe
        }
    );

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

export default { 
    getRecipes, 
    createRecipe,
    getSearchRecipes, 
    getFusionRecipes 
};
