import { Injectable } from '@nestjs/common';
import { CreateNoteDto, ProcessedNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
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
        encryptedText: processedNoteDto.encryptedText
      }
    })
  }

  findAll() {
    return `This action returns all notes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} note`;
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return `This action updates a #${id} note`;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }
}
