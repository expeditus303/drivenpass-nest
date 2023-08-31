import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(
    createCredentialDto: CreateCredentialDto,
    authenticatedUser: JwtPayload,
  ) {
    const isTitleOwnedByUser = await this.credentialsRepository.findTitleByUser(
      createCredentialDto.title,
      authenticatedUser.id,
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

    await this.credentialsRepository.create(
      processedCredentialDto,
      authenticatedUser.id,
    );

    return {
      message: `Credential '${createCredentialDto.title}' successfully registered.`,
    };
  }

  async findAll(authenticatedUser: JwtPayload) {
    const userCredentials = await this.credentialsRepository.findAll(
      authenticatedUser.id,
    );

    const userCredentialsDecrypted = await Promise.all(
      userCredentials.map(async (credential) => {
        try {
          const decryptedPassword = await decrypt(credential.encryptedPassword);
          const { encryptedPassword, ...credentialsWithoutEncryptedPassword } =
            credential;
          const decryptedCredentials = {
            ...credentialsWithoutEncryptedPassword,
            password: decryptedPassword,
          };
          return decryptedCredentials;
        } catch (error) {
          return {
            message: `Failed to decrypt password for credential with title: ${credential.title}`,
          };
        }
      }),
    );

    return userCredentialsDecrypted;
  }

  async findOne(id: number, authenticatedUser: JwtPayload) {
    const userCredential = await this.getUserCredential(id, authenticatedUser)

    const decryptedPassword = await decrypt(userCredential.encryptedPassword);

    const { encryptedPassword, ...credentialWithoutEncryptedPassword } =
      userCredential;
    const decryptedCredential = {
      ...credentialWithoutEncryptedPassword,
      password: decryptedPassword,
    };
    return decryptedCredential;
  }

  async remove(id: number, authenticatedUser: JwtPayload) {
    const userCredential = await this.getUserCredential(id, authenticatedUser)

    await this.credentialsRepository.remove(id, authenticatedUser.id);

    return {
      message: `Credential '${userCredential.title}' successfully removed.`,
    };
  }

  private transformToProcessedDto(
    createCredentialDto: CreateCredentialDto,
    encryptedPassword: string,
  ): ProcessedCredentialDto {
    const { password, ...rest } = createCredentialDto;
    return {
      ...rest,
      encryptedPassword,
    };
  }

  private async getUserCredential(id: number, authenticatedUser: JwtPayload) {
    const userCredential = await this.credentialsRepository.findById(id);

    if (!userCredential) throw new NotFoundException('Credential not found.');

    if (userCredential.userId !== authenticatedUser.id)
      throw new ForbiddenException(
        'You do not have permission to access this credential.',
      );

    return userCredential;
  }
}
