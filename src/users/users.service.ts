import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private EXPIRATION_TIME = '7 days';
  private ISSUER = 'DrivenPass';
  private AUDIENCE = 'users';

  constructor(
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: SignUpDto) {
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

    await this.usersRepository.create(processedUserDto);

    return { message: 'User successfully registered.' };
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
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: this.EXPIRATION_TIME,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }),
    };
  }
}
