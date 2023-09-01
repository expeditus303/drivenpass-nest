import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Module({})
export class AuthModule {
    providers: [AuthGuard]
}
