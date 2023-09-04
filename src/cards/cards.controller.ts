import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from '../users/entities/user.entity';
import { User } from '../decorators/user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('cards')
@UseGuards(AuthGuard)
@ApiBearerAuth() // Indicates that Bearer Authorization is required for these endpoints
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card for an authenticated user' })
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({
    status: 409,
    description: 'A card with this title already exists for the user',
  })
  create(
    @Body() createCardDto: CreateCardDto,
    @User() authenticatedUser: JwtPayload,
  ) {
    return this.cardsService.create(createCardDto, authenticatedUser);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all cards for an authenticated user' })
  @ApiResponse({ status: 200, description: 'Cards fetched successfully' })
  findAll(@User() authenticatedUser: JwtPayload) {
    return this.cardsService.findAll(authenticatedUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch a specific cards by its ID for an authenticated user' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the card to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Card fetched successfully' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  findOne(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.cardsService.findOne(+id, authenticatedUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific card by its ID for an authenticated user' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the card to delete',
  })
  @ApiResponse({ status: 200, description: 'Card deleted successfully' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  remove(@Param('id') id: string, @User() authenticatedUser: JwtPayload) {
    return this.cardsService.remove(+id, authenticatedUser);
  }
}
