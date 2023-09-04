import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DatabaseCleaner } from './utils/database-cleaner.util';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    prisma = moduleFixture.get(PrismaService);

    await DatabaseCleaner.cleanAll(prisma);
  });

  describe('/health (GET)', () => {
    it('should return "I’m okay!"', async () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(HttpStatus.OK)
        .expect('I’m okay!');
    });
  });
});
