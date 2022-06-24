import {Service} from "typedi";
import jwt from "jsonwebtoken";

@Service()
export default class AuthServices {
    private readonly SECRET;
    private readonly TOKEN_TIME;

    constructor() {
        this.SECRET = process.env.SECRET || "123qwe!@#";
        this.TOKEN_TIME = process.env.TOKEN_TIME || "24h";
    }

    createAccessToken(payload: string | object, expireIn?: string | number) {
        return jwt.sign(payload, this.SECRET, {expiresIn: expireIn ?? this.TOKEN_TIME});
    }
}
