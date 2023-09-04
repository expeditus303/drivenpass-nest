import { Injectable } from '@nestjs/common';
import { ProcessedCardDto } from './dto/create-card.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTitleByUser(title: string, userId: number) {
    return this.prisma.card.findFirst({
      where: {
        userId: userId,
        AND: {
          title: title,
        },
      },
    });
  }

  create(processedCardDto: ProcessedCardDto, userId: number) {
    return this.prisma.card.create({
      data: {
        userId: userId,
        title: processedCardDto.title,
        cardHolder: processedCardDto.cardHolder,
        encryptedCardNumber: processedCardDto.encryptedCardNumber,
        encryptedCVC: processedCardDto.encryptedCVC,
        expiryMonth: processedCardDto.expiryMonth,
        expiryYear: processedCardDto.expiryYear,
        encryptedPassword: processedCardDto.encryptedPassword,
        isVirtual: processedCardDto.isVirtual,
        cardType: processedCardDto.cardType,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.card.findMany({
      where: {
        userId: userId,
      },
    });
  }

  findById(id: number) {
    return this.prisma.card.findFirst({
      where: {
        id: id,
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.card.delete({
      where: {
        id: id,
        AND: {
          userId: userId,
        },
      },
    });
  }
}
