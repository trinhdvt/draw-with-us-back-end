import {Get, HttpCode, JsonController} from "routing-controllers";
import {Inject, Service} from "typedi";
import {StatusCodes} from "http-status-codes";

import CollectionServices from "../service/CollectionServices";

@Service()
@JsonController("/collections")
export default class CollectionController {
    @Inject()
    private services: CollectionServices;

    @Get("/")
    @HttpCode(StatusCodes.OK)
    async getAll() {
        return await this.services.getAll();
    }
}
