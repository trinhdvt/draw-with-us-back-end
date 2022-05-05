import {
    BadRequestError,
    Body,
    BodyParam,
    CookieParam, ForbiddenError, Get,
    HeaderParam, HttpCode,
    JsonController,
    Post, Put, QueryParam,
    Res
} from "routing-controllers";
import {Response} from "express";
import LoginDto from "../dto/LoginDto";
import {Service} from "typedi";
import AuthService from "../service/AuthService";
import {StatusCodes} from "http-status-codes";
import ms from "ms";
import RegisterDto from "../dto/RegisterDto";
import PasswordDto from "../dto/PasswordDto";

@JsonController("/auth")
@Service()
export default class AuthController {


    constructor(private authService: AuthService) {
    }

    @Post("/login")
    async login(@Body() {email, password}: LoginDto,
                @Res() res: Response) {

        const {accessToken, refreshToken} = await this.authService.login(email, password);

        return res.status(StatusCodes.OK)
            .cookie("refresh-token", refreshToken, {
                httpOnly: true,
                maxAge: ms('0.5 y')
            }).json({token: accessToken});
    }

    @Post('/google')
    async loginWithGoogle(@BodyParam("google_token") googleToken: string,
                          @Res() res: Response) {

        const token = await this.authService.loginWithGoogle(googleToken);

        return res.status(StatusCodes.OK)
            .cookie("refresh-token", token.refreshToken, {
                httpOnly: true,
                maxAge: ms('0.5 y')
            }).json({token: token.accessToken});
    }

    @Post("/refreshToken")
    async refreshAccessToken(@HeaderParam("Authorization") accessToken: string,
                             @CookieParam("refresh-token") refreshToken: string,
                             @Res() res: Response) {

        if (!accessToken.startsWith("Bearer ")) {
            throw new ForbiddenError("Invalid Authorization header");
        }

        const newToken = await this.authService.reCreateToken(accessToken.substring(7), refreshToken);

        return res.status(StatusCodes.OK)
            .cookie("refresh-token", newToken.refreshToken, {
                httpOnly: true,
                maxAge: ms('0.5 y')
            }).json({token: newToken.accessToken});

    }

    @Post("/registration")
    @HttpCode(StatusCodes.ACCEPTED)
    async register(@Body() userData: RegisterDto) {
        if (userData.password !== userData.matchedPassword) {
            throw new BadRequestError("Password doesn't match")
        }

        await this.authService.register(userData);
    }

    @Post("/registrationConfirm")
    @HttpCode(StatusCodes.ACCEPTED)
    async registrationConfirm(@BodyParam("token") token: string) {
        await this.authService.activateAccount(token);
    }

    @Post("/resetPassword")
    @HttpCode(StatusCodes.ACCEPTED)
    async requestResetPwd(@BodyParam("email") email: string) {
        await this.authService.createPwdResetToken(email);
    }

    @Get("/changePassword")
    @HttpCode(StatusCodes.ACCEPTED)
    async validatePwdResetToken(@QueryParam("token") token: string) {
        await this.authService.validatePwdResetToken(token);
    }

    @Put("/savePassword")
    @HttpCode(StatusCodes.ACCEPTED)
    async resetPassword(@BodyParam("token") token: string,
                        @Body() newPwd: PasswordDto) {
        if (newPwd.password !== newPwd.matchedPassword) {
            throw new BadRequestError("Password doesn't match");
        }

        await this.authService.resetPassword(token, newPwd.password);
    }
}
