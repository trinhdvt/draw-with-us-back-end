import {Inject, Service} from "typedi";

import PlayerRepository from "../repository/PlayerRepository";
import {IAnonymousUser} from "../dto/response/UserDto";

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
     */
    async createAnonymousUser(sid: string): Promise<IAnonymousUser> {
        const {entityId, name} = await this.playerRepo.create(sid, "1d");
        return {
            eid: entityId,
            name,
            sid
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
     * Update user's name
     * @param eid - User's entity ID
     * @param name - New user's name
     */
    async updateAnonymousUser(eid: string, name: string) {
        const user = await this.playerRepo.getById(eid);
        if (user) {
            user.name = name;
            await this.playerRepo.save(user);
        }
    }
}
