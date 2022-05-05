import {
    BelongsTo,
    BelongsToMany,
    Column,
    ForeignKey,
    HasMany,
    Model,
    Scopes,
    Table
} from "sequelize-typescript";
import Account from "./Account";
import BookmarkedPost from "./BookmarkedPost";
import {Category, PostCategory} from "./Category";
import {Comment} from "./Comment";


@Scopes(() => ({
    "public": {
        where: {
            status: true
        },
        order: [['publishedDate', 'DESC']]
    },
    "draft": {
        where: {
            status: false
        },
        order: [['createdDate', 'DESC']]
    }
}))
@Table({
    tableName: "post"
})
class Post extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    title!: string;

    @Column
    content!: string;

    @Column
    slug?: string;

    @Column
    postThumbnail?: string;

    @Column({defaultValue: false})
    status!: Boolean;

    @Column
    createdDate?: Date;

    @Column
    publishedDate?: Date;

    @ForeignKey(() => Account)
    @Column
    accountId?: number;

    @BelongsTo(() => Account)
    author?: Account;

    @BelongsToMany(() => Account, () => BookmarkedPost)
    bookmarkedAccount?: Account[];

    @BelongsToMany(() => Category, () => PostCategory)
    postCategory?: Category[];

    @HasMany(() => Comment)
    comments?: Comment[];

}

export default Post;