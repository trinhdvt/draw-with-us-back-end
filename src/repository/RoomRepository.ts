import {Service} from "typedi";
import {EntityData} from "redis-om";
import ms from "ms";

import RoomRepo, {RoomRedis} from "../redis/models/Room.redis";

type RoomKey = keyof RoomRedis;
type RoomValues = string | number | boolean | Date;

@Service()
class RoomRepository {
    async create(roomDto: EntityData) {
        const roomRepo = await RoomRepo();
        const room = await roomRepo.createAndSave(roomDto);
        const ttl = ms("1d") / 1e3;
        await roomRepo.expire(room.entityId, ttl);

        return room;
    }

    async getAll() {
        const roomRepo = await RoomRepo();
        return await roomRepo.search().all();
    }

    async getById(id: string) {
        const roomRepo = await RoomRepo();
        return await roomRepo.fetch(id);
    }

    async getByShortId(shortId: string) {
        return await this.getByAttr("roomId", shortId);
    }

    async getByPlayerIdsContain(playerId: string) {
        const roomRepo = await RoomRepo();
        return await roomRepo.search().where("playerIds").contain(playerId).all();
    }

    async getByAttr(key: RoomKey, value: RoomValues) {
        const roomRepo = await RoomRepo();
        return await roomRepo.search().where(key).eq(value).first();
    }

    async save(object: RoomRedis) {
        const roomRepo = await RoomRepo();
        await roomRepo.save(object);
        return object;
    }

    async remove(room: RoomRedis): Promise<void> {
        const roomRepo = await RoomRepo();
        await roomRepo.remove(room.entityId);
    }
}

export default RoomRepository;
