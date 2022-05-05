import {IsEmail, IsNotEmpty, Length} from "class-validator";

export default class LoginDto {

    @IsEmail()
    @IsNotEmpty()
    public email!: string;

    @Length(6)
    @IsNotEmpty()
    public password!: string;
}