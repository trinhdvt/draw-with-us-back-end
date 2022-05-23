import RoomResponse from "./RoomResponse";
import {RoomStatus} from "../../redis/models/Room.redis";

interface RoomConfig extends RoomResponse {
    status: RoomStatus;
}

export default RoomConfig;
