import jwt from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";

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

const verifyToken = async (token) => {
    try {
        const payload = await jwt.verify(token, process.env.JWT_SECRET);

        if (!payload) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token!");
        }

        return payload;
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token!");
    }
};

const generateAuthTokens = async (user) => {
    // const accessTokenExpires = moment().add(
    //     process.env.JWT_ACCESS_EXPIRATION_MINUTES,
    //     "minutes"
    // );

    const accessTokenExpires = moment().add(
        process.env.JWT_ACCESS_EXPIRATION_DAYS,
        "days"
    );

    const accessToken = generateToken(user.id, accessTokenExpires, "ACCESS");

    return accessToken;
};

export default {
    generateToken,
    verifyToken,
    generateAuthTokens,
};
