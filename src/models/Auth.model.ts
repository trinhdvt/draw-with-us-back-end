import {
    BelongsTo,
    Column,
    ForeignKey,
    Model,
    Table
} from "sequelize-typescript";
import User from "./User.model";

@Table({
    tableName: "auth"
})
export default class Auth extends Model {
    @Column({
        primaryKey: true
    })
    @ForeignKey(() => User)
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @Column
    authToken: string;

    @Column
    refreshToken: string;

    @Column
    activeToken: string;
}
