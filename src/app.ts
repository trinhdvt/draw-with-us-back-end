import express from "express";
import sequelize from "./models";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

export default class App {
    private readonly app: express.Application;

    constructor() {
        this.app = express();
    }

    public listen() {
        const port: number = parseInt(process.env.PORT ?? "8888");

        App.initDatabase()
            .then(() => {
                console.log("Database initialized!");

                this.app.listen(port, () => {
                    console.log(`Server listening on http://localhost:${port}`);
                });
            })
            .catch(err => console.error(`Error when initial database${err}`));
    }

    public boostrap() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(cookieParser());
    }

    public getServer(): express.Application {
        return this.app;
    }

    private static async initDatabase() {
        // await sequelize.sync();
    }
}
