import {Inject, Service} from "typedi";
import {Get, HttpCode, JsonController} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import TopicServices from "../service/TopicServices";

@Service()
@JsonController("/topics")
export default class TopicController {
    @Inject()
    private services: TopicServices;

    @Get("/")
    @HttpCode(StatusCodes.OK)
    async getAll() {
        return await this.services.getAll();
    }
}
