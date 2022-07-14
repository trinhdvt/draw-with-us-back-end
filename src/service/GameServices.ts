import {Inject, Service} from "typedi";
import {NotFoundError, UnauthorizedError} from "routing-controllers";

import {RoomRedis, RoomStatus} from "../redis/models/Room.redis";
import SocketServer from "../socket/SocketServer";
import DrawTopicDto, {IGameTopic} from "../dto/response/DrawTopicDto";
import Collection from "../models/Collection.model";
import sequelize from "../models";
import RoomRepository from "../repository/RoomRepository";
import PlayerRepository from "../repository/PlayerRepository";
import AssertUtils from "../utils/AssertUtils";
import GameMessages from "../utils/GameUtils";
import {ERoomEvent} from "../interfaces/IRoom";

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
        const room = await this.roomCheck(hostSid);

        const {roomId} = await this.prepareGame(room);
        SocketServer.io.to(roomId).emit("room:update");
        this.roomServices.sendMessage(roomId, GameMessages[ERoomEvent.START]);

        // trigger next-turn game
        await this.nextTurn(roomId);
    }

    async pauseGame(hostSid: string) {
        const room = await this.roomCheck(hostSid);
        if (![RoomStatus.PLAYING, RoomStatus.PAUSED].includes(room.status)) return false;

        const currentStatus = room.status;
        const isPendingPause = room.pendingPause;

        // playing to pending pause or resume
        if (currentStatus === RoomStatus.PLAYING) {
            room.pendingPause = !isPendingPause;
            await this.roomRepo.save(room);

        } else {
            // paused to playing
            room.status = RoomStatus.PLAYING;
            room.pendingPause = false;
            await this.roomRepo.save(room);
            const roomId = room.roomId;
            SocketServer.io.to(roomId).emit("room:update");
            this.roomServices.sendMessage(roomId, GameMessages[ERoomEvent.RESUME]);
            await this.nextTurn(roomId);
        }
        return true;
    }

    private async roomCheck(hostSid: string): Promise<RoomRedis> {
        const room = await this.roomRepo.getByAttr("hostId", hostSid);
        AssertUtils.isExist(room, new NotFoundError("Room not found"));
        const {playerIds} = room;
        AssertUtils.isTrue(playerIds.length >= 2, new UnauthorizedError("Unable to start game"));
        return room;
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
        room.topics = drawTopics.map(topic => JSON.stringify(new DrawTopicDto(topic))).slice(-3);
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
    private async nextTurn(roomId: string) {
        const room = await this.roomRepo.getByShortId(roomId);
        if (!room || room.status !== RoomStatus.PLAYING) {
            return;
        }

        // pause if the game is scheduled to be paused
        if (room.pendingPause) {
            room.status = RoomStatus.PAUSED;
            room.pendingPause = false;
            await this.roomRepo.save(room);
            SocketServer.io.to(roomId).emit("room:update");
            this.roomServices.sendMessage(roomId, GameMessages[ERoomEvent.PAUSED]);
            return;
        }

        if (room.topics.length == 0) {
            room.status = RoomStatus.FINISHED;
            await this.roomRepo.save(room);
            SocketServer.io.to(roomId).emit("room:update");
            this.roomServices.sendMessage(roomId, GameMessages[ERoomEvent.FINISH]);
            SocketServer.io.to(roomId).emit("game:finish");
            return;
        }

        const currentTopic: IGameTopic = JSON.parse(room.topics.shift());
        room.currentTopic = JSON.stringify(currentTopic);
        const {timeOut} = room;
        room.endTurnTime = new Date().getTime() + timeOut * 1e3;
        await this.roomRepo.save(room);

        SocketServer.io.to(roomId).emit("game:nextTurn", currentTopic);
        const msg = GameMessages[ERoomEvent.NEXT_TURN](currentTopic.nameEn, currentTopic.nameVi);
        this.roomServices.sendMessage(roomId, msg);

        return setTimeout(() => {
            SocketServer.io.to(roomId).emit("game:endTurn");
            this.roomServices.sendMessage(roomId, GameMessages[ERoomEvent.END_TURN]);
            setTimeout(async () => await this.nextTurn(roomId), 3e3);
        }, timeOut * 1e3);
    }

    /**
     * Judge player drawn image is correct or not
     * @param sid - Player's socket id
     * @param roomId - Room's id
     * @param image - Image's base64
     */
    async check(sid: string, roomId: string, image: string): Promise<boolean> {
        const room = await this.roomRepo.getByShortId(roomId);
        AssertUtils.isExist(room, new NotFoundError("Room not found"));
        const {playerIds, currentTopic, status} = room;
        AssertUtils.isTrue(
            playerIds.includes(sid) && status === RoomStatus.PLAYING,
            new UnauthorizedError("Room not found")
        );

        const submittedTime = new Date().getTime();
        // predict player's drawn image with current topic
        const topic: IGameTopic = JSON.parse(currentTopic);
        const isCorrect = await this.mlServices.predict(image, topic, sid);

        if (isCorrect) {
            const player = await this.playerRepo.getBySid(sid);

            const CORRECT_POINT = 10;
            const BONUS_POINT = 10;
            const {timeOut, endTurnTime} = room;
            const timeLeft = (endTurnTime - submittedTime) / 1e3;
            let point = CORRECT_POINT;
            if (timeLeft >= timeOut / 2) {
                point += BONUS_POINT * (timeLeft / timeOut);
            }

            if (player) {
                player.point += Math.floor(point);
                await this.playerRepo.save(player);
            }

            const msg = GameMessages[ERoomEvent.PLAYER_SUCCESS](player.name, player.name);
            this.roomServices.sendMessage(roomId, msg);
            SocketServer.io.to(roomId).emit("room:update");
        }

        return isCorrect;
    }
}
