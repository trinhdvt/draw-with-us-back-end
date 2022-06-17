import {Column, DataType, Model, Table} from "sequelize-typescript";

type RoomConfig = {
    timeOut: Array<number>;
    maxUsers: Array<number>;
};

@Table({
    tableName: "app_config"
})
export default class AppConfig extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column({
        type: DataType.JSON
    })
    room: RoomConfig;

    @Column({
        type: DataType.JSON
    })
    collection: Record<string, unknown>;
}

export type {RoomConfig};
