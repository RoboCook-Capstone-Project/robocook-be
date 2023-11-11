import express from "express";

import { galleryController } from "../controllers/index.js";

const galleryRouter = express.Router();

galleryRouter
    .route("/")
    .get(galleryController.getGalleries)
    .post(galleryController.createGalleries);

galleryRouter.route("/:id").delete(galleryController.deleteGallery);

galleryRouter
    .route("/user/:authorId")
    .delete(galleryController.deleteUserGallery);

export default galleryRouter;
