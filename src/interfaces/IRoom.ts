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

export type {IRoomJoinEvent, IRoomJoinData};
