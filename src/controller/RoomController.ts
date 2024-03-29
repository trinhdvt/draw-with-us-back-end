import {Inject, Service} from "typedi";
import {
    Body,
    CurrentUser,
    Get,
    Head,
    HeaderParam,
    HttpCode,
    JsonController,
    Param,
    Post
} from "routing-controllers";
import {StatusCodes} from "http-status-codes";

import RoomRequest from "../dto/request/RoomRequest";
import RoomServices from "../service/RoomServices";
import IUserCredential from "../interfaces/IUserCredential";

@Service()
@JsonController()
export default class RoomController {
    @Inject()
    private services: RoomServices;

    @Post("/rooms")
    @HttpCode(StatusCodes.OK)
    async createRoom(
        @Body() roomDto: RoomRequest,
        @HeaderParam("X-EID") eid: string,
        @CurrentUser({required: false}) host: IUserCredential
    ) {
        await this.services.validateCreateRoomParams(roomDto);

        if (!host) roomDto.password = "";
        return await this.services.create(eid, roomDto);
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

    @Get("/room/:roomId/preview")
    async previewRoom(@Param("roomId") roomId: string) {
        return await this.services.getPreviewRoom(roomId);
    }

    @Head("/room/:roomId/player")
    @HttpCode(StatusCodes.OK)
    async checkPlayerInRoom(@Param("roomId") roomId: string, @HeaderParam("X-SID") sid: string) {
        await this.services.checkPlayer(roomId, sid);
        return {roomId};
    }

    @Get("/room/:roomId/players")
    @HttpCode(StatusCodes.OK)
    async getPlayers(@Param("roomId") roomId: string, @HeaderParam("X-SID") sid: string) {
        return await this.services.getPlayers(roomId, sid);
    }

    @Get("/play")
    @HttpCode(StatusCodes.OK)
    async findRandomRoom() {
        return await this.services.findRoom();
    }
}
