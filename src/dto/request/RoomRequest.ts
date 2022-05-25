import {IsInt, IsNotEmpty} from "class-validator";

export default class RoomRequest {
    @IsNotEmpty()
    @IsInt()
    timeOut!: number;

    @IsNotEmpty()
    @IsInt()
    maxUsers!: number;

    @IsNotEmpty()
    collectionId!: string;
}
