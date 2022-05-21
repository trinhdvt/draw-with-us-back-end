import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Room from "./Room.model";
import User from "./User.model";

@Table({
    tableName: "room_player"
})
export default class RoomPlayer extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    point: number;

    @Column
    @ForeignKey(() => Room)
    roomId: number;

    @BelongsTo(() => Room)
    room: Room;

    @Column
    @ForeignKey(() => User)
    playerId: number;

    @BelongsTo(() => User)
    player: User;
}
