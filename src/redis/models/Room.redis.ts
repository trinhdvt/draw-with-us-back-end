import {Entity, Schema} from "redis-om";
import RedisClient from "../index";

interface RoomRedis {
    roomId: string;
    hostId: string;
    userId: string[];
    collectionId: string;
    timeOut: number;
    maxUsers: number;
}

class RoomRedis extends Entity {}

const RoomSchema = new Schema(RoomRedis, {
    roomId: {type: "string"},
    hostId: {type: "string"},
    userId: {type: "string[]"},
    collectionId: {type: "string"},
    timeOut: {type: "number"},
    maxUsers: {type: "number"}
});
const RoomRepo = async () => {
    return (await RedisClient.getClient()).fetchRepository(RoomSchema);
};

export default RoomRepo;
