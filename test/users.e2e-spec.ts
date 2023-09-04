// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DatabaseCleaner } from './utils/database-cleaner.util';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { SignUpDto } from '../src/users/dto/sign-up.dto';
import { UsersFactory } from './factories/users.factory';
import { passwordGenerator } from './utils/password-generator.util';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { SignInDto } from '../src/users/dto/sign-in.dto';
import * as jwt from 'jsonwebtoken';

describe('Users (e2e)', () => {
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

  describe('/users/sign-up', () => {
    it('POST => should not sign up a user if the email is not provided', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        password: passwordGenerator(),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user if the email is empty', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: '',
        password: passwordGenerator(),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user if the email is not a valid email', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: faker.internet.color(),
        password: passwordGenerator(),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user if the password is not provided', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: faker.internet.email(),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user if the password is less than 10 characters long', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: faker.internet.email(),
        password: passwordGenerator({ length: 9 }),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user without a number in the password', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: faker.internet.email(),
        password: passwordGenerator({ numbers: false }),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user without a symbol in the password', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: faker.internet.email(),
        password: passwordGenerator({ symbols: false }),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user without a lowercase letter in the password', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: faker.internet.email(),
        password: passwordGenerator({ lowercase: false }),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user without an uppercase letter in the password', async () => {
      const signUpDto: SignUpDto = new SignUpDto({
        email: faker.internet.email(),
        password: passwordGenerator({ uppercase: false }),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST => should not sign up a user with an existing email', async () => {
      const user = await new UsersFactory(prisma).randomInfo().persist();

      const signUpDto: SignUpDto = new SignUpDto({
        email: user.email,
        password: passwordGenerator(),
      });

      return request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CONFLICT);
    });

    it('POST => should sign up a new user', async () => {
      const email = faker.internet.email();

      const signUpDto: SignUpDto = new SignUpDto({
        email: email,
        password: passwordGenerator(),
      });

      await request(app.getHttpServer())
        .post('/users/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED)
        .expect({ message: 'User successfully registered.' });

      const users = await prisma.user.findMany();
      expect(users).toHaveLength(1);
      const user = users[0];
      expect(user).toEqual({
        id: expect.any(Number),
        email: email,
        encryptedPassword: expect.any(String),
      });
    });
  });

  describe('/users/sign-in', () => {
    let email: string;
    let password: string;
    let userCreated: User;

    beforeEach(async () => {
      email = faker.internet.email();
      password = passwordGenerator();
      userCreated = await new UsersFactory(prisma)
        .withEmail(email)
        .withPassword(password)
        .persist();
    });

    it('POST => should not sign in a user with incorrect email', async () => {
      const signInDto: SignInDto = new SignInDto({
        email: 'wrongemail@wrongemail.com',
        password: password,
      });

      return request(app.getHttpServer())
        .post('/users/sign-in')
        .send(signInDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST => should not sign in a user with incorrect password', async () => {
      const signInDto: SignInDto = new SignInDto({
        email: email,
        password: 'wrongPassword12!_',
      });

      return request(app.getHttpServer())
        .post('/users/sign-in')
        .send(signInDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST => should sign in a user with correct credentials', async () => {
      const signInDto: SignInDto = new SignInDto({
        email: email,
        password: password,
      });

      const response = await request(app.getHttpServer())
        .post('/users/sign-in')
        .send(signInDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });

      const decodedToken = jwt.decode(response.body.access_token);

      // Check if the decoded token has the expected structure
      expect(decodedToken).toHaveProperty('id');
      expect(decodedToken).toHaveProperty('email');
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });
});
