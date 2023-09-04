import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class BaseCredentialDto {
  @ApiProperty({ description: 'Title of the credential' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'URL associated with the credential' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Username for the credential' })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class CreateCredentialDto extends BaseCredentialDto {
  @ApiProperty({ description: 'Password for the credential' })
  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(params?: Partial<CreateCredentialDto>) {
    super();
    if (params) Object.assign(this, params);
  }
}

export class ProcessedCredentialDto extends BaseCredentialDto {
  encryptedPassword: string;
}
