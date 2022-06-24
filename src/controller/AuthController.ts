import {BodyParam, HttpCode, JsonController, Post, UnauthorizedError} from "routing-controllers";
import {Inject, Service} from "typedi";
import {StatusCodes} from "http-status-codes";

import AuthServices from "../service/AuthServices";

@Service()
@JsonController()
export default class AuthController {
    @Inject()
    private authServices: AuthServices;

    @Post("/login/fb")
    @HttpCode(StatusCodes.OK)
    async fbLogin(@BodyParam("code") code: string) {
        try {
            const accessToken = await this.authServices.getFbAccessToken(code);
            console.log(accessToken);
            const {email, name, picture} = await this.authServices.getFbProfile(accessToken);
            const tokenPayload = {name, email};
            console.log(tokenPayload);
            const token = this.authServices.createAccessToken(tokenPayload);
            return {name: name, avatar: picture.data.url, token};
        } catch (e) {
            console.log(e);
            throw new UnauthorizedError("Fb login failed");
        }
    }
}
