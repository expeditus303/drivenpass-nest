// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DatabaseCleaner } from './utils/database-cleaner.util';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { decrypt } from '../src/utils/encryption.utils';
import { AuthUtility } from './utils/sign-In.util';
import { NotesFactory } from './factories/notes.factory';
import { CreateNoteDto } from '../src/notes/dto/create-note.dto';

describe('Notes (e2e)', () => {
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

  describe('POST =>  /notes', () => {
    it('should not create a new note with existent title', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const note = await new NotesFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const createNoteDto: CreateNoteDto = new CreateNoteDto({
        title: note.title,
        text: faker.lorem.paragraph(),
      });

      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(createNoteDto)
        .expect(HttpStatus.CONFLICT)
        .expect({
          message: 'A note with this title already exists for the user.',
          error: 'Conflict',
          statusCode: 409,
        });
    });

    it('should create a new note', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const randomTitle = faker.lorem.sentence();
      const randomText = faker.lorem.paragraph();

      const createNoteDto: CreateNoteDto = new CreateNoteDto({
        title: randomTitle,
        text: randomText,
      });

      await request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${token}`)
        .send(createNoteDto)
        .expect(HttpStatus.CREATED)
        .expect({
          message: `Note '${randomTitle}' successfully registered.`,
        });

      const { body: notes } = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}`);

      expect(notes).toHaveLength(1);

      const [createdNote] = notes;

      expect(createdNote).toMatchObject({
        id: expect.any(Number),
        userId: user.id,
        title: randomTitle,
        text: randomText,
      });
    });
  });

  describe('GET =>  /notes', () => {
    it('should return an empty array when user has no notes', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { token } = await authUtility.signIn();

      const { body: fetchedNotes } = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(fetchedNotes).toEqual([]);
    });

    it('should return user notes', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const numberOfNotesToCreate = 2;
      const createdNotes = [];

      const note_1 = await new NotesFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();
      const note_2 = await new NotesFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      createdNotes.push(note_1, note_2);

      const { body: fetchedNotes } = await request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(fetchedNotes).toHaveLength(numberOfNotesToCreate);

      for (let i = 0; i < createdNotes.length; i++) {
        const decryptedText = await decrypt(createdNotes[i].encryptedText);
        expect(fetchedNotes[i]).toMatchObject({
          id: expect.any(Number),
          userId: user.id,
          title: createdNotes[i].title,
          text: decryptedText,
        });
      }
    });
  });

  describe('GET =>  /notes/:id', () => {
    it("should return not authorized when user tries to access another user's note", async () => {
      const authUtility = new AuthUtility(app, prisma);

      const { user: user1, token: token1 } = await authUtility.signIn();

      const note = await new NotesFactory(prisma)
        .withUserId(user1.id)
        .randomInfo()
        .persist();

      const { token: token2 } = await authUtility.signIn();

      await request(app.getHttpServer())
        .get(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'You do not have permission to access this note.',
          error: 'Forbidden',
          statusCode: 403,
        });
    });

    it('should return not found for non-existent note ID', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const note = await new NotesFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const nonExistentId = note.id + 1;

      await request(app.getHttpServer())
        .get(`/notes/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'Note not found.',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should return user note by id', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const note = await new NotesFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const { body: response } = await request(app.getHttpServer())
        .get(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      const decryptedText = await decrypt(note.encryptedText);

      expect(response).toEqual({
        id: expect.any(Number),
        userId: user.id,
        title: note.title,
        text: decryptedText,
      });
    });
  });

  describe('DELETE =>  /notes/:id', () => {
    it("should return not authorized when user tries to delete another user's note", async () => {
      const authUtility = new AuthUtility(app, prisma);

      const { user: user1 } = await authUtility.signIn();

      const note = await new NotesFactory(prisma)
        .withUserId(user1.id)
        .randomInfo()
        .persist();

      const { token: token2 } = await authUtility.signIn();

      await request(app.getHttpServer())
        .delete(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(HttpStatus.FORBIDDEN)
        .expect({
          message: 'You do not have permission to access this note.',
          error: 'Forbidden',
          statusCode: 403,
        });
    });

    it('should return not found for non-existent note ID', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const note = await new NotesFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      const nonExistentId = note.id + 1;

      await request(app.getHttpServer())
        .delete(`/notes/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          message: 'Note not found.',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should delete user note by id', async () => {
      const authUtility = new AuthUtility(app, prisma);
      const { user, token } = await authUtility.signIn();

      const note = await new NotesFactory(prisma)
        .withUserId(user.id)
        .randomInfo()
        .persist();

      await request(app.getHttpServer())
        .delete(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK)
        .expect({
          message: `Note '${note.title}' successfully removed.`,
        });

      const notes = await prisma.note.findUnique({
        where: { id: note.id },
      });
      expect(notes).toBe(null);
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });
});
