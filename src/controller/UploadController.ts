import {Service} from "typedi";
import {Authorized, HttpCode, JsonController, Post, UploadedFile} from "routing-controllers";
import {fileUploadOptions} from "../middlewares/FileUploadMiddleware";
import {Express} from "express";
import {unlink} from "fs/promises";
import StorageServices from "../service/StorageServices";
import {StatusCodes} from "http-status-codes";

@Service()
@JsonController("/upload")
export default class UploadController {

    constructor(private storageServices: StorageServices) {
    }

    @Post()
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async uploadFile(@UploadedFile("file", {options: fileUploadOptions}) file: Express.Multer.File) {

        let publicUrl = await this.storageServices.uploadFile(file.path);

        await unlink(file.path);

        return {
            url: publicUrl
        }
    }

}