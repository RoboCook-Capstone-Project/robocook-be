import jwt from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateToken = (
    userId,
    expires,
    type,
    secret = process.env.JWT_SECRET
) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type) => {
    const tokenDoc = await prisma.token.create({
        data: {
            token,
            userId,
            expires: expires.toDate(),
            type,
        },
    });

    if (!tokenDoc) {
        throw new ApiError(httpStatus.BAD_GATEWAY, "Error save token!");
    }

    return tokenDoc;
};

const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (type === "ACCESS") {
        return payload;
    }

    const tokenDoc = await prisma.token.findUnique({
        where: {
            token,
            type,
            user: {
                id: payload.sub,
            },
        },
    });

    if (!tokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, "Token not found!");
    }

    return tokenDoc;
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = moment().add(
        process.env.JWT_ACCESS_EXPIRATION_MINUTES,
        "minutes"
    );
    const accessToken = generateToken(user.id, accessTokenExpires, "ACCESS");

    const refreshTokenExpires = moment().add(
        process.env.JWT_REFRESH_EXPIRATION_DAYS,
        "days"
    );
    const refreshToken = generateToken(user.id, refreshTokenExpires, "REFRESH");

    await saveToken(refreshToken, user.id, refreshTokenExpires, "REFRESH");

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

const generateVerifyEmailToken = async (user) => {
    const expires = moment().add(
        process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
        "minutes"
    );

    const verifyEmailToken = generateToken(
        user.id,
        expires,
        "VERIFY_EMAIL",
        process.env.JWT_VERIFY_EMAIL_SECRET
    );

    await saveToken(verifyEmailToken, user.id, expires, "VERIFY_EMAIL");

    return verifyEmailToken;
};

export default {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    generateVerifyEmailToken,
};
