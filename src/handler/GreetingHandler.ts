import {IOType, SocketType} from "../interfaces/SocketIO";

const registerGreetingHandler = (io: IOType, socket: SocketType) => {
    console.log(`Client connected ${socket.id}`);

    socket.on("message", (message: string) => {
        console.log(`Message received: ${message}`);
        io.emit("greeting", "We have new member");
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected ${socket.id}`);
    });
};

export default registerGreetingHandler;
