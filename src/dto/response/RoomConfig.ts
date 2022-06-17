import {RoomStatus} from "../../redis/models/Room.redis";

import RoomResponse from "./RoomResponse";

interface RoomConfig extends RoomResponse {
    status: RoomStatus;
    isHost: boolean;
}

export default RoomConfig;
