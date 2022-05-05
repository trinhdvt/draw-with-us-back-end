import {BelongsToMany, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Post from "./Post";

@Table({
    tableName: "category"
})
class Category extends Model {

    @Column({
        primaryKey: true,
        autoIncrement: true
    })
    id!: number;

    @Column
    name!: string;

    @BelongsToMany(() => Post, () => PostCategory)
    postCategory?: Post[];
}

@Table({
    tableName: "post_category"
})
class PostCategory extends Model {

    @ForeignKey(() => Post)
    @Column({
        primaryKey: true
    })
    postId!: number;

    @ForeignKey(() => Category)
    @Column({
        primaryKey: true
    })
    categoryId!: number;
}

export {Category, PostCategory};