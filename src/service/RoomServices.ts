import {Inject, Service} from "typedi";
import {BadRequestError, NotFoundError} from "routing-controllers";

import RoomRequest from "../dto/request/RoomRequest";
import RoomResponse from "../dto/response/RoomResponse";
import {RoomRedis, RoomStatus} from "../redis/models/Room.redis";
import StringUtils from "../utils/StringUtils";
import Collection from "../models/Collection.model";
import RoomConfig from "../dto/response/RoomConfig";
import SocketServer from "../socket/SocketServer";
import logger from "../utils/Logger";
import PlayerRepository from "../repository/PlayerRepository";
import RoomRepository from "../repository/RoomRepository";
import AssertUtils from "../utils/AssertUtils";
import AppConfig from "../models/AppConfig.model";
import {IPlayer} from "../interfaces/IUser";
import {IMessage} from "../interfaces/IMessage";

@Service()
export default class RoomServices {
    @Inject()
    private playerRepo: PlayerRepository;

    @Inject()
    private roomRepo: RoomRepository;

    async create(eid: string, roomDto: RoomRequest): Promise<{id: string}> {
        const {maxUsers, timeOut, collectionId} = roomDto;

        const collection = await Collection.findByPk(Number(collectionId));
        AssertUtils.isExist(collection, new NotFoundError("Collection not found"));

        const host = await this.playerRepo.getById(eid);
        AssertUtils.isExist(host, new NotFoundError("Player not found"));

        const roomId = StringUtils.randomId();
        const room = await this.roomRepo.create({
            hostId: host.sid,
            roomId: roomId,
            roomName: host.name,
            maxUsers: maxUsers,
            timeOut: timeOut,
            playerIds: [host.sid],
            collectionId: collection.id,
            collectionName: collection.name,
            topics: [],
            status: RoomStatus.WAITING
        });

        SocketServer.joinRoom(host.sid, room.roomId);
        return {
            id: room.roomId
        };
    }

    async validateCreateRoomParams({maxUsers, timeOut}: RoomRequest) {
        const {room} = await AppConfig.findByPk(1);

        AssertUtils.isTrue(
            room.timeOut.includes(timeOut),
            new BadRequestError("Time out is not valid")
        );
        AssertUtils.isTrue(
            room.maxUsers.includes(maxUsers),
            new BadRequestError("Max users is not valid")
        );
    }

    /**
     * Get all rooms
     */
    async getAll(): Promise<RoomResponse[]> {
        const rooms = await this.roomRepo.getAll();
        return rooms.map<RoomResponse>(room => ({
            eid: room.entityId,
            timeOut: room.timeOut,
            maxUsers: room.maxUsers,
            currentUsers: room.playerIds.length,
            collectionName: room.collectionName,
            id: room.roomId,
            name: room.roomName
        }));
    }

    /**
     * Add user to room (redis-only)
     * @param sid - User's socket id
     * @param eid - Room's entity ID
     */
    async joinRoom(sid: string, eid: string) {
        const room = await this.roomRepo.getById(eid);
        AssertUtils.isExist(room, new NotFoundError("Room not found"));
        AssertUtils.isTrue(
            room.playerIds.length < room.maxUsers,
            new NotFoundError("Room is full")
        );

        if (!room.playerIds.includes(sid)) {
            room.playerIds.push(sid);
        }

        await this.roomRepo.save(room);
        SocketServer.joinRoom(sid, room.roomId);
        const newPlayer = await this.playerRepo.getBySid(sid);
        this.sendMessage(room.roomId, {
            from: "System ⚙️: ",
            message: `${newPlayer?.name} joined the room!`,
            type: "success"
        });
        return room.roomId;
    }

    /**
     * Find one playable room for user
     */
    async findRoom() {
        const rooms = await this.getAll();
        const playableRooms = rooms.filter(room => room.currentUsers < room.maxUsers);
        AssertUtils.isTrue(playableRooms.length > 0, new NotFoundError("No room available"));

        const randomIdx = Math.floor(Math.random() * playableRooms.length);
        return {
            roomEId: playableRooms[randomIdx].eid
        };
    }

    /**
     * Check if player is in the room or not
     * @param roomId - Room's shortID
     * @param sid - Player's socket id
     */
    async checkPlayer(roomId: string, sid: string): Promise<RoomRedis> {
        const room = await this.roomRepo.getByShortId(roomId);
        const {playerIds} = room;
        AssertUtils.isExist(room, new NotFoundError("Room not found"));
        AssertUtils.isTrue(playerIds.indexOf(sid) != -1, new NotFoundError("Room not found"));

        return room;
    }

    /**
     * Get room's config
     * @param sid - Player's socket id
     * @param roomId - Room's ID
     */
    async getRoom(sid: string, roomId: string): Promise<RoomConfig> {
        const room = await this.checkPlayer(roomId, sid);
        return {
            collectionName: room.collectionName,
            currentUsers: room.playerIds.length,
            id: room.roomId,
            maxUsers: room.maxUsers,
            status: room.status,
            timeOut: room.timeOut,
            eid: room.entityId,
            name: room.roomName,
            isHost: room.hostId == sid
        };
    }

    /**
     * Get all players in the room
     * @param roomId - Room's shortID
     * @param sid - Current player's socket id
     */
    async getPlayers(roomId: string, sid: string): Promise<IPlayer[]> {
        const {hostId, status, playerIds} = await this.checkPlayer(roomId, sid);
        const players = await this.playerRepo.getAll();

        const response = players
            .filter(({sid}) => playerIds.includes(sid))
            .map<IPlayer>(({avatar, entityId, name, point, sid}) => ({
                isHost: hostId === sid,
                eid: entityId,
                name,
                point,
                avatar
            }))
            .sort((a, b) => (a.point > b.point ? -1 : 1));

        if (status === RoomStatus.PLAYING) {
            const MAX_TOP = 3;
            for (let i = 0; i < Math.min(response.length, MAX_TOP); i++) {
                response[i].topk = i + 1;
            }
        }

        return response;
    }

    /**
     * Remove player from specified room
     * @param sid - Player's socket id
     * @param roomId - Room's shortID. If undefined, remove player from all rooms
     */
    async removePlayer(sid: string, roomId?: string) {
        let rooms: RoomRedis[];
        if (roomId) {
            const room = await this.roomRepo.getByShortId(roomId);
            rooms = [room];
        } else {
            rooms = await this.roomRepo.getByPlayerIdsContain(sid);
        }

        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            AssertUtils.isExist(room, new NotFoundError("Room not found"));

            logger.debug(`Removing player ${sid} from room ${room.roomId}`);
            room.playerIds = room.playerIds.filter(id => id !== sid);
            if (room.playerIds.length == 0) {
                await this.roomRepo.remove(room);
                logger.debug(`Room ${room.roomId} is empty, removing it`);
            } else {
                if (room.hostId == sid) {
                    room.hostId = room.playerIds[0];
                }
                if (room.playerIds.length == 1) {
                    room.status = RoomStatus.WAITING;
                }
                await this.roomRepo.save(room);
            }
            SocketServer.leaveRoom(sid, room.roomId);
        }

        const user = await this.playerRepo.getBySid(sid);
        if (user && user.point != 0) {
            user.point = 0;
            await this.playerRepo.save(user);
        }
    }

    sendMessage(roomId: string, payload: IMessage) {
        SocketServer.io.to(roomId).emit("room:msg", {
            ...payload,
            id: Math.random().toString(36).substring(2)
        });
    }
}
