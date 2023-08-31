import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto, ProcessedNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';
import { JwtPayload } from '../users/entities/user.entity';
import { decrypt, encrypt } from '../utils/encryption.utils';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async create(createNoteDto: CreateNoteDto, authenticatedUser: JwtPayload) {
    const isTitleOwnedByUser = await this.notesRepository.findTitleByUser(
      createNoteDto.title,
      authenticatedUser.id,
    );

    if (isTitleOwnedByUser)
      throw new ConflictException(
        'A note with this title already exists for the user.',
      );

    const encryptedText = await encrypt(createNoteDto.text);

    const processedNoteDto: ProcessedNoteDto = this.transformToProcessedDto(
      createNoteDto,
      encryptedText,
    );

    await this.notesRepository.create(
      processedNoteDto,
      authenticatedUser.id,
    );

    return {
      message: `Note '${createNoteDto.title}' successfully registered.`,
    };
  }

  async findAll(authenticatedUser: JwtPayload) {
    const userNotes = await this.notesRepository.findAll(
      authenticatedUser.id,
    );

    const userNotesDecrypted = await Promise.all(
      userNotes.map(async (note) => {
        try {
          const decryptedText = await decrypt(note.encryptedText);
          const { encryptedText, ...notesWithoutEncryptedText } =
            note;
          const decryptedNotes: CreateNoteDto = {
            ...notesWithoutEncryptedText,
            text: decryptedText,
          };
          return decryptedNotes;
        } catch (error) {
          return {
            message: `Failed to decrypt text for note with title: ${note.title}`,
          };
        }
      }),
    );

    return userNotesDecrypted;
  }

  async findOne(id: number, authenticatedUser: JwtPayload) {
    const userCredential = await this.getUserNotes(id, authenticatedUser)

    const decryptedText = await decrypt(userCredential.encryptedText);

    const { encryptedText, ...noteWithoutEncryptedText } =
      userCredential;
    const decryptedNote = {
      ...noteWithoutEncryptedText,
      text: decryptedText,
    };
    return decryptedNote;
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return `This action updates a #${id} note`;
  }

  remove(id: number) {
    return `This action removes a #${id} note`;
  }

  private transformToProcessedDto(
    createNoteDto: CreateNoteDto,
    encryptedText: string,
  ): ProcessedNoteDto {
    const { text, ...noteWithoutText } = createNoteDto;
    return {
      ...noteWithoutText,
      encryptedText: encryptedText,
    };
  }

  private async getUserNotes(id: number, authenticatedUser: JwtPayload) {
    const userNote = await this.notesRepository.findById(id);

    if (!userNote) throw new NotFoundException('Note not found.');

    if (userNote.userId !== authenticatedUser.id)
      throw new ForbiddenException(
        'You do not have permission to access this note.',
      );

    return userNote;
  }
}
