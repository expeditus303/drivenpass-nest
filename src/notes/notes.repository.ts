import { Injectable } from '@nestjs/common';
import { ProcessedNoteDto } from './dto/create-note.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTitleByUser(title: string, userId: number) {
    return this.prisma.note.findFirst({
      where: {
        userId: userId,
        AND: {
          title: title,
        },
      },
    });
  }

  create(processedNoteDto: ProcessedNoteDto, userId: number) {
    return this.prisma.note.create({
      data: {
        userId: userId,
        title: processedNoteDto.title,
        encryptedText: processedNoteDto.encryptedText,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.note.findMany({
      where: {
        userId: userId,
      },
    });
  }

  findById(id: number) {
    return this.prisma.note.findFirst({
      where: {
        id: id,
      },
    });
  }

  remove(id: number, userId: number) {
    return this.prisma.note.delete({
      where: {
        id: id,
        AND: {
          userId: userId,
        },
      },
    });
  }
}
