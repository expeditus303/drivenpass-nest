import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

class BaseCredentialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}

export class CreateCredentialDto extends BaseCredentialDto {
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


