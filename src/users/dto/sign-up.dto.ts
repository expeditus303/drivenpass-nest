import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({
    minLength: 10,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @IsNotEmpty()
  password: string;

  constructor(params?: Partial<SignUpDto>) {
    if (params) Object.assign(this, params);
  }
}

export class ProcessedSignUpDto {
  email: string;
  encryptedPassword: string;
}
