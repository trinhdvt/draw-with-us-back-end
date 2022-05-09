import express from "express";
import sequelize from "./models";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import {Sequelize} from "sequelize-typescript";
import {createServer, Server} from "http";
import cors, {CorsOptions} from "cors";
import compression from "compression";
import morgan from "morgan";

export default class App {
    private readonly app: express.Application;
    public readonly database: Sequelize;
    public readonly httpServer: Server;
    public readonly port: number;
    public readonly host: string;
    private readonly corsOptions: CorsOptions;
    private readonly logPattern: string;

    constructor() {
        this.app = express();
        this.database = sequelize;
        this.httpServer = createServer(this.app);
        this.port = parseInt(process.env.PORT ?? "8888");
        this.host = process.env.HOST ?? "localhost";
        this.corsOptions = {
            origin: ["*"],
            methods: ["GET", "POST", "PUT", "DELETE"]
        };
        this.logPattern = ":remote-addr [:date[clf]] :method :url :status - :response-time ms";
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
        this.app.use(cors(this.corsOptions));
        this.app.use(compression());
        this.app.use(morgan(process.env.NODE_ENV === "production" ? this.logPattern : "dev"));
    }

    public getServer(): express.Application {
        return this.app;
    }
}
