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

    constructor(params?: Partial<CreateNoteDto>) {
        super(); 
        if (params) Object.assign(this, params);
      }
}

export class ProcessedNoteDto extends BaseNoteDto {
    encryptedText: string;
}