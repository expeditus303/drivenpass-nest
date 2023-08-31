import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CredentialsModule } from './credentials/credentials.module';
import { JwtModule } from '@nestjs/jwt';
import { NotesModule } from './notes/notes.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    CredentialsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
    }),
    NotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [JwtModule]
})
export class AppModule {}
