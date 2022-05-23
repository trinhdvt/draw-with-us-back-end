import * as http from "http";

import {Server, Socket} from "socket.io";
import registerUserHandler from "./handler/UserHandler";
import {CorsOptions} from "cors";
import {DefaultEventsMap} from "socket.io/dist/typed-events";
import registerRoomHandler from "./handler/RoomHandler";
import registerGameHandler from "./handler/GameHandler";

type IOType = Server<DefaultEventsMap, DefaultEventsMap>;
type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>;

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
export type {IOType, SocketType};
