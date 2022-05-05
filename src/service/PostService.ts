import {Service} from "typedi";
import PostRepository from "../repository/PostRepository";
import PageRequest, {PopularType} from "../dto/PageRequest";
import {PostResponseDto} from "../dto/PostResponseDto";
import {HttpError, NotFoundError, UnauthorizedError} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import Post from "../models/Post";
import {AccountDto} from "../dto/AccountDto";
import PostRequestDto from "../dto/PostRequestDto";
import StringUtils from "../utils/StringUtils";

@Service()
export default class PostService {

    constructor(private postRepo: PostRepository) {
    }

    public async getPostByPublishDate(pageRequest: PageRequest) {
        let pageOfPost = await this.postRepo.getPostByPublishDate(pageRequest);

        return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));
    }

    public async getPopularPost(property: PopularType, size: number) {
        let pageOfPost: Post[];

        switch (property) {
            case PopularType.BOOKMARK:
                pageOfPost = await this.postRepo.getPopularPostByBookmarkCount(size);

                return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));

            case PopularType.COMMENT:
                pageOfPost = await this.postRepo.getPopularPostByCommentCount(size);

                return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));

            default:
                throw new HttpError(StatusCodes.UNPROCESSABLE_ENTITY,
                    "Nonsupport popular type: " + property);
        }

    }

    public async searchPostByKeyword(keyword: string, pageRequest: PageRequest) {
        let pageOfPost = await this.postRepo.searchPostByKeyword(keyword, pageRequest);

        return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));
    }

    public async getPublicPostById(id: number, loggedInId: number | undefined) {
        const post = await this.postRepo.findPostByIdAndScope(id, "public");
        if (!post) {
            throw new NotFoundError("Not found");
        }

        const author = post.author;

        const authorDto = AccountDto.toBasicAccount(author);
        authorDto.postCount = author.posts.length;
        authorDto.followCount = author.followingMe.length;

        const postDto = PostResponseDto.toPostResponseDto(post);
        postDto.author = authorDto;
        postDto.isOwner = authorDto.accountId == loggedInId;
        for (const acc of post.bookmarkedAccount) {
            if (acc.id == loggedInId)
                postDto.isBookmarked = true;
        }

        return postDto;
    }

    public async getPostContentBySlug(slug: string, userId: number) {
        const post = await this.postRepo.getPostBySlug(slug);
        if (!post) {
            throw new NotFoundError("Not found");
        }

        if (post.author.id != userId) {
            throw new UnauthorizedError("Not authorized");
        }

        return PostResponseDto.toPostResponseDto(post);
    }

    public async addNewPostOrDraft(requestDto: PostRequestDto, authorId: number, isPublic: boolean) {
        const {title, content, postThumbnail} = requestDto;

        let post = Post.build({
            accountId: authorId,
            title: title,
            slug: `${StringUtils.createSlug(title)}-${Date.now()}`,
            content: content,
            postThumbnail: postThumbnail,
            status: isPublic,
            createdDate: new Date()
        });
        if (isPublic) {
            post.publishedDate = new Date();
        }

        post = await post.save();

        return {slug: post.slug};
    }

    public async updatePostById(postId: number, requestDto: PostRequestDto, userId: number) {
        const post = await this.postRepo.findPostById(postId);
        if (!post) {
            throw new NotFoundError("Post not found");
        }

        if (post.author.id !== userId) {
            throw new UnauthorizedError("Access denied");
        }

        const {title, content, postThumbnail} = requestDto;
        const slug = `${StringUtils.createSlug(title)}-${Date.now()}`;

        post.title = title;
        post.content = content;
        post.postThumbnail = postThumbnail;
        post.slug = slug;
        if (!post.status) {
            post.status = true;
            post.publishedDate = new Date();
        }

        await post.save();

        return {slug: post.slug};
    }

    public async deletePostById(postId: number, authorId: number) {
        const post = await this.postRepo.findPostById(postId);
        if (!post) {
            throw new NotFoundError("Post not found");
        }

        if (post.author.id !== authorId) {
            throw new UnauthorizedError("Permission denied");
        }

        await post.destroy();
    }

    public async getDraftById(draftId: number, authorId: number) {
        const post = await this.postRepo.findPostByIdAndScope(draftId, 'draft');
        if (!post) {
            throw new NotFoundError("Draft not found");
        }

        if (post.author.id !== authorId) {
            throw new UnauthorizedError("Access denied");
        }

        return PostResponseDto.toPostResponseDto(post);
    }

    public async updateDraftById(draftId: number, requestDto: PostRequestDto, authorId: number) {
        const post = await this.postRepo.findPostById(draftId);
        if (!post) {
            throw new NotFoundError("No draft found");
        }
        if (post.author.id !== authorId) {
            throw new UnauthorizedError("Permission denied");
        }

        const {title, content, postThumbnail} = requestDto;
        const slug = `${StringUtils.createSlug(title)}-${Date.now()}`;

        post.title = title;
        post.content = content;
        post.postThumbnail = postThumbnail;
        post.slug = slug;
        post.status = false;

        await post.save();
    }

    public async getPostByUserId(userId: number, pageRequest: PageRequest) {
        const pageOfPost = await this.postRepo.getPostOfUser(userId, pageRequest);

        return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));
    }
}

