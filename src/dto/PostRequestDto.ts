import {IsNotEmpty, MaxLength} from "class-validator";

export default class PostRequestDto {

    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsNotEmpty()
    content: string;

    @IsNotEmpty()
    @MaxLength(250)
    postThumbnail: string;
}