import {createServer, Server} from "http";

import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import {Sequelize} from "sequelize-typescript";
import express from "express";
import cors, {CorsOptions} from "cors";
import compression from "compression";
import morgan from "morgan";

import sequelize from "./models";
import RedisClient from "./redis";
import logger, {morganLogStream} from "./utils/Logger";
import SocketServer from "./socket/SocketServer";

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
        this.host = process.env.HOST ?? "0.0.0.0";
        this.corsOptions = {
            origin: ["https://draw-with.trinhdvt.tech", "http://localhost:3000"],
            methods: ["GET", "POST", "PUT", "DELETE"]
        };
        this.logPattern = ":req[X-Real-IP] :method :url :status - :response-time ms";
        if (process.env.NODE_ENV !== "production") {
            this.logPattern = "dev";
        }
    }

    public start() {
        this.database
            .sync()
            .then(() => {
                logger.info("Database initialized!");

                this.httpServer = this.httpServer.listen(this.port, this.host, () => {
                    logger.info(`Server started at http://${this.host}:${this.port}`);

                    const gracefulShutdown = () => {
                        SocketServer.close(async () => {
                            logger.info("Socket server is closed");
                            await RedisClient.closeClient();
                        });

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
        this.app.use(morgan(this.logPattern, {stream: morganLogStream}));
    }

    public getServer(): express.Application {
        return this.app;
    }
}
