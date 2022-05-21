import {BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table} from "sequelize-typescript";
import Role from "./Role";
import Auth from "./Auth.model";
import Collection from "./Collection.model";
import Room from "./Room.model";
import RoomPlayer from "./RoomPlayer.model";

@Table({
    tableName: "user"
})
export default class User extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    name!: string;

    @Column
    email: string;

    @Column
    password: string;

    @Column
    image: string;

    @Column({
        type: DataType.ENUM({values: Object.keys(Role)}),
        defaultValue: Role.USER
    })
    role: Role;

    @HasOne(() => Auth)
    auth: Auth;

    @HasMany(() => Collection)
    collections: Collection[];

    @HasMany(() => Room)
    hostedRooms: Room[];

    @BelongsToMany(() => Room, () => RoomPlayer)
    playedRooms: Room[];
}
