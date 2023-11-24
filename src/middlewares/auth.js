import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import { tokenService } from "../services/index.js";
import catchAsync from "../utils/catchAsync.js";

const auth = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Authentication is required!"
        );
    }

    const token = authHeader.split(" ")[1];
    const payload = await tokenService.verifyToken(token);

    req.user_id = payload.sub;

    next();
});

export default auth;
