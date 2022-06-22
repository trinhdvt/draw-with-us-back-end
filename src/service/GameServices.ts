import {Inject, Service} from "typedi";
import {NotFoundError, UnauthorizedError} from "routing-controllers";

import {RoomRedis, RoomStatus} from "../redis/models/Room.redis";
import SocketServer from "../socket/SocketServer";
import logger from "../utils/Logger";
import DrawTopicDto, {IGameTopic} from "../dto/response/DrawTopicDto";
import Collection from "../models/Collection.model";
import sequelize from "../models";
import RoomRepository from "../repository/RoomRepository";
import PlayerRepository from "../repository/PlayerRepository";
import AssertUtils from "../utils/AssertUtils";

import MLServices from "./MLServices";
import RoomServices from "./RoomServices";

@Service()
export default class GameServices {
    @Inject()
    private roomRepo: RoomRepository;

    @Inject()
    private playerRepo: PlayerRepository;

    @Inject()
    private mlServices: MLServices;

    @Inject()
    private roomServices: RoomServices;

    /**
     * Start the game
     * @param hostSid - Host's socket id
     */
    async startGame(hostSid: string) {
        const room = await this.roomRepo.getByAttr("hostId", hostSid);
        const {playerIds} = room;
        AssertUtils.isExist(room, new NotFoundError("Room not found"));
        AssertUtils.isTrue(playerIds.length >= 2, new UnauthorizedError("Unable to start game"));

        const {roomId} = await this.prepareGame(room);
        SocketServer.io.to(roomId).emit("room:update");
        this.roomServices.sendMessage(roomId, {
            type: "warn",
            from: "System ⚙️: ",
            message: "Game has started!!!"
        });

        // trigger next-turn game
        await this.nextTurn(roomId);
    }

    private async prepareGame(room: RoomRedis): Promise<RoomRedis> {
        const {collectionId, playerIds} = room;
        // update room's status
        room.status = RoomStatus.PLAYING;

        // get and shuffle topics
        const collection = await Collection.findByPk(Number(collectionId));
        const drawTopics = await collection.$get("drawTopic", {
            order: sequelize.random()
        });
        room.topics = drawTopics.map(topic => JSON.stringify(new DrawTopicDto(topic))).slice(-2);
        await this.roomRepo.save(room);
        collection.playedCount += 1;
        await collection.save();

        // reset all players' point
        const players = await this.playerRepo.getAll();
        await Promise.all(
            players
                .filter(({sid}) => playerIds.includes(sid))
                .map(player => {
                    player.point = 0;
                    return this.playerRepo.save(player);
                })
        );

        return room;
    }

    /**
     * Trigger next turn
     * @param roomId - Room's id
     */
    async nextTurn(roomId: string) {
        const room = await this.roomRepo.getByShortId(roomId);
        if (!room || room.status != RoomStatus.PLAYING) {
            return;
        }

        if (room.topics.length == 0) {
            room.status = RoomStatus.FINISHED;
            logger.info("No more topics");
            await this.roomRepo.save(room);
            SocketServer.io.to(roomId).emit("room:update");
            this.roomServices.sendMessage(roomId, {
                type: "error",
                from: "System ⚙️: ",
                message: "Game has finished!!! Let's see the result👀"
            });
            return;
        }

        const currentTopic: IGameTopic = JSON.parse(room.topics.shift());
        room.currentTopic = JSON.stringify(currentTopic);
        await this.roomRepo.save(room);

        logger.info(`Next turn in room ${roomId} with topic ${currentTopic.nameVi}`);
        SocketServer.io.to(roomId).emit("game:nextTurn", currentTopic);
        this.roomServices.sendMessage(roomId, {
            type: "warn",
            from: "System ⚙️: ",
            message: `The next topic is ${currentTopic.nameVi}🔥`
        });

        const {timeOut} = room;
        return setTimeout(() => {
            SocketServer.io.to(roomId).emit("game:endTurn");
            this.roomServices.sendMessage(roomId, {
                type: "warn",
                from: "System ⚙️: ",
                message: "Time out!!! Let's take a rest⌛️"
            });
            setTimeout(async () => {
                await this.nextTurn(roomId);
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
        const room = await this.roomRepo.getByShortId(roomId);
        AssertUtils.isExist(room, new NotFoundError("Room not found"));
        AssertUtils.isTrue(room.playerIds.includes(sid), new UnauthorizedError("Room not found"));

        // predict player's drawn image with current topic
        const currentTopic: IGameTopic = JSON.parse(room.currentTopic);
        const isCorrect = await this.mlServices.predict(image, currentTopic, sid);

        if (isCorrect) {
            const player = await this.playerRepo.getBySid(sid);
            const CORRECT_POINT = 10;
            if (player) {
                player.point += CORRECT_POINT;
                await this.playerRepo.save(player);
            }
            this.roomServices.sendMessage(roomId, {
                type: "success",
                message: `${player.name} has done a correct drawing!👏`
            });
            SocketServer.io.to(roomId).emit("room:update");
        }

        return isCorrect;
    }
}
