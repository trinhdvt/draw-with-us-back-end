import * as http from "http";

import {Server} from "socket.io";
import registerUserHandler from "./handler/UserHandler";
import {CorsOptions} from "cors";
import registerRoomHandler from "./handler/RoomHandler";
import registerGameHandler from "./handler/GameHandler";
import {IOType} from "./SocketEvent";

export default class SocketServer {
    public readonly io: IOType;

    constructor(httpServer: http.Server, cors?: CorsOptions) {
        this.io = new Server(httpServer, {
            cors: cors
        });
        this.register();
    }

    private register() {
        this.io.on("connection", socket => {
            registerUserHandler(this.io, socket);
            registerRoomHandler(this.io, socket);
            registerGameHandler(this.io, socket);
        });
    }
}
