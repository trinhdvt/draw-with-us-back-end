import {Inject, Service} from "typedi";
import UserRepo, {UserRedis} from "../redis/models/User.redis";
import ms from "ms";
import {EntityData} from "redis-om";
import RoomServices from "./RoomServices";
import logger from "../utils/Logger";

@Service()
export default class UserServices {
    @Inject()
    private roomServices: RoomServices;

    /**
     * Create anonymous user and store in Redis
     * @param data - User's data. See {@link UserRedis}
     * @param expire - User's expiration time. Default is non-expire
     */
    async createAnonymousUser(data: EntityData, expire?: string) {
        const userRepo = await UserRepo();
        const user = await userRepo.createAndSave(data);
        if (expire) {
            const ttl = ms(expire) / 1e3;
            await userRepo.expire(user.entityId, ttl);
        }

        return user;
    }

    /**
     * Remove anonymous user from Redis. User also be removed from playing room.
     * @param sid - User's socket id
     */
    async removeAnonymousUser(sid: string) {
        logger.debug(`Remove anonymous user with sid: ${sid}`);
        const userRepo = await UserRepo();
        const user = await userRepo.search().where("sid").eq(sid).returnFirst();
        if (user) {
            await userRepo.remove(user.entityId);
        }

        await this.roomServices.removePlayer(sid);
    }

    /**
     * Update user's name
     * @param eid - User's entity ID
     * @param name - New user's name
     */
    async updateAnonymousUser(eid: string, name: string) {
        const userRepo = await UserRepo();
        const user = await userRepo.fetch(eid);
        if (user) {
            user.name = name;
            await userRepo.save(user);
        }
    }
}
