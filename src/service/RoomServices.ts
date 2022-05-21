import {Inject, Service} from "typedi";
import RoomRequest from "../dto/request/RoomRequest";
import RoomResponse from "../dto/response/RoomResponse";
import RoomRepo from "../redis/models/Room.redis";
import CollectionServices from "./CollectionServices";
import {HttpError, NotFoundError} from "routing-controllers";

@Service()
export default class RoomServices {
    constructor() {}

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

    /**
     * Add user to room (redis-only)
     * @param sid - User's socket id
     * @param roomId - Room's entity ID
     */
    async joinRoom(sid: string, roomId: string) {
        const roomRepo = await RoomRepo();

        const room = await roomRepo.fetch(roomId);
        if (!room) {
            throw new NotFoundError("Room not found");
        }

        if (room.userId.length == room.maxUsers) {
            throw new HttpError(400, "Room is full");
        }

        room.userId.push(sid);
        await roomRepo.save(room);
    }
}
