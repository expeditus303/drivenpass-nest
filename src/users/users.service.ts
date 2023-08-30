import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const isEmailAlreadyRegistered = await this.usersRepository.findUserByEmail(
      createUserDto.email,
    );

    if (isEmailAlreadyRegistered)
      throw new ConflictException('Email address is already registered.');

    const encryptedPassword = await bcrypt.hash(createUserDto.password, 10);

    const processedUserDto = {
      email: createUserDto.email,
      encryptedPassword: encryptedPassword,
    };

    const newUser = await this.usersRepository.create(processedUserDto);

    return newUser;
  }

  async signIn(signInDto: SignInDto) {
    const foundUser = await this.usersRepository.findUserByEmail(
      signInDto.email,
    );

    if (!foundUser)
      throw new UnauthorizedException('Email or password is incorrect.');

    const passwordIsValid = await bcrypt.compare(
      signInDto.password,
      foundUser.encryptedPassword,
    );

    if (!passwordIsValid)
      throw new UnauthorizedException('Email or password is incorrect.');

    const payload: JwtPayload = { id: foundUser.id, email: foundUser.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
