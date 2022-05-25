interface RoomResponse {
    /**
     * Alias for EntityId
     */
    eid: string;

    /**
     * Generated short id for the room
     */
    id: string;

    /**
     * Host's entityId
     */
    hostEId: string;

    name: string;
    timeOut: number;
    maxUsers: number;
    currentUsers: number;
    collectionName: string;
}

export default RoomResponse;
