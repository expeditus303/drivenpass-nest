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
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
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

@ValidatorConstraint({ async: false })
export class IsYearGreaterThan implements ValidatorConstraintInterface {
  validate(year: string, args: ValidationArguments) {
    const comparisonYear = args.constraints[0];
    return parseInt(year) >= comparisonYear;
  }

  defaultMessage(args: ValidationArguments) {
    return `Expiry year should be greater than ${args.constraints[0]}`;
  }
}

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
  @Validate(IsYearGreaterThan, [CURRENT_YEAR])
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
