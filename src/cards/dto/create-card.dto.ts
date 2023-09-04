import { CardType } from '@prisma/client';
import {
  IsBoolean,
  IsCreditCard,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'The title of the card.',
    example: 'Personal Visa',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Name of the card holder.',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  cardHolder: string;

  @ApiProperty({
    description: 'Expiry month of the card.',
    enum: MONTHS,
    example: '05',
  })
  @IsString()
  @IsIn(MONTHS)
  @IsNotEmpty()
  expiryMonth: string;

  @ApiProperty({
    description:
      'Expiry year of the card. Must be greater than the current year.',
    example: '2025',
  })
  @IsNumberString({ no_symbols: true })
  @Validate(IsYearGreaterThan, [CURRENT_YEAR])
  @Length(4, 4)
  @IsNotEmpty()
  expiryYear: string;

  @ApiProperty({
    description: 'Specifies whether the card is virtual.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isVirtual: boolean;

  @ApiProperty({
    description: 'Type of the card.',
    enum: CARD_TYPES,
    example: 'CREDIT',
  })
  @IsString()
  @IsIn(CARD_TYPES)
  @IsNotEmpty()
  cardType: CardType;
}

export class CreateCardDto extends BaseCardDto {
  @ApiProperty({
    description: 'The credit card number.',
    example: '4111111111111111',
  })
  @IsCreditCard()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({
    description: 'The CVC/CVV of the card.',
    example: '123',
  })
  @IsNumberString()
  @Length(3, 3)
  @IsNotEmpty()
  CVC: string;

  @ApiProperty({
    description: 'The password associated with the card.',
    example: 'MyCardPassword',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(params?: Partial<CreateCardDto>) {
    super();
    if (params) Object.assign(this, params);
  }
}

export class ProcessedCardDto extends BaseCardDto {
  encryptedCardNumber: string;

  encryptedCVC: string;

  encryptedPassword: string;
}
