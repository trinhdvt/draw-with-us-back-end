import "reflect-metadata";
import "dotenv/config";
import App from "./app";
import {useContainer, useExpressServer} from "routing-controllers";
import {Container} from "typedi";
import {GlobalErrorHandler} from "./middlewares/GlobalErrorHandler";
import {CurrentUserChecker, PreAuthorize} from "./middlewares/JwtFilterMiddleware";
import SocketServer from "./socket/SocketServer";

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
    classTransformer: true,
    plainToClassTransformOptions: {
        enableImplicitConversion: true
    },
    routePrefix: "/api",
    controllers: [__dirname + "/controller/*.js"],
    middlewares: [GlobalErrorHandler],
    authorizationChecker: PreAuthorize,
    currentUserChecker: CurrentUserChecker
});

// register socket.io
new SocketServer(app.httpServer, app.corsOptions);

// connect to db then start the server
app.start();
