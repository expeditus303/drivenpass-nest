import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsStrongPassword({minLength: 10, minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1})
    @IsNotEmpty()
    password: string
}
