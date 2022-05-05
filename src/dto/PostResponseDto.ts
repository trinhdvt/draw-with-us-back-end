import {AccountDto} from "./AccountDto";
import mapper from "js-model-mapper";
import Post from "../models/Post";
import {plainToClass} from "class-transformer";

export const postMapper = mapper([{
    name: "postId",
    from: "id"
}, 'title', 'slug', 'content', 'postThumbnail', 'publishedDate', 'createdDate'])

export class PostResponseDto {
    postId: number;
    title: string;
    author: AccountDto;
    content: string;
    slug: string;
    isOwner: boolean = false;
    isBookmarked: boolean = false;
    postThumbnail: string;
    createdDate: Date;
    publishedDate: Date;
    bookmarkedCount: number;
    commentCount: number;

    public static toPostResponseDto(entity: Post): PostResponseDto {

        const json = postMapper(entity);
        const postDto: PostResponseDto = plainToClass(PostResponseDto, json);

        postDto.bookmarkedCount = entity.bookmarkedAccount?.length;
        postDto.commentCount = entity.comments?.length;

        return postDto;
    }
}

