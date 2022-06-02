import {Inject, Service} from "typedi";
import RoomRepo, {RoomRedis, RoomStatus} from "../redis/models/Room.redis";
import {UnauthorizedError} from "routing-controllers";
import SocketServer from "../socket/SocketServer";
import logger from "../utils/Logger";
import DrawTopicDto, {IGameTopic} from "../dto/response/DrawTopicDto";
import MLServices from "./MLServices";
import UserRepo from "../redis/models/User.redis";
import Collection from "../models/Collection.model";
import sequelize from "../models";

@Service()
export default class GameServices {
    constructor() {}

    @Inject()
    private mlServices: MLServices;

    /**
     * Start the game
     * @param hostSid - Host's socket id
     */
    async startGame(hostSid: string) {
        const roomRepo = await RoomRepo();
        const room = await roomRepo.search().where("hostId").eq(hostSid).first();
        if (!room || room.playerIds.length < 2) {
            throw new UnauthorizedError("Unable to start game");
        }

        const {roomId} = await this.prepareGame(room);

        // tell all players update game state
        SocketServer.io.to(roomId).emit("room:update");

        // trigger next-turn game
        await this.nextTurn(roomId);
    }

    private async prepareGame(room: RoomRedis): Promise<RoomRedis> {
        const {collectionId, playerIds} = room;

        const roomRepo = await RoomRepo();
        // update room's status
        room.status = RoomStatus.PLAYING;

        // get and shuffle topics
        const collection = await Collection.findByPk(Number(collectionId));
        const drawTopics = await collection.$get("drawTopic", {
            order: sequelize.random()
        });
        room.topics = drawTopics.map(topic => JSON.stringify(new DrawTopicDto(topic))).slice(-2);
        await roomRepo.save(room);

        // reset all players' point
        const playerRepo = await UserRepo();
        const players = await playerRepo.search().all();
        await Promise.all(
            players
                .filter(({sid}) => playerIds.indexOf(sid) != -1)
                .map(player => {
                    player.point = 0;
                    return playerRepo.save(player);
                })
        );

        return room;
    }

    /**
     * Trigger next turn
     * @param roomId - Room's id
     */
    async nextTurn(roomId: string) {
        const roomRepo = await RoomRepo();
        const room = await roomRepo.search().where("roomId").eq(roomId).first();
        if (!room || room.status != RoomStatus.PLAYING) {
            return;
        }

        if (room.topics.length == 0) {
            room.status = RoomStatus.FINISHED;
            logger.debug("No more topics");
            await roomRepo.save(room);
            SocketServer.io.to(roomId).emit("room:update");
            return;
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

    /**
     * Check if player's image is correct
     * @param sid - Player's socket id
     * @param roomId - Room's id
     * @param image - Image's base64
     */
    async check(sid: string, roomId: string, image: string): Promise<boolean> {
        const roomRepo = await RoomRepo();
        const room = await roomRepo.search().where("roomId").eq(roomId).first();
        if (!room || room.playerIds.indexOf(sid) == -1) {
            throw new UnauthorizedError("Room not found");
        }

        // predict player's drawn image with current topic
        const currentTopic: IGameTopic = JSON.parse(room.currentTopic);
        const isCorrect = await this.mlServices.predict(image, currentTopic);

        if (isCorrect) {
            const playerRepo = await UserRepo();
            const player = await playerRepo.search().where("sid").eq(sid).first();
            const CORRECT_POINT = 10;
            if (player) {
                player.point += CORRECT_POINT;
                await playerRepo.save(player);
            }
        }

        return isCorrect;
    }
}
