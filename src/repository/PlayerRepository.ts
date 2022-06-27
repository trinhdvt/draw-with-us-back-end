import {Service} from "typedi";
import ms from "ms";

import UserRepo, {UserRedis} from "../redis/models/User.redis";
import StringUtils from "../utils/StringUtils";
import {IUserInfo} from "../interfaces/IUser";

@Service()
class PlayerRepository {
    async create(sid: string, initData?: IUserInfo) {
        const RANDOM_IMG = Math.ceil(Math.random() * 30);
        const avatar = initData.avatar || `${process.env.CDN_URL}/${RANDOM_IMG}.webp`;
        const name = initData.name || StringUtils.randomName();
        const playerData = {
            name,
            sid,
            avatar,
            point: 0
        };

        const userRepo = await UserRepo();
        const user = await userRepo.createAndSave(playerData);
        const ttl = ms("1d") / 1e3;
        await userRepo.expire(user.entityId, ttl);

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
