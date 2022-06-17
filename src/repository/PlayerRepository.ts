import {Service} from "typedi";
import ms from "ms";

import UserRepo, {UserRedis} from "../redis/models/User.redis";
import StringUtils from "../utils/StringUtils";

@Service()
class PlayerRepository {
    async create(sid: string, expire?: string) {
        const playerData = {
            sid: sid,
            name: StringUtils.randomName(),
            point: 0
        };

        const userRepo = await UserRepo();
        const user = await userRepo.createAndSave(playerData);
        if (expire) {
            const ttl = ms(expire) / 1e3;
            await userRepo.expire(user.entityId, ttl);
        }

        return user;
    }

    async getAll() {
        const userRepo = await UserRepo();
        return await userRepo.search().all();
    }

    async getById(id: string) {
        const userRepo = await UserRepo();
        return await userRepo.fetch(id);
    }

    async getBySid(sid: string) {
        const userRepo = await UserRepo();
        return await userRepo.search().where("sid").eq(sid).returnFirst();
    }

    async save(object: UserRedis) {
        const userRepo = await UserRepo();
        await userRepo.save(object);
        return object;
    }

    async remove(player: UserRedis): Promise<void> {
        const userRepo = await UserRepo();
        await userRepo.remove(player.entityId);
    }
}

export default PlayerRepository;
