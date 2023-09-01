import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EraseService } from './erase.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../users/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { EraseDto } from './dto/create-erase.dto';

@UseGuards(AuthGuard)
@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Delete()
  remove(@Body() eraseDto: EraseDto, @User() authenticatedUser: JwtPayload) {
    return this.eraseService.remove(eraseDto, authenticatedUser);
  }
}
