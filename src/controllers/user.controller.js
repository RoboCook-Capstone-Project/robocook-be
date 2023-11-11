import httpStatus from "http-status";

import { PrismaClient } from "@prisma/client";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
const prisma = new PrismaClient();

const getUsers = catchAsync(async (req, res) => {
    const users = await prisma.user.findMany();
    return ApiResponse(res, httpStatus.OK, "Success get users data!", users);
});

const getUserById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return ApiResponse(res, httpStatus.OK, "Success get user data!", user);
});

const createUser = catchAsync(async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
            },
        });

        return ApiResponse(
            res,
            httpStatus.CREATED,
            "Success create user!",
            user
        );
    } catch (error) {
        if (error.code === "P2002") {
            throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
        }
    }
});

const updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
            },
        });

        return ApiResponse(res, httpStatus.OK, "Success update user!", user);
    } catch (error) {
        if (error.code === "P2002") {
            throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
        }
    }
});

const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { id: Number(id) },
        });

        return ApiResponse(res, httpStatus.OK, "Success delete user!");
    } catch (error) {
        console.log(error);
        if (error.code === "P2025") {
            throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
        }
    }
});

const getUserPosts = catchAsync(async (req, res) => {
    const { id } = req.params;
    const posts = await prisma.user
        .findUnique({
            where: { id: Number(id) },
        })
        .posts({
            where: { published: true },
        });

    if (!posts) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return ApiResponse(res, httpStatus.OK, "Success get user posts!", posts);
});

const getUserDrafts = catchAsync(async (req, res) => {
    const { id } = req.params;
    const drafts = await prisma.user
        .findUnique({
            where: { id: Number(id) },
        })
        .posts({
            where: { published: false },
        });

    if (!drafts) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return ApiResponse(res, httpStatus.OK, "Success get user drafts!", drafts);
});

export default {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserPosts,
    getUserDrafts,
};
