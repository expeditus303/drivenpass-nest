import { Injectable } from '@nestjs/common';
import { SignUpDto, ProcessedSignUpDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {

  constructor(private readonly prisma: PrismaService) {}

  create(processedUserDto: ProcessedSignUpDto) {
    return this.prisma.user.create({
      data: processedUserDto
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email
      }
    })
  }

}
