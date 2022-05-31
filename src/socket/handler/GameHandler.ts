import {IOType, SocketType} from "../SocketEvent";
import {Container} from "typedi";
import RoomServices from "../../service/RoomServices";
import logger from "../../utils/Logger";

const registerGameHandler = (io: IOType, socket: SocketType) => {
    const sid = socket.id;
    const roomServices = Container.get(RoomServices);

    socket.on("game:start", async () => {
        try {
            await roomServices.startGame(sid);
        } catch (e) {
            logger.error(e);
        }
    });
};

export default registerGameHandler;
