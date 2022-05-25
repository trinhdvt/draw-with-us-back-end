import {Server, Socket} from "socket.io";

interface ServerToClientEvents {
    "room:update": () => void;
}

interface ClientToServerEvents {
    "user:init": (callback: (e: Record<string, unknown>) => void) => void;
    "user:update": (arg: Record<string, string>) => void;
    "room:join": (eid: string, callback: (e: Record<string, string>) => void) => void;
    "room:exit": (roomId: string) => void;
    "game:join": (roomId: string, callback: (e: Record<string, unknown>) => void) => void;
}

type IOType = Server<ClientToServerEvents, ServerToClientEvents>;
type SocketType = Socket<ClientToServerEvents, ServerToClientEvents>;

export type {IOType, SocketType};
