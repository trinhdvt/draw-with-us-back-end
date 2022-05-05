import {IsNotEmpty, MinLength} from "class-validator";

export default class PasswordDto {

    @MinLength(6)
    @IsNotEmpty()
    password!: string;

    @MinLength(6)
    @IsNotEmpty()
    matchedPassword!: string;
}