interface RoomResponse {
    /**
     * Alias for EntityId
     */
    eid: string;

    /**
     * Generated short id for the room
     */
    id: string;
    name: string;
    timeOut: number;
    maxUsers: number;
    currentUsers: number;
    collectionName: string;
    image?: string;
    isPrivate: boolean;
}

export default RoomResponse;
