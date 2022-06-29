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
            return await this.authServices.fbLogin(code);
        } catch (e) {
            console.log(e);
            throw new UnauthorizedError("Fb login failed");
        }
    }

    @Post("/login/google")
    @HttpCode(StatusCodes.OK)
    async googleLogin(@BodyParam("accessToken") accessToken: string) {
        try {
            return await this.authServices.googleLogin(accessToken);
        } catch (e) {
            console.log(e);
            throw new UnauthorizedError("Google login failed");
        }
    }
}
