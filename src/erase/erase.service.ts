import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EraseDto } from './dto/create-erase.dto';
import { JwtPayload } from '../users/entities/user.entity';
import { EraseRepository } from './erase.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EraseService {
  constructor(private readonly eraseRepository: EraseRepository) {}

  async remove(eraseDto: EraseDto, authenticatedUser: JwtPayload) {
    const foundUser = await this.eraseRepository.findUserById(
      authenticatedUser.id,
    );

    const passwordIsValid = await bcrypt.compare(
      eraseDto.password,
      foundUser.encryptedPassword,
    );

    if (!passwordIsValid)
      throw new UnauthorizedException('Incorrect password.');

    await this.eraseRepository.deleteUserAndAssociatedData(
      authenticatedUser.id,
    );

    return { message: 'User data successfully deleted.' };
  }
}
