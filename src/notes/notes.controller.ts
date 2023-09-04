import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../decorators/user.decorator';
import { JwtPayload } from '../users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note for an authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Note with this title already exists.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createNoteDto: CreateNoteDto,
    @User() authenticatedUser: JwtPayload,
  ) {
    return this.notesService.create(createNoteDto, authenticatedUser);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all notes for an authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of notes for the user.',
    type: [CreateNoteDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@User() authenticatedUser: JwtPayload) {
    return this.notesService.findAll(authenticatedUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a specific note by its ID for an authenticated user' })
  @ApiParam({ name: 'id', type: 'number', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail of the note.',
    type: CreateNoteDto,
  })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.notesService.findOne(+id, authenticatedUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific note by its ID for an authenticated user' })
  @ApiParam({ name: 'id', type: 'number', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.notesService.remove(+id, authenticatedUser);
  }
}
