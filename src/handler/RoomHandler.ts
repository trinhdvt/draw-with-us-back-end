import {IOType, SocketType} from "../SocketServer";
import {Container} from "typedi";
import RoomServices from "../service/RoomServices";
import logger from "../utils/Logger";

const registerRoomHandler = (io: IOType, socket: SocketType) => {
    const sid = socket.id;
    const roomServices = Container.get(RoomServices);

    socket.on("room:join", async (eid, callback) => {
        try {
            const roomId = await roomServices.joinRoom(sid, eid);
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
};

export default registerRoomHandler;
