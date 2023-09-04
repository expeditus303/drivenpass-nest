import { PrismaService } from '../../src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { encrypt } from '../../src/utils/encryption.utils';

export class NotesFactory {
  private userId: number;
  private title: string;
  private text: string;

  constructor(private readonly prisma: PrismaService) {}

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withText(text: string) {
    this.text = text;
    return this;
  }

  async build() {
    const encryptedText = await encrypt(this.text);

    if (typeof this.userId === 'undefined') {
      throw new Error('userId must be set before building.');
    }

    return {
      userId: this.userId,
      title: this.title,
      encryptedText: encryptedText,
    };
  }

  randomInfo() {
    this.title = faker.lorem.sentence();
    this.text = faker.lorem.paragraph();
    return this;
  }

  async persist() {
    const note = await this.build();
    return await this.prisma.note.create({
      data: note,
    });
  }
}
