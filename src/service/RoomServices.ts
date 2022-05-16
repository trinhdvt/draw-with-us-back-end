import {Service} from "typedi";
import RoomRequest from "../dto/request/RoomRequest";
import RoomRepo from "../redis/models/Room.redis";

@Service()
export default class RoomServices {
    constructor() {}

    async create(roomDto: RoomRequest) {
        const redisRepo = await RoomRepo();

        const room = await redisRepo.createAndSave({
            collectionId: roomDto.collectionId,
            hostId: roomDto.collectionId,
            roomId: roomDto.sid,
            maxUsers: roomDto.maxUsers,
            timeout: roomDto.timeOut,
            userId: []
        });

        return room.toJSON();
    }
}
