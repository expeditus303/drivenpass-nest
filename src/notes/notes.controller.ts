import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AuthGuard } from '../users/auth.guard';
import { User } from '../decorators/user.decorator';
import { JwtPayload } from '../users/entities/user.entity';

@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Body() createNoteDto: CreateNoteDto,
    @User() authenticatedUser: JwtPayload,
  ) {
    return this.notesService.create(createNoteDto, authenticatedUser);
  }

  @Get()
  findAll(@User() authenticatedUser: JwtPayload) {
    return this.notesService.findAll(authenticatedUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.notesService.findOne(+id, authenticatedUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.notesService.remove(+id, authenticatedUser);
  }
}
