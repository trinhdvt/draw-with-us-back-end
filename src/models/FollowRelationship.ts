import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Account from "./Account";

@Table({
    tableName: "following_relationship"
})
class Follow extends Model {

    @ForeignKey(() => Account)
    @Column({
        primaryKey: true
    })
    accountId!: number;

    @ForeignKey(() => Account)
    @Column({
        primaryKey: true
    })
    followingAccountId!: number;

    @Column
    followingDate?: Date;
}

export default Follow;