import {IsInt, IsNotEmpty, IsOptional, Length} from "class-validator";

export default class RoomRequest {
    @IsOptional()
    @Length(3, 50)
    name?: string;

    @IsNotEmpty()
    @IsInt()
    timeOut!: number;

    @IsNotEmpty()
    @IsInt()
    maxUsers!: number;

    @IsNotEmpty()
    collectionId!: string;
}
