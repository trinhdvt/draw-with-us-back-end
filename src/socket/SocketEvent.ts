import {Server, Socket} from "socket.io";

import {IGameTopic} from "../dto/response/DrawTopicDto";
import {IAnonymousUser} from "../interfaces/IUser";
import {IMessage} from "../interfaces/IMessage";

interface ServerToClientEvents {
    "room:update": () => void;
    "game:nextTurn": (topic: IGameTopic) => void;
    "game:endTurn": () => void;
    "room:msg": (payload: IMessage) => void;
}

interface ClientToServerEvents {
    "user:init": (callback: (e: IAnonymousUser) => void) => void;
    "user:update": (arg: Record<string, string>) => void;
    "room:join": (eid: string, callback: (e: Record<string, string>) => void) => void;
    "room:exit": (roomId: string) => void;
    "game:start": () => void;
    "game:predict": (
        roomId: string,
        image: string,
        callback: (e: {isCorrect: boolean}) => void
    ) => void;
    "room:msg": (roomId: string, payload: IMessage) => void;
}

type IOType = Server<ClientToServerEvents, ServerToClientEvents>;
type SocketType = Socket<ClientToServerEvents, ServerToClientEvents>;

export type {IOType, SocketType};
