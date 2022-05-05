import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import Account from "./Account";

@Table({
    tableName: "password_reset_token"
})
export default class PasswordResetToken extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column(DataType.STRING)
    token!: string | null;

    @Column
    expireDate!: Date;

    @ForeignKey(() => Account)
    @Column
    accountId!: number;

    @BelongsTo(() => Account)
    account!: Account;
}