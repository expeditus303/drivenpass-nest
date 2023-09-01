import { Injectable } from '@nestjs/common';
import { EraseDto } from './dto/create-erase.dto';
import { JwtPayload } from '../users/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EraseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUserAndAssociatedData(userId: number) {
    return this.prisma.$transaction([
      this.prisma.card.deleteMany({ where: { userId } }),
      this.prisma.credential.deleteMany({ where: { userId } }),
      this.prisma.note.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  remove(eraseDto: EraseDto, authenticatedUser: JwtPayload) {}
}
