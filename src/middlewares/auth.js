import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import { tokenService } from "../services/index.js";

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Token not found!");
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = await tokenService.verifyToken(token, "ACCESS");
    } catch (error) {
        next(error);
    }

    next();
};

export default auth;
