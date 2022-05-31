import {Server, Socket} from "socket.io";
import {IGameTopic} from "../dto/response/DrawTopicDto";

interface ServerToClientEvents {
    "room:update": () => void;
    "game:nextTurn": (topic: IGameTopic) => void;
    "game:endTurn": () => void;
}

interface ClientToServerEvents {
    "user:init": (callback: (e: Record<string, unknown>) => void) => void;
    "user:update": (arg: Record<string, string>) => void;
    "room:join": (eid: string, callback: (e: Record<string, string>) => void) => void;
    "room:exit": (roomId: string) => void;
    "game:start": () => void;
}

type IOType = Server<ClientToServerEvents, ServerToClientEvents>;
type SocketType = Socket<ClientToServerEvents, ServerToClientEvents>;

export type {IOType, SocketType};
