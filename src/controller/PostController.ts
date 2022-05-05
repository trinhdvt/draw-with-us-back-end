import {
    Authorized,
    Body,
    CurrentUser, Delete,
    Get,
    HttpCode,
    JsonController,
    Param,
    Post, Put,
    QueryParams, Res
} from "routing-controllers";
import {Service} from "typedi";
import PageRequest from "../dto/PageRequest";
import {StatusCodes} from "http-status-codes";
import PostService from "../service/PostService";
import IUserCredential from "../interfaces/IUserCredential";
import PostRequestDto from "../dto/PostRequestDto";
import {Response} from "express";

@Service()
@JsonController()
export default class PostController {

    constructor(private postService: PostService) {
    }

    @Get("/post")
    @HttpCode(StatusCodes.OK)
    async getPosts(@QueryParams() pageRequest: PageRequest) {
        const {prop, keyword} = pageRequest;

        if (keyword) {
            return await this.postService.searchPostByKeyword(keyword, pageRequest);
        }

        if (prop) {
            return await this.postService.getPopularPost(prop, pageRequest.size);
        }

        return await this.postService.getPostByPublishDate(pageRequest);
    }

    @Get("/post/:id")
    @HttpCode(StatusCodes.OK)
    async getPostById(
        @Param("id") id: number,
        @CurrentUser({required: false}) user: IUserCredential) {

        let loggedInId = user?.id;

        return await this.postService.getPublicPostById(id, loggedInId);
    }

    @Get("/post/:slug/edit")
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async getPostContentBySlug(@Param("slug") slug: string,
                               @CurrentUser() user: IUserCredential) {
        const userId = user.id;

        return await this.postService.getPostContentBySlug(slug, userId);
    }

    @Post("/post")
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async publishNewPost(@Body() requestDto: PostRequestDto,
                         @CurrentUser() author: IUserCredential) {

        return await this.postService.addNewPostOrDraft(requestDto, author.id, true);
    }

    @Put("/post/:postId")
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async updatePost(@Body() requestDto: PostRequestDto,
                     @Param("postId") postId: number,
                     @CurrentUser() author: IUserCredential) {

        return await this.postService.updatePostById(postId, requestDto, author.id);
    }


    @Delete("/post/:postId")
    @Authorized()
    async deletePost(@Param("postId") postId: number,
                     @CurrentUser() author: IUserCredential,
                     @Res() resp: Response) {

        await this.postService.deletePostById(postId, author.id);

        return resp.status(StatusCodes.NO_CONTENT).send();
    }


    @Post("/draft")
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async createNewDraft(@Body() requestDto: PostRequestDto,
                         @CurrentUser() author: IUserCredential) {

        return await this.postService.addNewPostOrDraft(requestDto, author.id, false);
    }


    @Get("/draft/:draftId")
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async getDraftById(@Param("draftId") draftId: number,
                       @CurrentUser() author: IUserCredential) {

        return await this.postService.getDraftById(draftId, author.id);
    }

    @Put("/draft/:draftId")
    @Authorized()
    async updateDraft(@Param("draftId") draftId: number,
                      @Body() requestDto: PostRequestDto,
                      @CurrentUser() author: IUserCredential,
                      @Res() resp: Response) {

        await this.postService.updateDraftById(draftId, requestDto, author.id);

        return resp.status(StatusCodes.NO_CONTENT).send();
    }
}