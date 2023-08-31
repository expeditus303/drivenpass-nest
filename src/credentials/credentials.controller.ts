import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../users/auth.guard';
import { JwtPayload } from '../users/entities/user.entity';

@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() authenticatedUser: JwtPayload,
  ) {
    return this.credentialsService.create(createCredentialDto, authenticatedUser);
  }

  @Get()
  findAll(@User() authenticatedUser: JwtPayload) {
    return this.credentialsService.findAll(authenticatedUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.credentialsService.findOne(+id, authenticatedUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.credentialsService.remove(+id, authenticatedUser);
  }
}
