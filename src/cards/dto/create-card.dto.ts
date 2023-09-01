import { CardType } from '@prisma/client';
import {
  IsBoolean,
  IsCreditCard,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
];
const CARD_TYPES = ['CREDIT', 'DEBIT', 'CREDIT_DEBIT'];

export class BaseCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  cardHolder: string;

  @IsString()
  @IsIn(MONTHS)
  @IsNotEmpty()
  expiryMonth: string;

  @IsNumberString({ no_symbols: true })
  @Min(CURRENT_YEAR, { message: '' })
  @Length(4, 4)
  @IsNotEmpty()
  expiryYear: string;

  @IsBoolean()
  @IsNotEmpty()
  isVirtual: boolean;

  @IsString()
  @IsIn(CARD_TYPES)
  @IsNotEmpty()
  cardType: CardType;
}

export class CreateCardDto extends BaseCardDto {
  @IsCreditCard()
  @IsNotEmpty()
  cardNumber: string;

  @IsNumberString()
  @Length(3, 3)
  @IsNotEmpty()
  CVC: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ProcessedCardDto extends BaseCardDto {
  encryptedCardNumber: string;

  encryptedCVC: string;

  encryptedPassword: string;
}
