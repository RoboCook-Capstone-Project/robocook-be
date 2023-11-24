import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import { authService, tokenService } from "../services/index.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const prisma = new PrismaClient();

const register = catchAsync(async (req, res) => {
    const { email, name, password } = req.body;

    const userExists = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (userExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
        },
        select: {
            name: true,
            email: true,
        },
    });

    return ApiResponse(res, httpStatus.CREATED, "Success register user!", {
        user,
    });
});

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await authService.loginUserWithEmailAndPassword(
        email,
        password
    );

    if (!user) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Incorrect email or password"
        );
    }

    user.token = await tokenService.generateAuthTokens(user);

    return ApiResponse(res, httpStatus.OK, "Success login!", {
        user,
    });
});

const logout = catchAsync(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    return ApiResponse(res, httpStatus.OK, "Success logout!");
});

const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    return ApiResponse(res, httpStatus.OK, "Success refresh token!", {
        ...tokens,
    });
});

const verifyEmail = catchAsync(async (req, res) => {
    await authService.verifyEmail(req.body.token);
    return ApiResponse(res, httpStatus.OK, "Success verify email!");
});

export default { register, login, logout, refreshTokens, verifyEmail };
