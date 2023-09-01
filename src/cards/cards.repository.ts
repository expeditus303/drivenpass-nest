import { Injectable } from '@nestjs/common';
import { CreateCardDto, ProcessedCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
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
        cardType: processedCardDto.cardType
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

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
