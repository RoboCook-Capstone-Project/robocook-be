import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";

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

export default {
    loginUserWithEmailAndPassword,
};
