import {Server, Socket} from "socket.io";
import {DefaultEventsMap} from "socket.io/dist/typed-events";

type IOType = Server<DefaultEventsMap, DefaultEventsMap>;
type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>;

export type {IOType, SocketType};
