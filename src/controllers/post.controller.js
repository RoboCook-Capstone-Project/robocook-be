import { PrismaClient } from "@prisma/client";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import { uploadObject, deleteObject } from "../utils/cloudStorage.js";

const prisma = new PrismaClient();

const getPosts = catchAsync(async (req, res) => {
    const posts = await prisma.post.findMany();
    return ApiResponse(res, httpStatus.OK, "Success get posts data!", posts);
});

const createPost = catchAsync(async (req, res) => {
    try {
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadObject(req.file, "posts/");
        }

        const { title, content, published, authorId } = req.body;

        const post = await prisma.post.create({
            data: {
                title,
                content,
                published,
                authorId,
                imageUrl,
            },
        });

        if (!post) {
            throw new ApiError(httpStatus.BAD_GATEWAY, "Error create post!");
        }

        return ApiResponse(res, httpStatus.OK, "Success create a post", post);
    } catch (error) {
        throw new ApiError(httpStatus.BAD_GATEWAY, "EROROROOROR");
    }
});

const deletePost = catchAsync(async (req, res) => {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
        where: {
            id: parseInt(id),
        },
    });

    if (!post) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post not found!");
    }

    if (post.imageUrl) {
        await deleteObject(post.imageUrl);
    }

    const deletedPost = await prisma.post.delete({
        where: {
            id: parseInt(id),
        },
    });

    return ApiResponse(res, httpStatus.OK, "Success delete post!", deletedPost);
});

export default { getPosts, createPost, deletePost };
