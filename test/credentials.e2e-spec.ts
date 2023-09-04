// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
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
import { CreateCredentialDto } from '../src/credentials/dto/create-credential.dto';
import { CredentialsFactory } from './factories/credentials.factory';
import { decrypt, encrypt } from '../src/utils/encryption.utils';
import { AuthUtility } from './utils/sign-In.util';

describe('Credentials (e2e)', () => {
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

  describe('POST =>  /credentials', () => {
    it('should not create a new credential with existent title', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const credential = await new CredentialsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const createCredentialDto: CreateCredentialDto = new CreateCredentialDto({
        title: credential.title,
        url: faker.internet.url(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      });

      await request(app.getHttpServer())
        .post('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .send(createCredentialDto)
        .expect(HttpStatus.CONFLICT)
        .expect({
          message: 'A credential with this title already exists for the user.',
          error: 'Conflict',
          statusCode: 409,
        });
    });

    it('should create a new credential', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const createCredentialDto: CreateCredentialDto = new CreateCredentialDto({
        title: faker.word.words(),
        url: faker.internet.url(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      });

      await request(app.getHttpServer())
        .post('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .send(createCredentialDto)
        .expect(HttpStatus.CREATED)
        .expect({
          message: `Credential '${createCredentialDto.title}' successfully registered.`,
        });

      const { body: credentials } = await request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `Bearer ${token}`);

      expect(credentials).toHaveLength(1);

      const credential = credentials[0];

      expect(credential).toEqual({
        id: expect.any(Number),
        userId: user.id,
        title: createCredentialDto.title,
        url: createCredentialDto.url,
        username: createCredentialDto.username,
        password: createCredentialDto.password,
      });
    });
  });

  describe('GET =>  /credentials', () => {
    it('should return user credentials', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const credential1 = await new CredentialsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const credential2 = await new CredentialsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const { body: credentials } = await request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(credentials).toHaveLength(2);

      const credential_1 = credentials[0];
      const credential_2 = credentials[1];

      const decryptedPassword1 = await decrypt(credential1.encryptedPassword);
      const decryptedPassword2 = await decrypt(credential2.encryptedPassword);

      expect(credential_1).toEqual({
        id: expect.any(Number),
        userId: user.id,
        title: credential1.title,
        url: credential1.url,
        username: credential1.username,
        password: decryptedPassword1,
      });

      expect(credential_2).toEqual({
        id: expect.any(Number),
        userId: user.id,
        title: credential2.title,
        url: credential2.url,
        username: credential2.username,
        password: decryptedPassword2,
      });
    });
  });

  describe('GET =>  /credentials/:id', () => {
    it('should return not found for non-existent credential ID', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const credential = await new CredentialsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const nonExistentId = credential.id + 1;

      await request(app.getHttpServer())
        .get(`/credentials/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'Credential not found.',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return user credential by id', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const credential = await new CredentialsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const { body: response } = await request(app.getHttpServer())
        .get(`/credentials/${credential.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      const decryptedPassword = await decrypt(credential.encryptedPassword);

      expect(response).toEqual({
        id: expect.any(Number),
        userId: user.id,
        title: credential.title,
        url: credential.url,
        username: credential.username,
        password: decryptedPassword,
      });
    });
  });

  describe('DELETE =>  /credentials/:id', () => {
    it('should delete user credential by id', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const credential = await new CredentialsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      await request(app.getHttpServer())
        .delete(`/credentials/${credential.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
        .expect({
          message: `Credential '${credential.title}' successfully removed.`,
        });

      const credentials = await prisma.credential.findUnique({
        where: { id: credential.id },
      });
      expect(credentials).toBe(null);
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });
});
