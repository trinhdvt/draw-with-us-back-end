import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";

import DrawTopic from "./DrawTopic.model";

@Table({
    tableName: "topic_sample"
})
export default class TopicSample extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @Column
    drawSample: string;

    @Column
    @ForeignKey(() => DrawTopic)
    topicId: number;

    @BelongsTo(() => DrawTopic)
    topic: DrawTopic;
}
