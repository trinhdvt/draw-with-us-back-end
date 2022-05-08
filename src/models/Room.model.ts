import {
    BelongsTo,
    BelongsToMany,
    Column,
    ForeignKey,
    Model,
    Table
} from "sequelize-typescript";
import User from "./User.model";
import Collection from "./Collection.model";
import RoomPlayer from "./RoomPlayer.model";

@Table({
    tableName: "room"
})
export default class Room extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    image: string;

    @Column
    slug: string;

    @Column
    maxUser: number;

    @Column
    timeout: number;

    @Column
    @ForeignKey(() => User)
    hostId: number;

    @BelongsTo(() => User)
    host: User;

    @Column
    @ForeignKey(() => Collection)
    collectionId: number;

    @BelongsTo(() => Collection)
    collection: Collection;

    @BelongsToMany(() => User, () => RoomPlayer)
    players: User[];
}
