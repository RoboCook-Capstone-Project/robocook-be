import express from "express";

import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import postRouter from "./post.route.js";
import recipeRouter from "./recipe.route.js";
import galleryRouter from "./gallery.route.js";

const router = express.Router();

const defaultRoutes = [
    {
        path: "/auth",
        route: authRouter,
    },
    {
        path: "/users",
        route: userRouter,
    },
    {
        path: "/posts",
        route: postRouter,
    },
    {
        path: "/recipes",
        route: recipeRouter,
    },
    {
        path: "/galleries",
        route: galleryRouter,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
