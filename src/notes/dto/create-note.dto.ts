import { IsNotEmpty, IsString } from "class-validator";

export class BaseNoteDto {
    @IsString()
    @IsNotEmpty()
    title: string


}

export class CreateNoteDto extends BaseNoteDto {
    @IsString()
    @IsNotEmpty()
    text: string 
}

export class ProcessedNoteDto extends BaseNoteDto {
    encryptedText: string;
}