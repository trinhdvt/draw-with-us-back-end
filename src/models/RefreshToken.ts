import {Column, Model, Table} from "sequelize-typescript";

@Table({
    tableName: "refresh_token"
})
export default class RefreshToken extends Model {
    @Column({
        primaryKey: true
    })
    email!: string;

    @Column
    refreshToken!: string;

    @Column
    accessToken!: string;
}
