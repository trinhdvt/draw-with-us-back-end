import {BelongsToMany, Column, HasMany, Model, Table} from "sequelize-typescript";

import TopicSample from "./TopicSample.model";
import Collection from "./Collection.model";
import CollectionTopic from "./CollectionTopic.model";

@Table({
    tableName: "draw_topic"
})
export default class DrawTopic extends Model {
    @Column({
        primaryKey: true
    })
    id: number;

    @Column
    nameEn: string;

    @Column
    nameVi: string;

    @HasMany(() => TopicSample)
    samples: TopicSample[];

    @BelongsToMany(() => Collection, () => CollectionTopic)
    collections: Collection[];
}
