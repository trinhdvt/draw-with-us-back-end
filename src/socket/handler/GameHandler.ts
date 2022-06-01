import {IOType, SocketType} from "../SocketEvent";
import {Container} from "typedi";
import logger from "../../utils/Logger";
import GameServices from "../../service/GameServices";

const registerGameHandler = (io: IOType, socket: SocketType) => {
    const sid = socket.id;
    const gameServices = Container.get(GameServices);

    socket.on("game:start", async () => {
        try {
            await gameServices.startGame(sid);
        } catch (e) {
            logger.error(e);
        }
    });
};

export default registerGameHandler;
