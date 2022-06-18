import {UserRedis} from "../redis/models/User.redis";

type IAnonymousUser = Pick<UserRedis, "sid" | "name" | "avatar"> & {
    eid: string;
};

type IPlayer = Partial<IAnonymousUser> & {
    topk?: number;
    isHost: boolean;
    point: number;
};

export type {IAnonymousUser, IPlayer};
