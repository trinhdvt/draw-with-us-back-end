import {Server, Socket} from "socket.io";

import {IGameTopic} from "../dto/response/DrawTopicDto";
import {IAnonymousUser, IUserInfo} from "../interfaces/IUser";
import {IMessage} from "../interfaces/IMessage";
import {IRoomJoinEvent} from "../interfaces/IRoom";

interface ServerToClientEvents {
    "room:update": () => void;
    "game:nextTurn": (topic: IGameTopic) => void;
    "game:endTurn": () => void;
    "game:finish": () => void;
    "room:msg": (payload: IMessage) => void;
    "list-room:update": () => void;
}

interface ClientToServerEvents {
    "user:init": (initData: IUserInfo, callback: (e: IAnonymousUser) => void) => void;
    "user:update": (arg: IUserInfo, callback: (e: IUserInfo) => void) => void;
    "room:join": (payload: IRoomJoinEvent, callback: (e: Record<string, unknown>) => void) => void;
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
