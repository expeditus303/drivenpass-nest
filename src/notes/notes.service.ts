import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    await this.notesRepository.create(processedNoteDto, authenticatedUser.id);

    return {
      message: `Note '${createNoteDto.title}' successfully registered.`,
    };
  }

  async findAll(authenticatedUser: JwtPayload) {
    const userNotes = await this.notesRepository.findAll(authenticatedUser.id);

    const userNotesDecrypted = await Promise.all(
      userNotes.map(async (note) => {
        return this.decryptNote(note);
      }),
    );

    return userNotesDecrypted;
  }

  async findOne(id: number, authenticatedUser: JwtPayload) {
    const userNote = await this.getUserNotes(id, authenticatedUser);
    return this.decryptNote(userNote);
  }

  async remove(id: number, authenticatedUser: JwtPayload) {
    const userNote = await this.getUserNotes(id, authenticatedUser);

    await this.notesRepository.remove(id, authenticatedUser.id);

    return {
      message: `Note '${userNote.title}' successfully removed.`,
    };
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

  async decryptNote(note: any): Promise<CreateNoteDto> {
    try {
      const decryptedText = await decrypt(note.encryptedText);
      const { encryptedText, ...noteWithoutEncryptedText } = note;

      return {
        ...noteWithoutEncryptedText,
        text: decryptedText,
      };
    } catch (error) {
      throw new Error(
        `Failed to decrypt text for note with title: ${note.title}`,
      );
    }
  }
}
