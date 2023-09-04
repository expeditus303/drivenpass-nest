import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BaseNoteDto {
  @ApiProperty({ description: 'Title of the note', example: 'My First Note' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class CreateNoteDto extends BaseNoteDto {
  @ApiProperty({
    description: 'Text content of the note',
    example: 'This is my first note content.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  constructor(params?: Partial<CreateNoteDto>) {
    super();
    if (params) Object.assign(this, params);
  }
}

export class ProcessedNoteDto extends BaseNoteDto {
  @ApiProperty({
    description: 'Encrypted text content of the note',
    example: 'abx123xyz',
  })
  encryptedText: string;
}
