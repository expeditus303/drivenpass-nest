import { ConflictException, Injectable } from '@nestjs/common';
import {
  CreateCredentialDto,
  ProcessedCredentialDto,
} from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { CredentialsRepository } from './credentials.repository';
import { JwtPayload } from '../users/entities/user.entity';
import Cryptr from 'cryptr';
import { decrypt, encrypt } from '../utils/encryption.utils';

@Injectable()
export class CredentialsService {
  constructor(private readonly credentialsRepository: CredentialsRepository) {}

  async create(createCredentialDto: CreateCredentialDto, user: JwtPayload) {
    const isTitleOwnedByUser = await this.credentialsRepository.findTitleByUser(
      createCredentialDto.title,
      user.id,
    );

    if (isTitleOwnedByUser)
      throw new ConflictException(
        'A credential with this title already exists for the user.',
      );

    const encryptedPassword = await encrypt(createCredentialDto.password);

    const processedCredentialDto = this.transformToProcessedDto(
      createCredentialDto,
      encryptedPassword,
    );

    await this.credentialsRepository.create(processedCredentialDto, user.id)

    return { message: 'Credential successfully registered.' };
  }

  findAll() {
    return `This action returns all credentials`;
  }

  findOne(id: number) {
    return `This action returns a #${id} credential`;
  }

  update(id: number, updateCredentialDto: UpdateCredentialDto) {
    return `This action updates a #${id} credential`;
  }

  remove(id: number) {
    return `This action removes a #${id} credential`;
  }

  transformToProcessedDto(
    createCredentialDto: CreateCredentialDto,
    encryptedPassword: string,
  ): ProcessedCredentialDto {
    const { password, ...rest } = createCredentialDto;
    return {
      ...rest,
      encryptedPassword,
    };
  }
}