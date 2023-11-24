import httpStatus from "http-status";
import tokenService from "./token.service.js";
import ApiError from "../utils/ApiError.js";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
        },
    });

    if (!user) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Incorrect email or password"
        );
    }

    const passwordMatch = await bcrypt.compare(password, user?.password);

    if (!passwordMatch) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Incorrect email or password"
        );
    }

    user.password = undefined;

    return user;
};

const logout = async (refreshToken) => {
    try {
        const refreshTokenDoc = await prisma.token.findUnique({
            where: {
                token: refreshToken,
            },
        });

        await prisma.token.delete({
            where: {
                id: refreshTokenDoc.id,
            },
        });
    } catch (error) {
        throw new ApiError(httpStatus.NOT_FOUND, "Token not found!");
    }
};

const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(
            refreshToken,
            "REFRESH"
        );

        console.log(refreshTokenDoc);

        const user = await prisma.user.findUnique({
            where: {
                id: refreshTokenDoc.userId,
            },
        });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
        }

        await prisma.token.delete({
            where: {
                id: refreshTokenDoc.id,
            },
        });

        return tokenService.generateAuthTokens(user);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate!");
    }
};

const sendVerificationEmail = async (user) => {
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASSWORD,
        },
        secure: false,
    });

    const mail = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: "Verify your email",
        text: `Verify your email: ${process.env.SERVER_URL}/verify-email?token=${verifyEmailToken}`,
    };

    const info = await transporter.sendMail(mail);
};

const verifyEmail = async (verifyEmailToken) => {
    try {
        const verifyEmailTokenDoc = await tokenService.verifyToken(
            verifyEmailToken,
            "VERIFY_EMAIL"
        );

        const user = await prisma.user.findUnique({
            where: {
                id: verifyEmailTokenDoc.userId,
            },
        });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                isEmailVerified: true,
            },
        });

        await prisma.token.deleteMany({
            where: {
                userId: user.id,
                type: "VERIFY_EMAIL",
            },
        });
    } catch (error) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Email verification failed!"
        );
    }
};

export default {
    loginUserWithEmailAndPassword,
    logout,
    refreshAuth,
    verifyEmail,
    sendVerificationEmail,
};
