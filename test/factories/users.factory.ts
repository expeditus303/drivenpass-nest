import { PrismaService } from '../../src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { passwordGenerator } from '../utils/password-generator.util';
import * as bcrypt from 'bcrypt';


export class UsersFactory {
  private email: string;
  private password: string;

  constructor(private readonly prisma: PrismaService) {}

  withEmail(email: string) {
    this.email = email;
    return this;
  }

  withPassword(password: string) {
    this.password = password;
    return this;
  }

  async build() {
    const encryptedPassword = await bcrypt.hash(this.password, 10);

    return {
      email: this.email,
      encryptedPassword: encryptedPassword,
    };
  }

  randomInfo() {
    this.email = faker.internet.email();
    this.password = passwordGenerator()
    return this;
  }

  async persist() {
    const user = await this.build();
    return await this.prisma.user.create({
      data: user,
    });
  }
}
