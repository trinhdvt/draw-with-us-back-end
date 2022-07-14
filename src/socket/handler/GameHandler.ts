import {Container} from "typedi";

import {IOType, SocketType} from "../SocketEvent";
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

    socket.on("game:pause", async callback => {
        try {
            const result = await gameServices.pauseGame(sid);
            callback({
                isPaused: result
            });
        } catch (e) {
            callback({
                message: "Unable to pause game"
            });
        }
    });

    socket.on("game:predict", async (roomId: string, image: string, callback) => {
        const isCorrect = await gameServices.check(sid, roomId, image);
        return callback({isCorrect});
    });
};

export default registerGameHandler;
