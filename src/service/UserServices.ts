import {Inject, Service} from "typedi";

import PlayerRepository from "../repository/PlayerRepository";
import {IAnonymousUser, IUserInfo} from "../interfaces/IUser";

import RoomServices from "./RoomServices";

@Service()
export default class UserServices {
    @Inject()
    private roomServices: RoomServices;

    @Inject()
    private playerRepo: PlayerRepository;

    /**
     * Create anonymous user and store in Redis
     * @param sid - User's socket id
     * @param initData - User's name and avatar
     */
    async createAnonymousUser(sid: string, initData?: IUserInfo): Promise<IAnonymousUser> {
        const {entityId, name, avatar} = await this.playerRepo.create(sid, initData);
        return {
            eid: entityId,
            name,
            sid,
            avatar
        };
    }

    /**
     * Remove anonymous user from Redis. User also be removed from playing room.
     * @param sid - User's socket id
     */
    async removeAnonymousUser(sid: string) {
        const user = await this.playerRepo.getBySid(sid);
        if (user) {
            await this.playerRepo.remove(user);
        }
        await this.roomServices.removePlayer(sid);
    }

    /**
     * Update user's info
     * @param sid - User's socket id
     * @param data - User's name and avatar
     */
    async updateAnonymousUser(sid: string, {name, avatar}: IUserInfo): Promise<IUserInfo> {
        let user = await this.playerRepo.getBySid(sid);
        name = name.slice(0, 30);
        if (user && name) {
            user.name = name;
            user.avatar = avatar;
            user = await this.playerRepo.save(user);
        }
        return {name: user.name, avatar: user.avatar};
    }
}
