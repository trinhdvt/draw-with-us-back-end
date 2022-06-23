import {hostname} from "os";

import {Service} from "typedi";
import {Get, HttpCode, JsonController} from "routing-controllers";
import {StatusCodes} from "http-status-codes";

import AppConfig from "../models/AppConfig.model";

@Service()
@JsonController()
export default class AppConfigController {
    @Get("/")
    @HttpCode(StatusCodes.OK)
    async greeting() {
        return {message: `${hostname()}#${process.pid}`};
    }

    @Get("/app")
    @HttpCode(StatusCodes.OK)
    async appConfig() {
        return await AppConfig.findByPk(1, {
            raw: true
        });
    }
}
