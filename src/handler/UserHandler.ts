import StringUtils from "../utils/StringUtils";
import logger from "../utils/Logger";
import {Container} from "typedi";
import UserServices from "../service/UserServices";
import {IOType, SocketType} from "../SocketServer";

const registerUserHandler = (io: IOType, socket: SocketType) => {
    const userServices = Container.get(UserServices);
    const sid = socket.id;
    logger.info(`Client connected with id: ${sid}`);

    socket.on("user:init", async callback => {
        const userData = {
            sid: sid,
            name: StringUtils.randomName()
        };
        const user = await userServices.createAnonymousUser(userData, "1d");

        callback({
            ...userData,
            id: user.entityId
        });
    });

    socket.on("user:update", async arg => {
        const {id, name} = arg;
        await userServices.updateAnonymousUser(id, name);
    });

    socket.on("disconnect", async () => {
        logger.info(`Client disconnected with id: ${sid}`);

        await userServices.removeAnonymousUser(sid);
    });
};

export default registerUserHandler;
