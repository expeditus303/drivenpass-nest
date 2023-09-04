import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  email: string;

  @IsStrongPassword({
    minLength: 10,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Strong password with min length of 10, including lowercase, uppercase, symbols, and numbers.',
    example: 'ExampleP@ssw0rd!',
  })
  password: string;

  constructor(params?: Partial<SignUpDto>) {
    if (params) Object.assign(this, params);
  }
}

export class ProcessedSignUpDto {
  email: string;
  encryptedPassword: string;
}
