import {Service} from "typedi";
import RoomRepo, {RoomStatus} from "../redis/models/Room.redis";
import {UnauthorizedError} from "routing-controllers";
import SocketServer from "../socket/SocketServer";
import logger from "../utils/Logger";
import {IGameTopic} from "../dto/response/DrawTopicDto";

@Service()
export default class GameServices {
    constructor() {}

    /**
     * Start the game
     * @param hostSid - Host's socket id
     */
    async startGame(hostSid: string) {
        const roomRepo = await RoomRepo();
        const room = await roomRepo.search().where("hostId").eq(hostSid).first();
        if (!room) {
            throw new UnauthorizedError("You are not the host");
        }

        // update room's statue
        room.status = RoomStatus.PLAYING;
        await roomRepo.save(room);
        const {roomId} = room;
        // tell all players update game state
        SocketServer.io.to(roomId).emit("room:update");

        // trigger next-turn game
        await this.nextTurn(roomId);
    }

    async nextTurn(roomId: string) {
        const roomRepo = await RoomRepo();
        const room = await roomRepo.search().where("roomId").eq(roomId).first();
        if (!room) {
            throw new UnauthorizedError("Room not found");
        }

        if (room.topics.length == 0) {
            room.status = RoomStatus.FINISHED;
            logger.debug("No more topics");
            await roomRepo.save(room);
            return false;
        }

        const currentTopic: IGameTopic = JSON.parse(room.topics.shift());
        room.currentTopic = JSON.stringify(currentTopic);
        await roomRepo.save(room);

        logger.debug(`Next turn in room ${roomId} with topic ${currentTopic.nameVi}`);
        SocketServer.io.to(roomId).emit("game:nextTurn", currentTopic);

        const {timeOut} = room;
        return setTimeout(() => {
            SocketServer.io.to(roomId).emit("game:endTurn");
            setTimeout(() => {
                this.nextTurn(roomId);
            }, 3e3);
        }, timeOut * 1e3);
    }
}
