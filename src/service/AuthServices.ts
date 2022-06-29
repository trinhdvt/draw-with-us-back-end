import {Service} from "typedi";
import jwt, {JwtPayload, TokenExpiredError} from "jsonwebtoken";
import axios from "axios";
import {ForbiddenError} from "routing-controllers";

import {IFbProfile, IGoogleProfile} from "../interfaces/IOAuth";
import User from "../models/User.model";
import IUserCredential from "../interfaces/IUserCredential";

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

    async googleLogin(accessToken: string) {
        const {name, email, picture} = await this.getGoogleProfile(accessToken);
        const {id, role} = await this.createSocialAccount(name, email, picture);

        const tokenPayload = {name, email, id, avatar: picture, role};
        const token = this.createAccessToken(tokenPayload);
        return {token};
    }

    async fbLogin(code: string) {
        const access_token = await this.getFbAccessToken(code);
        const {name, email, picture} = await this.getFbProfile(access_token);
        const user = await this.createSocialAccount(name, email, picture.data.url);

        const tokenPayload = {name, email, id: user.id, avatar: picture.data.url, role: user.role};
        const token = this.createAccessToken(tokenPayload);
        return {token};
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

    async getGoogleProfile(access_token: string): Promise<IGoogleProfile> {
        const {data} = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {Authorization: `Bearer ${access_token}`}
        });
        return data;
    }

    async createSocialAccount(name: string, email: string, avatar: string) {
        let user = await User.findOne({where: {email}});
        if (!user) {
            user = await User.create({name, email, avatar});
        }
        return user;
    }

    isValidJwt(token: string, ignoreExpiration = false) {
        try {
            jwt.verify(token, this.SECRET, {ignoreExpiration});
            return true;
        } catch (e) {
            if (e instanceof TokenExpiredError && !ignoreExpiration) return false;
            throw new ForbiddenError("Invalid token");
        }
    }

    getPayLoad(token: string): IUserCredential {
        try {
            const decoded = jwt.verify(token, this.SECRET, {ignoreExpiration: true}) as JwtPayload;
            const {id, email, role} = decoded;
            return {id, email, role};
        } catch (e) {
            throw new ForbiddenError("Invalid token");
        }
    }
}
//ya29.A0ARrdaM8RRDQab_Hupww_vsrzSBZpfgg4Dj3LEMLAjz9Dj_8yLcuVMFpIjcORa_OK8wPoR-APhR-LcWp_D8cY0NdbAiuH3QYOcRz0OBd6vE7DSuv2oB-hsdvCqtIWIqbI7rIwA2AZOdB_vuoq2ole4goxPDgXYUNnWUtBVEFTQVRBU0ZRRl91NjFWOExWVUwzZnA0Rmk0STNEcmRDb21ndw0163
