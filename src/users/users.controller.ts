import {
  Controller,
  Post,
  Body,
  Get,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
// import { UseGuards } from '@nestjs/common';
// import { AuthGuard } from '../auth.guard';
// import { request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signUp(createUserDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.usersService.signIn(signInDto);
  }

  // @UseGuards(AuthGuard)
  // @Get()
  // testss(@Request() req) {
  //   const user = req.user
  //   return user
  // }
}
