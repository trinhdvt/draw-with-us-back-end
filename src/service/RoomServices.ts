import {Service} from "typedi";
import RoomRequest from "../dto/request/RoomRequest";
import RoomResponse from "../dto/response/RoomResponse";
import RoomRepo, {RoomRedis, RoomStatus} from "../redis/models/Room.redis";
import {HttpError, NotFoundError, UnauthorizedError} from "routing-controllers";
import StringUtils from "../utils/StringUtils";
import Collection from "../models/Collection.model";
import RoomConfig from "../dto/response/RoomConfig";
import UserRepo from "../redis/models/User.redis";
import IPlayer from "../dto/response/PlayerDto";
import SocketServer from "../socket/SocketServer";
import logger from "../utils/Logger";

@Service()
export default class RoomServices {
    constructor() {}

    async create(eid: string, roomDto: RoomRequest): Promise<Partial<RoomResponse>> {
        const roomRepo = await RoomRepo();

        const {maxUsers, timeOut, collectionId} = roomDto;
        const collection = await Collection.findByPk(Number(collectionId));
        if (!collection) {
            throw new NotFoundError(`Collection with id ${collectionId} not found`);
        }

        const userRepo = await UserRepo();
        const host = await userRepo.fetch(eid);
        if (!host) {
            throw new UnauthorizedError("User not found");
        }

        const roomId = StringUtils.randomId();
        const room = await roomRepo.createAndSave({
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

    /**
     * Get all rooms
     */
    async getAll(): Promise<RoomResponse[]> {
        const redisRepo = await RoomRepo();
        const rooms = await redisRepo.search().all();

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
        const roomRepo = await RoomRepo();

        const room = await roomRepo.fetch(eid);
        if (!room) {
            throw new NotFoundError("Room not found");
        }

        if (room.playerIds.indexOf(sid) == -1) {
            room.playerIds.push(sid);
        }

        if (room.playerIds.length > room.maxUsers) {
            throw new HttpError(400, "Room is full");
        }

        await roomRepo.save(room);
        SocketServer.joinRoom(sid, room.roomId);
        return room.roomId;
    }

    /**
     * Get room's config
     * @param sid - Player's socket id
     * @param roomId - Room's ID
     */
    async getRoom(sid: string, roomId: string): Promise<RoomConfig> {
        const roomRepo = await RoomRepo();

        const room = await roomRepo.search().where("roomId").eq(roomId).first();
        if (!room || room.playerIds.indexOf(sid) == -1) {
            throw new HttpError(400, "You are not in this room");
        }

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
     * Find one playable room for user
     */
    async findRoom() {
        const rooms = await this.getAll();
        const playableRooms = rooms.filter(room => room.currentUsers < room.maxUsers);
        if (playableRooms.length == 0) {
            throw new NotFoundError("No room available");
        }

        const randomIdx = Math.floor(Math.random() * playableRooms.length);
        return {
            roomEId: playableRooms[randomIdx].eid
        };
    }

    /**
     * Get all players in the room
     * @param roomId - Room's shortID
     * @param sid - Current player's socket id
     */
    async getPlayers(roomId: string, sid: string): Promise<IPlayer[]> {
        const roomRepo = await RoomRepo();
        const room = await roomRepo.search().where("roomId").eq(roomId).first();
        if (!room || room.playerIds.indexOf(sid) == -1) {
            throw new NotFoundError("Room not found");
        }

        const playerRepo = await UserRepo();
        const players = await playerRepo.search().all();

        const playerIds = room.playerIds;
        const response = players
            .filter(player => playerIds.indexOf(player.sid) != -1)
            .map<IPlayer>(player => ({
                name: player.name,
                eid: player.entityId,
                point: player.point,
                isHost: room.hostId == player.sid
            }))
            .sort((a, b) => (a.point > b.point ? -1 : 1));

        if (room.status === RoomStatus.PLAYING) {
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
        const roomRepo = await RoomRepo();
        let rooms: RoomRedis[];
        if (roomId) {
            rooms = await roomRepo.search().where("roomId").eq(roomId).all();
        } else {
            rooms = await roomRepo.search().where("playerIds").contain(sid).all();
        }

        for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            if (!room || room.playerIds.indexOf(sid) == -1) {
                throw new NotFoundError("Room not found");
            }

            logger.debug(`Removing player ${sid} from room ${room.roomId}`);
            room.playerIds = room.playerIds.filter(id => id !== sid);
            if (room.playerIds.length == 0) {
                await roomRepo.remove(room.entityId);
                logger.debug(`Room ${room.roomId} is empty, removing it`);
            } else {
                if (room.hostId == sid) {
                    room.hostId = room.playerIds[0];
                }
                if (room.playerIds.length == 1) {
                    room.status = RoomStatus.WAITING;
                }
                await roomRepo.save(room);
            }
            SocketServer.leaveRoom(sid, room.roomId);
        }

        const userRepo = await UserRepo();
        const user = await userRepo.search().where("sid").eq(sid).first();
        if (user) {
            user.point = 0;
            await userRepo.save(user);
        }
    }
}
