import { Injectable } from '@nestjs/common';
import { ProcessedCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(processedCredentialDto: ProcessedCredentialDto, userId: number) {
    return this.prisma.credential.create({
      data: {
        userId: userId,
        title: processedCredentialDto.title,
        url: processedCredentialDto.url,
        username: processedCredentialDto.username,
        encryptedPassword: processedCredentialDto.encryptedPassword 
      },
    });
  }

  findTitleByUser(title: string, userId: number) {
    return this.prisma.credential.findFirst({
      where: {
        userId: userId,
        AND: {
          title: title,
        },
      },
    });
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
}
