import {
    BelongsTo,
    BelongsToMany,
    Column,
    ForeignKey,
    HasMany,
    Model,
    Table
} from "sequelize-typescript";
import User from "./User.model";
import DrawTopic from "./DrawTopic.model";
import CollectionTopic from "./CollectionTopic.model";
import Room from "./Room.model";

@Table({
    tableName: "collection"
})
export default class Collection extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    name: string;

    @Column({
        defaultValue: false
    })
    isPublic: boolean;

    @Column({
        defaultValue: false
    })
    isOfficial: boolean;

    @Column
    image: string;

    @Column
    playedCount: number;

    @Column
    @ForeignKey(() => User)
    userId: number;

    @BelongsTo(() => User)
    creator: User;

    @BelongsToMany(() => DrawTopic, () => CollectionTopic)
    drawTopic: DrawTopic[];

    @HasMany(() => Room)
    rooms: Room[];
}
