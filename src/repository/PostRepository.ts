import {Service} from "typedi";
import PageRequest from "../dto/PageRequest";
import Post from "../models/Post";
import Account from "../models/Account";
import {Comment} from "../models/Comment";
import sequelize from "../models";
import {QueryTypes} from "sequelize";

@Service()
export default class PostRepository {
    constructor() {
    }

    public async getPostByPublishDate(pageRequest: PageRequest) {
        const {page, size} = pageRequest;
        const {attribute, direction} = pageRequest.sort;

        return await Post.scope("public").findAll({
            offset: page * size,
            limit: size,
            attributes: {
                exclude: ["content"],
            },
            order: [[attribute ?? "publishedDate", direction]],
            include: [
                {
                    model: Account,
                    as: "bookmarkedAccount",
                    attributes: ["id"],
                },
                {
                    model: Comment,
                    as: "comments",
                    attributes: ["id"],
                },
            ],
        });
    }

    public async getPostOfUser(userId: number, pageRequest: PageRequest) {
        const {page, size} = pageRequest;
        const {attribute, direction} = pageRequest.sort;

        return await Post.scope("public").findAll({
            where: {
                accountId: userId
            },
            offset: page * size,
            limit: size,
            attributes: {
                exclude: ["content"],
            },
            order: [[attribute ?? "publishedDate", direction]],
            include: [
                {
                    model: Account,
                    as: "bookmarkedAccount",
                    attributes: ["id"],
                },
                {
                    model: Comment,
                    as: "comments",
                    attributes: ["id"],
                },
            ],
        });
    }

    public async getPopularPostByBookmarkCount(size: number) {
        const query = `select id, title, published_date, created_date, slug
                       from post p
                                join bookmarked_post bp on p.id = bp.post_id
                       where p.status = true
                       group by bp.post_id
                       order by count(bp.post_id) desc
                       limit ?`;

        let posts = await sequelize.query(query, {
            replacements: [size],
            type: QueryTypes.SELECT,
            model: Post,
            mapToModel: true,
        });

        for (const p of posts) {
            p.comments = await p.$get("comments");
            p.bookmarkedAccount = await p.$get("bookmarkedAccount");
        }
        return posts;
    }

    public async getPopularPostByCommentCount(size: number) {

        const query = "select p.id,title,published_date,created_date,slug " +
            " from post p join comment c on p.id = c.post_id " +
            "where p.status=true " +
            "group by c.post_id " +
            "order by count(c.post_id) desc limit ?";

        let posts = await sequelize.query(query, {
            replacements: [size],
            type: QueryTypes.SELECT,
            mapToModel: true,
            model: Post,
        });

        for (const p of posts) {
            p.comments = await p.$get('comments');
            p.bookmarkedAccount = await p.$get('bookmarkedAccount');
        }

        return posts;
    }

    public async searchPostByKeyword(keyword: string, pageRequest: PageRequest) {
        const {page, size} = pageRequest;

        const query = `select p.id,
                              title,
                              published_date,
                              created_date,
                              slug,
                              match(title, content) against(:key in natural language mode) as score
                       from post p
                       where match(title, content) against(:key in natural language mode)
                         and status = 1
                       order by score desc
                       limit :offset, :limit`;

        let posts = await sequelize.query(query, {
            replacements: {
                key: keyword,
                offset: page * size,
                limit: size
            },
            type: QueryTypes.SELECT,
            mapToModel: true,
            model: Post
        });

        for (const p of posts) {
            p.comments = await p.$get('comments');
            p.bookmarkedAccount = await p.$get('bookmarkedAccount');
        }

        return posts;
    }

    public async findPostByIdAndScope(id: number, scope: 'public' | 'draft' = 'public') {
        return await Post.scope(scope).findByPk(id, {
            include: [
                {
                    model: Account,
                    as: "author",
                    include: [{
                        model: Post,
                        as: 'posts',
                        attributes: ['id']
                    }, {
                        model: Account,
                        as: "followingMe",
                        attributes: ['id']
                    }]
                }, {
                    model: Comment,
                    as: 'comments',
                    attributes: ['id']
                }, {
                    model: Account,
                    as: "bookmarkedAccount",
                    attributes: ["id"],
                }
            ]
        });
    }

    public async findPostById(postId: number) {
        return await Post.findByPk(postId, {
            include: [{
                model: Account,
                as: 'author'
            }]
        });
    }

    public async getPostBySlug(slug: string) {
        return await Post.findOne({
            where: {
                slug: slug
            },
            include: [{
                model: Account,
                as: 'author',
                attributes: ['id']
            }]
        });
    }
}

