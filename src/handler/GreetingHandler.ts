import {IOType, SocketType} from "../interfaces/SocketIO";
import UserRepo from "../redis/models/User.redis";
import StringUtils from "../utils/StringUtils";

const registerGreetingHandler = (io: IOType, socket: SocketType) => {
    const sid = socket.id;
    console.log(`Client connected ${sid}`);

    socket.on("message", (message: string) => {
        console.log(`Message received: ${message}`);
        io.emit("greeting", "We have new member");
    });

    socket.on("user:init", async callback => {
        const userData = {
            sid: sid,
            name: StringUtils.randomName()
        };

        const userRepo = await UserRepo();
        const user = await userRepo.createAndSave(userData);

        callback({
            ...userData,
            id: user.entityId
        });
    });

    socket.on("user:update", async arg => {
        const userRepo = await UserRepo();
        const {id, name} = arg;
        const user = await userRepo.fetch(id);
        if (user.entityId) {
            user.name = name;
            await userRepo.save(user);
        }
    });

    socket.on("disconnect", async () => {
        console.log(`Client disconnected ${sid}`);

        const userRepo = await UserRepo();
        const user = await userRepo.search().where("sid").eq(sid).returnFirst();
        if (user) {
            await userRepo.remove(user.entityId);
        }
    });
};

export default registerGreetingHandler;
