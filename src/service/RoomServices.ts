import {Inject, Service} from "typedi";
import RoomRequest from "../dto/request/RoomRequest";
import RoomResponse from "../dto/response/RoomResponse";
import RoomRepo from "../redis/models/Room.redis";
import CollectionServices from "./CollectionServices";
import {HttpError, NotFoundError} from "routing-controllers";
import StringUtils from "../utils/StringUtils";
import Collection from "../models/Collection.model";
import DrawTopic from "../models/DrawTopic.model";

@Service()
export default class RoomServices {
    constructor() {}

    @Inject()
    private collectionServices: CollectionServices;

    async create(roomDto: RoomRequest) {
        const redisRepo = await RoomRepo();

        const {sid, maxUsers, timeOut, collectionId} = roomDto;
        const collection = await Collection.findByPk(Number(collectionId));
        if (!collection) {
            throw new NotFoundError(`Collection with id ${collectionId} not found`);
        }

        const roomId = StringUtils.randomId();
        const topics = await collection.$get("drawTopic");
        const room = await redisRepo.createAndSave({
            hostId: sid,
            roomId: roomId,
            maxUsers: maxUsers,
            timeOut: timeOut,
            userId: [sid],
            collectionId: collection.id,
            collectionName: collection.name,
            topics: topics.map(topic => topic.nameVi)
        });

        return room.toJSON();
    }

    async getAll() {
        const redisRepo = await RoomRepo();
        const rooms = await redisRepo.search().all();

        const response: RoomResponse[] = [];

        for (const room of rooms) {
            response.push({
                eid: room.entityId,
                timeOut: room.timeOut,
                maxUsers: room.maxUsers,
                currentUsers: room.userId.length,
                collectionName: room.collectionName,
                host: {
                    id: room.hostId,
                    name: "trinhdvt"
                },
                id: room.roomId
            });
        }

        return response;
    }

    /**
     * Add user to room (redis-only)
     * @param sid - User's socket id
     * @param eid - Room's entity ID
     */
    async joinRoom(sid: string, eid: string) {
        const roomRepo = await RoomRepo();

        const room = await roomRepo.fetch(eid);
        if (!room) {
            throw new NotFoundError("Room not found");
        }

        if (room.userId.length == room.maxUsers) {
            throw new HttpError(400, "Room is full");
        }

        room.userId.push(sid);
        await roomRepo.save(room);
        
        return room.roomId;
    }
}
