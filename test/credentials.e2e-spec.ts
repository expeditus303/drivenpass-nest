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
    it('should return an empty array when user has no credentials', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { token } = await authUtility.signIn();

      const { body: fetchedCredentials } = await request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(fetchedCredentials).toEqual([]);
    });

    it('should return user credentials', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const credentialsToCreate = [1, 2];
      const createdCredentials = await Promise.all(
        credentialsToCreate.map(async () => {
          return await new CredentialsFactory(prisma)
            .withUserId(user.id)
            .randomInfo()
            .persist();
        }),
      );

      const { body: fetchedCredentials } = await request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(fetchedCredentials).toHaveLength(credentialsToCreate.length);

      for (let i = 0; i < createdCredentials.length; i++) {
        const decryptedPassword = await decrypt(
          createdCredentials[i].encryptedPassword,
        );

        expect(fetchedCredentials[i]).toMatchObject({
          id: expect.any(Number),
          userId: user.id,
          title: createdCredentials[i].title,
          url: createdCredentials[i].url,
          username: createdCredentials[i].username,
          password: decryptedPassword,
        });
      }
    });
  });

  describe('GET =>  /credentials/:id', () => {
    it("should return not authorized when user tries to access another user's credential", async () => {
      const authUtility = new AuthUtility(app, prisma);

      const { user: user1, token: token1 } = await authUtility.signIn();

      const credential = await new CredentialsFactory(prisma)
        .withUserId(user1.id)
        .randomInfo()
        .persist();

      const { token: token2 } = await authUtility.signIn();

      await request(app.getHttpServer())
        .get(`/credentials/${credential.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'You do not have permission to access this credential.',
          error: 'Forbidden',
          statusCode: 403
        });
    });

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
    it("should return not authorized when user tries to delete another user's credential", async () => {
      const authUtility = new AuthUtility(app, prisma);

      const { user: user1, token: token1 } = await authUtility.signIn();

      const credential = await new CredentialsFactory(prisma)
        .withUserId(user1.id)
        .randomInfo()
        .persist();

      const { token: token2 } = await authUtility.signIn();

      await request(app.getHttpServer())
        .delete(`/credentials/${credential.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'You do not have permission to access this credential.',
          error: 'Forbidden',
          statusCode: 403
        });
    });

    it('should return not found for non-existent credential ID', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const credential = await new CredentialsFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const nonExistentId = credential.id + 1;

      await request(app.getHttpServer())
        .delete(`/credentials/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'Credential not found.',
          error: 'Not Found',
          statusCode: 404,
        });
    });

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
