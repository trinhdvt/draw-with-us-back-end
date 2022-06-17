import {Entity, Schema} from "redis-om";

import RedisClient from "..";

interface UserRedis {
    name: string;
    sid: string;
    point: number;
}

class UserRedis extends Entity {}

const UserSchema = new Schema(UserRedis, {
    name: {type: "string"},
    sid: {type: "string"},
    point: {type: "number"}
});

const UserRepo = async () => {
    const userRepo = (await RedisClient.getClient()).fetchRepository(UserSchema);
    await userRepo.createIndex();

    return userRepo;
};

export default UserRepo;
export type {UserRedis};
