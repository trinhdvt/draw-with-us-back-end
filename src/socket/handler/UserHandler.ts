import {Container} from "typedi";

import logger from "../../utils/Logger";
import UserServices from "../../service/UserServices";
import {IOType, SocketType} from "../SocketEvent";

const registerUserHandler = (io: IOType, socket: SocketType) => {
    const userServices = Container.get(UserServices);
    const sid = socket.id;
    logger.info(`Client connected with id: ${sid}`);

    socket.on("user:init", async callback => {
        const data = await userServices.createAnonymousUser(sid);
        return callback(data);
    });

    socket.on("user:update", async arg => {
        const {eid, name} = arg;
        await userServices.updateAnonymousUser(eid, name);
    });

    socket.on("disconnecting", async () => {
        logger.info(`Client disconnecting with id: ${sid}`);
        await userServices.removeAnonymousUser(sid);
    });
};

export default registerUserHandler;
