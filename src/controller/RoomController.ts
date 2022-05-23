import {Inject, Service} from "typedi";
import {Body, Get, HeaderParam, HttpCode, JsonController, Param, Post} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import RoomRequest from "../dto/request/RoomRequest";
import RoomServices from "../service/RoomServices";

@Service()
@JsonController()
export default class RoomController {
    @Inject()
    private services: RoomServices;

    @Post("/rooms")
    @HttpCode(StatusCodes.OK)
    async createRoom(@Body() roomDto: RoomRequest) {
        return await this.services.create(roomDto);
    }

    @Get("/rooms")
    @HttpCode(StatusCodes.OK)
    async listRooms() {
        return await this.services.getAll();
    }

    @Get("/room/:roomId")
    @HttpCode(StatusCodes.OK)
    async roomConfig(@Param("roomId") roomId: string, @HeaderParam("X-SID") sid: string) {
        return await this.services.getRoom(sid, roomId);
    }
}
