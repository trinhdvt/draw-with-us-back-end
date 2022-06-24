import {BodyParam, HttpCode, JsonController, Post} from "routing-controllers";
import {Inject, Service} from "typedi";
import {StatusCodes} from "http-status-codes";
import axios from "axios";

import AuthServices from "../service/AuthServices";
import {IFbProfile} from "../interfaces/IOAuth";

@Service()
@JsonController()
export default class AuthController {
    @Inject()
    private authServices: AuthServices;

    @Post("/login/fb")
    @HttpCode(StatusCodes.OK)
    async fbLogin(@BodyParam("access_token") accessToken: string) {
        const {data} = await axios.get<IFbProfile>(
            `https://graph.facebook.com/me?fields=name,email,picture.width(100).height(100)&access_token=${accessToken}`
        );
        const {
            name,
            email,
            picture: {
                data: {url}
            }
        } = data;

        const tokenPayload = {name, email};
        const token = this.authServices.createAccessToken(tokenPayload);

        return {name, avatar: url, token};
    }
}
