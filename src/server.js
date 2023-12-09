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
        fileSize: 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg') {
            return cb(new ApiError(httpStatus.UNSUPPORTED_MEDIA_TYPE, "Only .png, .jpg, and .jpeg format allowed!"))
        }
        cb(null,true)
    },
});

app.use(multerMid.single("image"));

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
    console.log(`Robocook app listening on port ${PORT} 😉`);
});
