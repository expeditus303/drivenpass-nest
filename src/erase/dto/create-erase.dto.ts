import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EraseDto {
  @ApiProperty({
    description: 'The password of the user to validate erasure request.',
    example: 'userPassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
