import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
// import { UseGuards } from '@nestjs/common';
// import { AuthGuard } from '../auth.guard';
// import { request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() createUserDto: SignUpDto) {
    return this.usersService.signUp(createUserDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInDto: SignInDto) {
    return this.usersService.signIn(signInDto);
  }

}
