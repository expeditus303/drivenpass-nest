// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DatabaseCleaner } from './utils/database-cleaner.util';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';

import { faker } from '@faker-js/faker';
import { decrypt, encrypt } from '../src/utils/encryption.utils';
import { AuthUtility } from './utils/sign-In.util';
import { CardsFactory } from './factories/cards.factory';
import { CreateCardDto } from '../src/cards/dto/create-card.dto';
import { CardType } from '@prisma/client';

const CURRENT_YEAR = new Date().getFullYear();

describe('Cards (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    prisma = moduleFixture.get(PrismaService);

    await DatabaseCleaner.cleanAll(prisma);
  });

  describe('POST =>  /cards', () => {
    it('should not create a new card with existent title', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const card = await new CardsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const randomCardHolder =
        faker.person.firstName() + ' ' + faker.person.lastName();
      const cardIssuers = ['visa', 'mastercard'];
      const randomCardIssuer = faker.helpers.arrayElement(cardIssuers);
      const randomCardNumber = faker.finance.creditCardNumber({
        issuer: randomCardIssuer,
      });
      const randomCVC = faker.finance.creditCardCVV();
      const randomExpiryMonth = String(
        faker.number.int({ min: 1, max: 12 }),
      ).padStart(2, '0');
      const randomExpiryYear = String(
        faker.number.int({ min: CURRENT_YEAR, max: CURRENT_YEAR + 50 }),
      );
      const randomPassword = faker.internet.password();
      const randomIsVirtual = faker.datatype.boolean();
      const cardTypes = ['CREDIT', 'DEBIT', 'CREDIT_DEBIT'];
      const randomCardType = faker.helpers.arrayElement(cardTypes) as CardType;

      const createCardDto: CreateCardDto = new CreateCardDto({
        title: card.title,
        cardHolder: randomCardHolder,
        cardNumber: randomCardNumber,
        CVC: randomCVC,
        expiryMonth: randomExpiryMonth,
        expiryYear: randomExpiryYear,
        password: randomPassword,
        isVirtual: randomIsVirtual,
        cardType: randomCardType,
      });

      await request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send(createCardDto)
        .expect(HttpStatus.CONFLICT)
        .expect({
          message: 'A card with this title already exists for the user.',
          error: 'Conflict',
          statusCode: 409,
        });
    });

    it('should create a new card', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const randomTitle = faker.lorem.sentence();
      const randomCardHolder =
        faker.person.firstName() + ' ' + faker.person.lastName();
      const cardIssuers = ['visa', 'mastercard'];
      const randomCardIssuer = faker.helpers.arrayElement(cardIssuers);
      const randomCardNumber = faker.finance.creditCardNumber({
        issuer: randomCardIssuer,
      });
      const randomCVC = faker.finance.creditCardCVV();
      const randomExpiryMonth = String(
        faker.number.int({ min: 1, max: 12 }),
      ).padStart(2, '0');
      const randomExpiryYear = String(
        faker.number.int({ min: CURRENT_YEAR, max: CURRENT_YEAR + 50 }),
      );
      const randomPassword = faker.internet.password();
      const randomIsVirtual = faker.datatype.boolean();
      const cardTypes = ['CREDIT', 'DEBIT', 'CREDIT_DEBIT'];
      const randomCardType = faker.helpers.arrayElement(cardTypes) as CardType;

      const createCardDto: CreateCardDto = new CreateCardDto({
        title: randomTitle,
        cardHolder: randomCardHolder,
        cardNumber: randomCardNumber,
        CVC: randomCVC,
        expiryMonth: randomExpiryMonth,
        expiryYear: randomExpiryYear,
        password: randomPassword,
        isVirtual: randomIsVirtual,
        cardType: randomCardType,
      });

      await request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send(createCardDto)
        .expect(HttpStatus.CREATED)
        .expect({
          message: `Card '${randomTitle}' successfully registered.`,
        });

      const { body: cards } = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${token}`);

      expect(cards).toHaveLength(1);

      const [createdCard] = cards;

      expect(createdCard).toMatchObject({
        id: expect.any(Number),
        userId: user.id,
        title: randomTitle,
        cardHolder: randomCardHolder,
        cardNumber: randomCardNumber,
        CVC: randomCVC,
        expiryMonth: randomExpiryMonth,
        expiryYear: randomExpiryYear,
        password: randomPassword,
        isVirtual: randomIsVirtual,
        cardType: randomCardType,
      });
    });
  });

  describe('GET =>  /cards', () => {
    it('should return an empty array when user has no cards', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { token } = await authUtility.signIn();

      const { body: fetchedCards } = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(fetchedCards).toEqual([]);
    });

    it('should return user notes', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const numberOfCardsToCreate = 2;
      const createdCards = await Promise.all(
        Array(numberOfCardsToCreate)
          .fill(0)
          .map(async () => {
            return await new CardsFactory(prisma)
              .withUserId(user.id)
              .randomInfo()
              .persist();
          }),
      );

      const { body: fetchedCards } = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(fetchedCards).toHaveLength(numberOfCardsToCreate);

      for (let i = 0; i < createdCards.length; i++) {
        const [decryptedCardNumber, decryptedCVC, decryptedPassword] =
          await Promise.all([
            decrypt(createdCards[i].encryptedCardNumber),
            decrypt(createdCards[i].encryptedCVC),
            decrypt(createdCards[i].encryptedPassword),
          ]);

        expect(fetchedCards[i]).toMatchObject({
          id: expect.any(Number),
          userId: user.id,
          title: createdCards[i].title,
          cardHolder: createdCards[i].cardHolder,
          cardNumber: decryptedCardNumber,
          CVC: decryptedCVC,
          expiryMonth: createdCards[i].expiryMonth,
          expiryYear: createdCards[i].expiryYear,
          password: decryptedPassword,
          isVirtual: createdCards[i].isVirtual,
          cardType: createdCards[i].cardType,
        });
      }
    });
  });

  describe('GET =>  /cards/:id', () => {
    it("should return not authorized when user tries to access another user's card", async () => {
      const authUtility = new AuthUtility(app, prisma);

      const { user: user1 } = await authUtility.signIn();

      const card = await new CardsFactory(prisma)
        .withUserId(user1.id)
        .randomInfo()
        .persist();

      const { token: token2 } = await authUtility.signIn();

      await request(app.getHttpServer())
        .get(`/cards/${card.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'You do not have permission to access this card.',
          error: 'Forbidden',
          statusCode: 403,
        });
    });

    it('should return not found for non-existent card ID', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const card = await new CardsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const nonExistentId = card.id + 1;

      await request(app.getHttpServer())
        .get(`/cards/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'Card not found.',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return user card by id', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const card = await new CardsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const { body: response } = await request(app.getHttpServer())
        .get(`/cards/${card.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      const decryptedCardNumber = await decrypt(card.encryptedCardNumber);
      const decryptedCVC = await decrypt(card.encryptedCVC);
      const decryptedPassword = await decrypt(card.encryptedPassword);

      expect(response).toEqual({
        id: expect.any(Number),
        userId: user.id,
        title: card.title,
        cardHolder: card.cardHolder,
        cardNumber: decryptedCardNumber,
        CVC: decryptedCVC,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        password: decryptedPassword,
        isVirtual: card.isVirtual,
        cardType: card.cardType,
      });
    });
  });

  describe('DELETE =>  /cards/:id', () => {
    it("should return not authorized when user tries to delete another user's card", async () => {
      const authUtility = new AuthUtility(app, prisma);

      const { user: user1, token: token1 } = await authUtility.signIn();

      const card = await new CardsFactory(prisma)
        .withUserId(user1.id)
        .randomInfo()
        .persist();

      const { token: token2 } = await authUtility.signIn();

      await request(app.getHttpServer())
        .delete(`/cards/${card.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'You do not have permission to access this card.',
          error: 'Forbidden',
          statusCode: 403,
        });
    });

    it('should return not found for non-existent card ID', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const card = await new CardsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const nonExistentId = card.id + 1;

      await request(app.getHttpServer())
        .delete(`/cards/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'Card not found.',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should delete user card by id', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const card = await new CardsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      await request(app.getHttpServer())
        .delete(`/cards/${card.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
        .expect({
          message: `Card '${card.title}' successfully removed.`,
        });

      const cards = await prisma.card.findUnique({
        where: { id: card.id },
      });
      expect(cards).toBe(null);
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });
});
