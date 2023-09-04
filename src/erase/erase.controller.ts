import { Controller, Delete, Body, UseGuards } from '@nestjs/common';
import { EraseService } from './erase.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../users/entities/user.entity';
import { User } from '../decorators/user.decorator';
import { EraseDto } from './dto/create-erase.dto';

@ApiTags('erase')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Delete()
  @ApiOperation({
    summary: 'Delete user and associated data',
    description:
      'This endpoint allows the authenticated user to permanently erase their user data and associated data such as cards, credentials, and notes.',
  })
  @ApiResponse({
    status: 200,
    description: 'User data successfully deleted.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Incorrect password or missing authentication.',
  })
  remove(@Body() eraseDto: EraseDto, @User() authenticatedUser: JwtPayload) {
    return this.eraseService.remove(eraseDto, authenticatedUser);
  }
}
