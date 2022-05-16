import {Inject, Service} from "typedi";
import {Body, HttpCode, JsonController, Post} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import RoomRequest from "../dto/request/RoomRequest";
import RoomServices from "../service/RoomServices";

@Service()
@JsonController("/rooms")
export default class RoomController {
    @Inject()
    private services: RoomServices;

    @Post("/")
    @HttpCode(StatusCodes.OK)
    async createRoom(@Body() roomDto: RoomRequest) {
        return await this.services.create(roomDto);
    }
}
