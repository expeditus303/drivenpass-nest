import { Injectable } from '@nestjs/common';
import { ProcessedSignUpDto } from './dto/sign-up.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(processedUserDto: ProcessedSignUpDto) {
    return this.prisma.user.create({
      data: processedUserDto,
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }
}
