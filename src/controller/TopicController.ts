import {Inject, Service} from "typedi";
import {Get, HttpCode, JsonController, Param, QueryParam, QueryParams} from "routing-controllers";
import {StatusCodes} from "http-status-codes";

import TopicServices from "../service/TopicServices";
import PageRequest from "../dto/request/PageRequest";

@Service()
@JsonController()
export default class TopicController {
    @Inject()
    private services: TopicServices;

    @Get("/topics")
    @HttpCode(StatusCodes.OK)
    async getAll(@QueryParam("locale") locale: string) {
        return await this.services.getAll(locale);
    }

    @Get("/topic/:topicId/samples")
    async getSample(@Param("topicId") topicId: string, @QueryParams() {page, size}: PageRequest) {
        return await this.services.getSamples(topicId, {
            limit: size,
            offset: page * size
        });
    }
}
