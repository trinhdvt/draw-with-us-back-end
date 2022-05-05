import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Account from "./Account";
import Post from "./Post";

@Table({
    tableName: "bookmarked_post"
})
class BookmarkedPost extends Model {

    @ForeignKey(() => Account)
    @Column({
        primaryKey: true
    })
    accountId!: number;

    @ForeignKey(() => Post)
    @Column({
        primaryKey: true
    })
    postId!: number;

    @Column({defaultValue: new Date()})
    bookmarkedDate?: Date;
}

export default BookmarkedPost;