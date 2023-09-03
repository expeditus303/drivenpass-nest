import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { UsersFactory } from '../factories/users.factory';
import { SignInDto } from '../../src/users/dto/sign-in.dto';
import { passwordGenerator } from '../utils/password-generator.util';
import { PrismaService } from '../../src/prisma/prisma.service';
import { User } from '@prisma/client';

export class AuthUtility {
  constructor(
    private app: INestApplication,
    private prisma: PrismaService,
  ) {}

  async signIn(): Promise<{ user: User; token: string }> {
    const email = faker.internet.email();
    const password = passwordGenerator();

    const user = await new UsersFactory(this.prisma)
      .withEmail(email)
      .withPassword(password)
      .persist();

    const signInDto: SignInDto = new SignInDto({
      email: email,
      password: password,
    });

    const response = await request(this.app.getHttpServer())
      .post('/users/sign-in')
      .send(signInDto)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });

    const { access_token } = response.body;

    return {
      user,
      token: access_token,
    };
  }
}
