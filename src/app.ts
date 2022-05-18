import express from "express";
import sequelize from "./models";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import {Sequelize} from "sequelize-typescript";
import {createServer, Server} from "http";
import cors, {CorsOptions} from "cors";
import compression from "compression";
import morgan from "morgan";
import RedisClient from "./redis";
import logger from "./utils/Logger";

export default class App {
    private readonly app: express.Application;
    public readonly database: Sequelize;
    public httpServer: Server;
    public readonly port: number;
    public readonly host: string;
    public readonly corsOptions: CorsOptions;
    private readonly logPattern: string;

    constructor() {
        this.app = express();
        this.database = sequelize;
        this.httpServer = createServer(this.app);
        this.port = parseInt(process.env.PORT ?? "8888");
        this.host = process.env.HOST ?? "localhost";
        this.corsOptions = {
            origin: ["/https:\/\/(\w+\.)*trinhdvt\.tech$/", "http://localhost:3000"],
            methods: ["GET", "POST", "PUT", "DELETE"]
        };
        this.logPattern = ":remote-addr [:date[clf]] :method :url :status - :response-time ms";
    }

    public start() {
        this.database
            .sync()
            .then(() => {
                logger.info("Database initialized!");

                this.httpServer = this.httpServer.listen(this.port, this.host, () => {
                    logger.info(`Server started at http://${this.host}:${this.port}`);

                    const gracefulShutdown = async () => {
                        await RedisClient.closeClient();
                        this.httpServer.close(() => {
                            logger.info("Server stopped");
                            process.exit(0);
                        });
                    };
                    
                    process.on("SIGINT", gracefulShutdown);
                    process.on("SIGTERM", gracefulShutdown);
                });
            })
            .catch(err => logger.error(err));
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
