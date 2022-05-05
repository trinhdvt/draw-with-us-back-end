import {Sequelize} from "sequelize-typescript";
import Account from "./Account";
import Post from "./Post";
import BookmarkedPost from "./BookmarkedPost";
import {Category, PostCategory} from "./Category";
import {Comment, CommentLike} from "./Comment";
import Follow from "./FollowRelationship";
import Notification from "./Notification";
import PostReport from "./PostReport";
import RefreshToken from "./RefreshToken";
import PasswordResetToken from "./PasswordResetToken";

require('dotenv').config();

const sequelize = new Sequelize({
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 10000
    },
    benchmark: true,
    define: {
        underscored: true,
        timestamps: false
    },
    logging: false
});

sequelize.addModels(
    [Account, Post, BookmarkedPost,
        Category, PostCategory,
        Comment, CommentLike,
        Follow, Notification, PostReport,
        RefreshToken, PasswordResetToken]
);

export default sequelize;