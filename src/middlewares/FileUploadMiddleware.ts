import multer from "multer";
import {BadRequestError} from "routing-controllers";

const allowMime = ["image/png", "image/jpg", "image/jpeg"]

export const fileUploadOptions = {
    storage: multer.diskStorage({
        filename: (req, file, callback) => {
            callback(null, Date.now() + "-" + file.originalname);
        }
    }),
    fileFilter(req: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
        if (allowMime.indexOf(file.mimetype) == -1) {
            return callback(new BadRequestError("Unsupported file"));
        }
        callback(null, true);
    },
    limits: {
        fieldNameSize: 255,
        fileSize: 1024 * 1024 * 2
    }
}

