import {IOType, SocketType} from "../SocketEvent";
import {Container} from "typedi";
import RoomServices from "../../service/RoomServices";
import logger from "../../utils/Logger";

const registerRoomHandler = (io: IOType, socket: SocketType) => {
    const sid = socket.id;
    const roomServices = Container.get(RoomServices);

    socket.on("room:join", async (eid: string, callback) => {
        try {
            const roomId = await roomServices.joinRoom(sid, eid);
            await socket.join(roomId);
            callback({
                roomId: roomId
            });

            logger.debug(`Client ${sid} joined room ${eid}`);

            socket.emit("room:update");
        } catch (e) {
            logger.error(e);
            callback({
                message: e.message
            });
        }
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
