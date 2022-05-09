import {Sequelize} from "sequelize-typescript";

import "dotenv/config";

const sequelize = new Sequelize({
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 300000
    },
    benchmark: true,
    define: {
        underscored: true,
        timestamps: false
    },
    logging: false
});

sequelize.addModels([__dirname + "/*.model.{ts,js}"]);
export default sequelize;
