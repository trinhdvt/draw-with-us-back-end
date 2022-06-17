import * as http from "http";

import {Server} from "socket.io";
import {CorsOptions} from "cors";

import {IOType} from "./SocketEvent";
import {registerGameHandler, registerRoomHandler, registerUserHandler} from "./handler";

export default class SocketServer {
    public static io: IOType = null;

    constructor(httpServer: http.Server, cors?: CorsOptions) {
        if (SocketServer.io == null) {
            SocketServer.io = new Server(httpServer, {
                cors: cors
            });
            this.register();
        }
    }

    private register() {
        SocketServer.io.on("connection", socket => {
            registerUserHandler(SocketServer.io, socket);
            registerRoomHandler(SocketServer.io, socket);
            registerGameHandler(SocketServer.io, socket);
        });
    }

    /**
     * Make specified socket join specified room
     * @param sid - Socket's ID
     * @param roomId - Room's ID
     */
    public static joinRoom(sid: string, roomId: string) {
        SocketServer.io.in(sid).socketsJoin(roomId);
        SocketServer.io.to(roomId).emit("room:update");
    }

    /**
     * Make specified socket leave specified room
     * @param sid - Socket's ID
     * @param roomId - Room's ID
     */
    public static leaveRoom(sid: string, roomId: string) {
        SocketServer.io.in(sid).socketsLeave(roomId);
        SocketServer.io.to(roomId).emit("room:update");
    }

    /**
     * Close socket server
     * @param cb - Callback function
     */
    public static close(cb?: (err?: Error) => void) {
        SocketServer.io.disconnectSockets(true);
        SocketServer.io.close(cb);
    }
}
