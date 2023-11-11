import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import httpStatus from "http-status";

import router from "./routes/index.js";
import ApiError from "./utils/ApiError.js";
import { errorConverter, errorHandler } from "./middlewares/error.js";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const multerMid = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

app.use(multerMid.array("file", 2));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// For unknown routes
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Error handling
app.use(errorConverter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
