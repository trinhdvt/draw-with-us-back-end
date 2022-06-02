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

    socket.on("game:predict", async (roomId: string, image: string, callback) => {
        const isCorrect = await gameServices.check(sid, roomId, image);
        callback({
            isCorrect: isCorrect
        });
        io.to(roomId).emit("room:update");
    });
};

export default registerGameHandler;
