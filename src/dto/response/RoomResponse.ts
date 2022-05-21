import {IUser} from "./UserDto";

interface RoomResponse {
    /**
     * Alias for EntityId
     */
    id: string;
    timeOut: number;
    maxUsers: number;
    currentUsers: number;
    collectionName: string;
    host?: Partial<IUser>;
}

export default RoomResponse;
