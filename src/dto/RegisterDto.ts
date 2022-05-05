import {IsEmail, IsNotEmpty} from "class-validator";
import PasswordDto from "./PasswordDto";

export default class RegisterDto extends PasswordDto {
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    email!: string;
}