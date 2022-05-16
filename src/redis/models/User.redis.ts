import {Entity, Schema} from "redis-om";

interface UserRedis {
    name: string;
    sid: string;
}

class UserRedis extends Entity {}

const UserSchema = new Schema(UserRedis, {
    name: {type: "string"},
    sid: {type: "string"}
});

export default UserSchema;
