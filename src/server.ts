require('dotenv').config();
import "reflect-metadata"
import App from "./app";
import {useContainer, useExpressServer} from "routing-controllers";
import {Container} from "typedi";
import {GlobalErrorHandler} from "./middlewares/GlobalErrorHandler";
import {CurrentUserChecker, PreAuthorize} from "./middlewares/JwtFilterMiddleware";

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
})

// connect to database then start server (default port is 8080)
app.listen();
