import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import multer from "multer";
import jwt from "jsonwebtoken";

const errorConverter = (error, req, res, next) => {
    if (!(error instanceof ApiError)) {
        let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;

        if (
            error instanceof multer.MulterError ||
            error instanceof jwt.JsonWebTokenError
        ) {
            statusCode = httpStatus.BAD_REQUEST;
        }

        const message = error.message || httpStatus[`${statusCode}_MESSAGE`];
        error = new ApiError(statusCode, message, false, error.stack);
    }
    next(error);
};

const errorHandler = (error, req, res, next) => {
    res.status(error.statusCode || 500).json({
        timestamp: Date.now(),
        status: error.statusCode,
        error: error.error,
        message: error.message,
        stack: error.stack,
        path: req.path,
    });
};

export { errorHandler, errorConverter };
