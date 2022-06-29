import RoomResponse from "../dto/response/RoomResponse";

interface IRoomJoinEvent {
    /**
     * Room's eid
     */
    eid: string;
    /**
     * Room's password (if it is private)
     */
    password?: string;
}

interface IRoomJoinData extends IRoomJoinEvent {
    /**
     * User's socket id
     */
    sid: string;
}

interface IRoomPreview extends RoomResponse {
    host: {
        name: string;
        avatar: string;
    };
}

export type {IRoomJoinEvent, IRoomJoinData, IRoomPreview};
