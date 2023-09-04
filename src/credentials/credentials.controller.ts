import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('credentials')
@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credential for an authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Credential successfully registered.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateCredentialDto })
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() authenticatedUser: JwtPayload,
  ) {
    return this.credentialsService.create(
      createCredentialDto,
      authenticatedUser,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all credentials for an authenticated user' })
  @ApiResponse({ status: 200, description: 'List of credentials' })
  @ApiBearerAuth()
  findAll(@User() authenticatedUser: JwtPayload) {
    return this.credentialsService.findAll(authenticatedUser);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Fetch a specific credential by its ID for an authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Specific credential' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID of the credential' })
  findOne(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.credentialsService.findOne(+id, authenticatedUser);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a specific credential by its ID for an authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Credential successfully removed' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID of the credential' })
  remove(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.credentialsService.remove(+id, authenticatedUser);
  }
}
