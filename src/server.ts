import "reflect-metadata";
import "dotenv/config";
import App from "./app";
import {useContainer, useExpressServer} from "routing-controllers";
import {Container} from "typedi";
import {GlobalErrorHandler} from "./middlewares/GlobalErrorHandler";
import {
    CurrentUserChecker,
    PreAuthorize
} from "./middlewares/JwtFilterMiddleware";
import {Server} from "socket.io";

useContainer(Container);

const app = new App();
// create an express Application with common middleware
app.boostrap();

// inject controller
useExpressServer(app.getServer(), {
    development: true,
    defaultErrorHandler: false,
    defaults: {
        paramOptions: {
            required: true
        }
    },
    routePrefix: "/api",
    controllers: [__dirname + "/controller/*.js"],
    middlewares: [GlobalErrorHandler],
    authorizationChecker: PreAuthorize,
    currentUserChecker: CurrentUserChecker
});

// connect to database then start server
const io = new Server(app.httpServer);
io.on("connection", () => {
    console.log("Socket connected");
});
app.start();
