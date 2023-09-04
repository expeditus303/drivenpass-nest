import { PrismaService } from '../../src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { encrypt } from '../../src/utils/encryption.utils';
import { CardType } from '@prisma/client';

export class CardsFactory {
  private userId: number;
  private title: string;
  private cardHolder: string;
  private cardNumber: string;
  private CVC: string;
  private expiryMonth: string;
  private expiryYear: string;
  private password: string;
  private isVirtual: boolean;
  private cardType: CardType;

  constructor(private readonly prisma: PrismaService) {}

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withCardHolder(cardHolder: string) {
    this.cardHolder = cardHolder;
    return this;
  }

  withCardNumber(cardNumber: string) {
    this.cardNumber = cardNumber;
    return this;
  }

  withCVC(CVC: string) {
    this.CVC = CVC;
    return this;
  }

  withExpiryMonth(expiryMonth: string) {
    this.expiryMonth = expiryMonth;
    return this;
  }

  withExpiryYear(expiryYear: string) {
    this.expiryYear = expiryYear;
    return this;
  }

  withPassword(password: string) {
    this.password = password;
    return this;
  }

  withIsVirtual(isVirtual: boolean) {
    this.isVirtual = isVirtual;
    return this;
  }

  withCardType(cardType: CardType) {
    this.cardType = cardType;
    return this;
  }

  async build() {
    const encryptedCardNumber = await encrypt(this.cardNumber);
    const encryptedCVC = await encrypt(this.CVC);
    const encryptedPassword = await encrypt(this.password);

    if (typeof this.userId === 'undefined') {
      throw new Error('userId must be set before building.');
    }

    return {
      userId: this.userId,
      title: this.title,
      cardHolder: this.cardHolder,
      encryptedCardNumber: encryptedCardNumber,
      encryptedCVC: encryptedCVC,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      encryptedPassword: encryptedPassword,
      isVirtual: this.isVirtual,
      cardType: this.cardType
    };
  }

  randomInfo() {
    const CURRENT_YEAR = new Date().getFullYear();
    const cardTypes = ['CREDIT', 'DEBIT', 'CREDIT_DEBIT'];

    this.title = faker.lorem.sentence();
    this.cardHolder = faker.person.firstName() + " " + faker.person.lastName();
    this.cardNumber = faker.finance.creditCardNumber();
    this.CVC = faker.finance.creditCardCVV();
    this.expiryMonth = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    this.expiryYear = String(faker.number.int({ min: CURRENT_YEAR, max: CURRENT_YEAR + 50 }));
    this.password = faker.internet.password();
    this.isVirtual = faker.datatype.boolean();
    this.cardType = faker.helpers.arrayElement(cardTypes) as CardType;

    return this;
  }

  async persist() {
    const card = await this.build();
    return await this.prisma.card.create({
      data: card,
    });
  }
}
