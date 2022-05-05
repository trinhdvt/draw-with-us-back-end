import {Service} from "typedi";
import {
    Authorized,
    BadRequestError,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    Param,
    QueryParam, QueryParams
} from "routing-controllers";
import UserService from "../service/UserService";
import IUserCredential from "../interfaces/IUserCredential";
import {StatusCodes} from "http-status-codes";
import {isEmail} from "class-validator";
import PageRequest from "../dto/PageRequest";
import PostService from "../service/PostService";

@Service()
@JsonController()
export default class UserController {


    constructor(private userService: UserService,
                private postService: PostService) {
    }

    @Get("/user/:userId")
    @HttpCode(StatusCodes.OK)
    async getUserInfoById(@Param("userId") userId: number,
                          @CurrentUser({required: false}) currentUser: IUserCredential) {

        return await this.userService.getUserInfoById(userId, currentUser?.id);
    }

    @Get("/user")
    @HttpCode(StatusCodes.OK)
    async getUserInfoByEmail(@QueryParam("email") email: string,
                             @CurrentUser({required: false}) currentUser: IUserCredential) {
        if (!isEmail(email)) {
            throw new BadRequestError("Invalid email address");
        }

        return await this.userService.getUserInfoByEmail(email, currentUser?.id);
    }

    @Get("/whoami")
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async whoAmI(@CurrentUser() currentUser: IUserCredential) {

        return await this.userService.getUserInfoById(currentUser.id, undefined);
    }

    @Get("/user/posts/:userId")
    @HttpCode(StatusCodes.OK)
    async getAllPostOfUserById(@Param("userId") userId: number,
                               @QueryParams() pageRequest: PageRequest) {

        return await this.postService.getPostByUserId(userId, pageRequest);
    }
}