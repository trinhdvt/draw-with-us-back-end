import {Service} from "typedi";
import jwt from "jsonwebtoken";
import axios from "axios";

import {IFbProfile} from "../interfaces/IOAuth";

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

    async getFbAccessToken(code: string) {
        const fbCredentials = {
            client_id: process.env.FB_CLIENT_ID_DEV,
            redirect_uri: process.env.FB_REDIRECT_URI_DEV,
            client_secret: process.env.FB_CLIENT_SECRET_DEV,
            code
        };
        if (process.env.NODE_ENV === "production") {
            fbCredentials["client_id"] = process.env.FB_CLIENT_ID_PROD;
            fbCredentials["redirect_uri"] = process.env.FB_REDIRECT_URI_PROD;
            fbCredentials["client_secret"] = process.env.FB_CLIENT_SECRET_PROD;
        }

        const {data} = await axios.get("https://graph.facebook.com/v14.0/oauth/access_token", {
            params: fbCredentials
        });
        const {access_token} = data;
        return access_token;
    }

    async getFbProfile(access_token: string) {
        const {data} = await axios.get<IFbProfile>(
            `https://graph.facebook.com/me?fields=name,email,picture.width(100).height(100)`,
            {
                params: {
                    access_token
                }
            }
        );
        return data;
    }
}
