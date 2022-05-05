import {BelongsTo, Column, DefaultScope, ForeignKey, Model, Table} from "sequelize-typescript";
import Account from "./Account";
import Post from "./Post";

@DefaultScope(() => ({
    order: [
        ['solved', 'DESC'],
        ['reportedDate', 'DESC']
    ]
}))
@Table({
    tableName: "post_report"
})
class PostReport extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @ForeignKey(() => Account)
    @Column
    accountId!: number;

    @BelongsTo(() => Account)
    account!: Account;

    @ForeignKey(() => Post)
    @Column
    postId!: number;

    @BelongsTo(() => Post)
    post!: Post;

    @Column
    reportedDate?: Date;

    @Column
    content?: string;

    @Column({
        field: "is_solved",
        defaultValue: false
    })
    solved?: Boolean;

    @Column
    decision?: string;
}

export default PostReport;