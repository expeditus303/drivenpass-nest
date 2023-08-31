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
    @User() user: JwtPayload,
  ) {
    return this.credentialsService.create(createCredentialDto, user);
  }

  @Get()
  findAll(@User() user: JwtPayload) {
    return this.credentialsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: JwtPayload) {
    return this.credentialsService.findOne(+id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCredentialDto: UpdateCredentialDto,
  ) {
    return this.credentialsService.update(+id, updateCredentialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.credentialsService.remove(+id);
  }
}
