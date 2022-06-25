import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    Post
} from "routing-controllers";
import {Inject, Service} from "typedi";
import {StatusCodes} from "http-status-codes";

import CollectionServices from "../service/CollectionServices";
import ICollectionPayload from "../dto/request/ICollectionPayload";
import IUserCredential from "../interfaces/IUserCredential";

@Service()
@JsonController()
export default class CollectionController {
    @Inject()
    private services: CollectionServices;

    @Get("/collections")
    @HttpCode(StatusCodes.OK)
    async getAll() {
        return await this.services.getAll();
    }

    @Post("/collection")
    @HttpCode(StatusCodes.OK)
    @Authorized()
    async createCollection(
        @Body() payload: ICollectionPayload,
        @CurrentUser() author: IUserCredential
    ) {
        return await this.services.createCollection(author.id, payload);
    }
}
