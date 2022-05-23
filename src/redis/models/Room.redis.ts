import {Entity, Schema} from "redis-om";
import RedisClient from "../index";

interface RoomRedis {
    roomId: string;
    hostId: string;
    userId: string[];
    collectionId: string;
    collectionName: string;
    topics: string[];
    timeOut: number;
    maxUsers: number;
}

class RoomRedis extends Entity {}

const RoomSchema = new Schema(RoomRedis, {
    hostId: {type: "string"},
    userId: {type: "string[]"},
    collectionId: {type: "string"},
    collectionName: {type: "string"},
    timeOut: {type: "number"},
    maxUsers: {type: "number"},
    roomId: {type: "string"},
    topics: {type: "string[]"}
});

const RoomRepo = async () => {
    const repo = (await RedisClient.getClient()).fetchRepository(RoomSchema);
    await repo.createIndex();
    return repo;
};

export default RoomRepo;
