import {Entity, Schema} from "redis-om";

import RedisClient from "../index";

enum RoomStatus {
    WAITING = "waiting",
    PLAYING = "playing",
    FINISHED = "finished"
}

interface RoomRedis {
    /**
     * Room's shortID
     */
    roomId: string;
    roomName: string;
    /**
     * Host's socket id
     */
    hostId: string;
    /**
     * Socket ids of players
     */
    playerIds: string[];
    collectionId: string;
    collectionName: string;
    /**
     * List of topics to draw {@link IGameTopic}
     */
    topics: string[];
    /**
     * Current topic in turn {@link IGameTopic}
     */
    currentTopic: string;
    /**
     * Timeout of one-turn (in seconds)
     */
    timeOut: number;
    maxUsers: number;
    /**
     * Room's status - {@link RoomStatus}
     */
    status: RoomStatus;
    endTurnTime: number;
    image: string;
    password: string;
}

class RoomRedis extends Entity {}

const RoomSchema = new Schema(RoomRedis, {
    hostId: {type: "string"},
    playerIds: {type: "string[]"},
    collectionId: {type: "string"},
    collectionName: {type: "string"},
    timeOut: {type: "number"},
    maxUsers: {type: "number"},
    roomId: {type: "string"},
    roomName: {type: "string"},
    topics: {type: "string[]"},
    status: {type: "string"},
    currentTopic: {type: "string"},
    endTurnTime: {type: "number"},
    image: {type: "string"},
    password: {type: "string"}
});

const RoomRepo = async () => {
    const repo = (await RedisClient.getClient()).fetchRepository(RoomSchema);
    await repo.createIndex();
    return repo;
};

export default RoomRepo;
export {RoomStatus};
export type {RoomRedis};
