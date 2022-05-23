import {IOType, SocketType} from "../SocketServer";
import {Container} from "typedi";
import RoomServices from "../service/RoomServices";
import logger from "../utils/Logger";

const registerGameHandler = (io: IOType, socket: SocketType) => {
    const sid = socket.id;
    const roomServices = Container.get(RoomServices);

    socket.on("game:join", async (roomId, callback) => {
        try {
            logger.debug(`${sid} getting config from ${roomId}`);
            const roomConfig = await roomServices.getRoom(sid, roomId);
            logger.debug(roomConfig);
            callback({
                data: roomConfig
            });
        } catch (e) {
            callback({
                message: e.message
            });
        }
    });
};

export default registerGameHandler;
