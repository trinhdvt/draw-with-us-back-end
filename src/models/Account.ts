import {BelongsToMany, Column, DataType, HasMany, HasOne, Model, Scopes, Table} from "sequelize-typescript";
import Post from "./Post";
import BookmarkedPost from "./BookmarkedPost";
import {Comment, CommentLike} from "./Comment";
import Follow from "./FollowRelationship";
import Notification from "./Notification";
import PasswordResetToken from "./PasswordResetToken";
import Role from "./Role";

@Scopes(() => ({
    "active": {
        where: {
            enabled: true
        }
    },
    "un-active": {
        where: {
            enabled: false
        }
    }
}))
@Table({
    tableName: "account"
})
class Account extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    email!: string;

    @Column
    password!: string;

    @Column
    name!: string;

    @Column({
        type: DataType.ENUM({values: Object.keys(Role)}),
        defaultValue: Role.ROLE_USER
    })
    role!: Role;

    @Column({defaultValue: false})
    enabled!: boolean;

    @Column(DataType.STRING)
    registerToken!: string | null;

    @Column(DataType.STRING)
    avatarLink!: string | null;

    @Column(DataType.STRING)
    about!: string | null;

    @Column(DataType.STRING)
    fbLink!: string | null;

    @Column(DataType.STRING)
    instagramLink!: string | null;

    @HasMany(() => Post)
    posts?: Post[];

    @BelongsToMany(() => Post, () => BookmarkedPost)
    bookmarkedPost?: Post[];

    @HasMany(() => Comment)
    comments?: Comment[];

    @BelongsToMany(() => Comment, () => CommentLike)
    likedComments?: Comment[];

    @BelongsToMany(() => Account, () => Follow, 'following_account_id')
    followingMe?: Account[];

    @HasMany(() => Notification)
    notifications?: Notification[];

    @HasOne(() => PasswordResetToken)
    pwdResetToken!: PasswordResetToken;
}

export default Account;