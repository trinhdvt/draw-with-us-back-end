import {Inject, Service} from "typedi";
import RoomRequest from "../dto/request/RoomRequest";
import RoomResponse from "../dto/response/RoomResponse";
import RoomRepo from "../redis/models/Room.redis";
import CollectionServices from "./CollectionServices";

@Service()
export default class RoomServices {
    constructor() {
    }

    @Inject()
    private collectionServices: CollectionServices;

    async create(roomDto: RoomRequest) {
        const redisRepo = await RoomRepo();

        const {sid, maxUsers, timeOut, collectionId} = roomDto;
        const collection = await this.collectionServices.getById(collectionId);

        const room = await redisRepo.createAndSave({
            hostId: sid,
            maxUsers: maxUsers,
            timeOut: timeOut,
            userId: [sid],
            collectionId: collection.id,
            collectionName: collection.name
        });

        return room.toJSON();
    }

    async getAll() {
        const redisRepo = await RoomRepo();
        const rooms = await redisRepo.search().all();

        const response: RoomResponse[] = [];

        for (const room of rooms) {
            const hostId = room.hostId;

            response.push({
                id: room.entityId,
                timeOut: room.timeOut,
                maxUsers: room.maxUsers,
                currentUsers: room.userId.length,
                collectionName: room.collectionName,
                host: {
                    id: hostId,
                    name: hostId
                }
            });
        }

        return response;
    }
}
