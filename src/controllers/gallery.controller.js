import { PrismaClient } from "@prisma/client";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import {
    deleteObject,
    deleteObjects,
    uploadObjects,
} from "../utils/cloudStorage.js";

const prisma = new PrismaClient();

const getGalleries = catchAsync(async (req, res) => {
    const galleries = await prisma.gallery.findMany();
    return ApiResponse(
        res,
        httpStatus.OK,
        "Success get galleries data!",
        galleries
    );
});

const createGalleries = catchAsync(async (req, res) => {
    try {
        const { authorId } = req.body;

        let imageUrls = [];

        if (req.files) {
            imageUrls = await uploadObjects(req.files, "galleries/");
        }

        const galleries = await prisma.gallery.createMany({
            data: imageUrls.map((url) => ({
                imageUrl: url,
                authorId: parseInt(authorId),
            })),
        });

        if (!galleries) {
            throw new ApiError(httpStatus.BAD_GATEWAY, "Error create gallery!");
        }

        return ApiResponse(
            res,
            httpStatus.OK,
            "Success create a gallery",
            galleries
        );
    } catch (error) {
        throw new ApiError(httpStatus.BAD_GATEWAY, "EROROROOROR");
    }
});

const deleteGallery = catchAsync(async (req, res) => {
    const { id } = req.params;

    const gallery = await prisma.gallery.findUnique({
        where: {
            id: parseInt(id),
        },
    });

    if (!gallery) {
        throw new ApiError(httpStatus.NOT_FOUND, "Gallery not found!");
    }

    if (gallery.imageUrl) {
        await deleteObject(gallery.imageUrl);
    }

    const deletedGallery = await prisma.gallery.delete({
        where: {
            id: parseInt(id),
        },
    });

    return ApiResponse(
        res,
        httpStatus.OK,
        "Success delete a gallery",
        deletedGallery
    );
});

const deleteUserGallery = catchAsync(async (req, res) => {
    const { authorId } = req.params;

    const galleries = await prisma.gallery.findMany({
        where: {
            authorId: parseInt(authorId),
        },
    });

    if (!galleries) {
        throw new ApiError(httpStatus.NOT_FOUND, "Gallery not found!");
    }

    const imageUrls = galleries.map((gallery) => gallery.imageUrl);

    const deletedGalleries = await prisma.gallery.deleteMany({
        where: {
            authorId: parseInt(authorId),
        },
    });

    if (imageUrls) {
        await deleteObjects(imageUrls);
    }

    return ApiResponse(
        res,
        httpStatus.OK,
        "Success delete a gallery",
        deletedGalleries
    );
});

export default {
    getGalleries,
    createGalleries,
    deleteGallery,
    deleteUserGallery,
};
