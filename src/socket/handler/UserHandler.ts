import {Container} from "typedi";

import logger from "../../utils/Logger";
import UserServices from "../../service/UserServices";
import {IOType, SocketType} from "../SocketEvent";

const registerUserHandler = (io: IOType, socket: SocketType) => {
    const userServices = Container.get(UserServices);
    const sid = socket.id;
    logger.info(`Client connected with id: ${sid}`);

    socket.on("user:init", async (initData, callback) => {
        const data = await userServices.createAnonymousUser(sid, initData);
        return callback(data);
    });

    socket.on("user:update", async (data, callback) => {
        const updatedInfo = await userServices.updateAnonymousUser(sid, data);
        return callback(updatedInfo);
    });

    socket.on("disconnecting", async () => {
        logger.info(`Client disconnecting with id: ${sid}`);
        await userServices.removeAnonymousUser(sid);
    });
};

export default registerUserHandler;
