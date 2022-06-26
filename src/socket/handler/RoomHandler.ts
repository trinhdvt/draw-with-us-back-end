import {Container} from "typedi";

import {IOType, SocketType} from "../SocketEvent";
import RoomServices from "../../service/RoomServices";
import logger from "../../utils/Logger";

const registerRoomHandler = (io: IOType, socket: SocketType) => {
    const sid = socket.id;
    const roomServices = Container.get(RoomServices);

    socket.on("room:join", async (payload, callback) => {
        try {
            const {roomId, onMiddleGame} = await roomServices.joinRoom({...payload, sid});
            callback({roomId, onMiddleGame});
        } catch ({message}) {
            callback({message});
        }
    });

    socket.on("room:msg", (roomId, payload) => {
        if (!socket.rooms.has(roomId)) return;
        roomServices.sendMessage(roomId, payload);
    });

    socket.on("room:exit", async (roomId: string) => {
        try {
            logger.debug(`Client ${sid} exiting room ${roomId}`);
            await roomServices.removePlayer(sid, roomId);
        } catch (e) {
            logger.error(e);
        }
    });
};

export default registerRoomHandler;
