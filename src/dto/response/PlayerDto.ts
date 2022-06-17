import {UserRedis} from "../../redis/models/User.redis";

interface IPlayer extends Pick<UserRedis, "name" | "point"> {
    eid: string;
    topk?: number;
    isHost: boolean;
}

export default IPlayer;
