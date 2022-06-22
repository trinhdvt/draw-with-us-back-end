import * as http from "http";
import {hostname} from "os";

import {Server} from "socket.io";
import {CorsOptions} from "cors";
import {instrument} from "@socket.io/admin-ui";

import {IOType} from "./SocketEvent";
import {registerGameHandler, registerRoomHandler, registerUserHandler} from "./handler";

export default class SocketServer {
    public static io: IOType = null;

    constructor(httpServer: http.Server, cors?: CorsOptions) {
        if (SocketServer.io == null) {
            SocketServer.io = new Server(httpServer, {
                cors: cors
            });
            instrument(SocketServer.io, {
                auth: {
                    type: "basic",
                    username: "admin",
                    password: "$2b$10$pkJpbPclw0/C2pOe533arOLx/pubsEh.xciCy8SwK0gvMFCV1DChG"
                },
                serverId: `${hostname()}#${process.pid}`,
                namespaceName: "/admin"
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
        SocketServer.io.emit("list-room:update");
    }

    /**
     * Make specified socket leave specified room
     * @param sid - Socket's ID
     * @param roomId - Room's ID
     */
    public static leaveRoom(sid: string, roomId: string) {
        SocketServer.io.in(sid).socketsLeave(roomId);
        SocketServer.io.to(roomId).emit("room:update");
        SocketServer.io.emit("list-room:update");
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
