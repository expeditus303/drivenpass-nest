import { PrismaService } from '../../src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { encrypt } from '../../src/utils/encryption.utils';

export class CredentialsFactory {
  private userId: number;
  private title: string;
  private url: string;
  private username: string;
  private password: string;

  constructor(private readonly prisma: PrismaService) {}

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withUrl(url: string) {
    this.url = url;
    return this;
  }

  withUsername(username: string) {
    this.username = username;
    return this;
  }

  withPassword(password: string) {
    this.password = password;
    return this;
  }

  async build() {
    const encryptedPassword = await encrypt(this.password);

    if (typeof this.userId === 'undefined') {
      throw new Error('userId must be set before building.');
    }

    return {
      userId: this.userId,
      title: this.title,
      url: this.url,
      username: this.username,
      encryptedPassword: encryptedPassword,
    };
  }

  randomInfo() {
    this.title = faker.lorem.sentence();
    this.url = faker.internet.url();
    this.username = faker.internet.userName();
    this.password = faker.internet.password();
    return this;
  }

  async persist() {
    const credential = await this.build();
    return await this.prisma.credential.create({
      data: credential,
    });
  }
}
