import {Column, ForeignKey, Model, Table} from "sequelize-typescript";

import Collection from "./Collection.model";
import DrawTopic from "./DrawTopic.model";

@Table({
    tableName: "collection_topic"
})
export default class CollectionTopic extends Model {
    @ForeignKey(() => Collection)
    @Column({
        primaryKey: true
    })
    collectionId: number;

    @ForeignKey(() => DrawTopic)
    @Column({
        primaryKey: true
    })
    drawTopicId: number;
}
