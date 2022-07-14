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

enum ERoomEvent {
    JOIN,
    START,
    FINISH,
    END_TURN,
    PLAYER_SUCCESS,
    NEXT_TURN,
    PAUSED,
    RESUME
}

export type {IRoomJoinEvent, IRoomJoinData, IRoomPreview};
export {ERoomEvent};
