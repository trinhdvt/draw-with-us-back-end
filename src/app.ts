import express from "express";
import sequelize from "./models";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import {Sequelize} from "sequelize-typescript";
import {createServer, Server} from "http";

export default class App {
    private readonly app: express.Application;
    public readonly database: Sequelize;
    public readonly httpServer: Server;
    public readonly port: number;
    public readonly host: string;

    constructor() {
        this.app = express();
        this.database = sequelize;
        this.httpServer = createServer(this.app);
        this.port = parseInt(process.env.PORT ?? "8888");
        this.host = process.env.HOST ?? "localhost";
    }

    public start() {
        this.database
            .sync()
            .then(() => {
                console.info("Database initialized!");

                this.httpServer.listen(this.port, this.host, () => {
                    console.info(`Server on http://${this.host}:${this.port}`);
                });
            })
            .catch(err => console.error(err));
    }

    public boostrap() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(cookieParser());
    }

    public getServer(): express.Application {
        return this.app;
    }
}
