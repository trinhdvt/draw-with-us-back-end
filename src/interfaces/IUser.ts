import {UserRedis} from "../redis/models/User.redis";

type IUserInfo = Pick<UserRedis, "name" | "avatar">;

type IAnonymousUser = IUserInfo & {
    sid: string;
    eid: string;
};

type IPlayer = Partial<IAnonymousUser> & {
    topk?: number;
    isHost: boolean;
    point: number;
};

export type {IAnonymousUser, IPlayer, IUserInfo};
