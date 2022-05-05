import {BelongsTo, BelongsToMany, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Post from "./Post";
import Account from "./Account";

@Table({
    tableName: "comment"
})
class Comment extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @ForeignKey(() => Post)
    @Column
    postId!: number;

    @BelongsTo(() => Post)
    post!: Post;

    @ForeignKey(() => Account)
    @Column
    accountId!: number;

    @BelongsTo(() => Account)
    account!: Account;

    @Column
    content!: string;

    @Column
    commentDate!: Date

    @BelongsToMany(() => Account, () => CommentLike)
    likedAccount?: Account[];
}

@Table({
    tableName: "comment_like"
})
class CommentLike extends Model {

    @ForeignKey(() => Comment)
    @Column({
        primaryKey: true,
    })
    commentId!: number;

    @ForeignKey(() => Account)
    @Column({
        primaryKey: true,
    })
    accountId!: number;

}


export {Comment, CommentLike};