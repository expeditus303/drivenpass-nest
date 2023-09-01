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
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard } from '../users/auth.guard';
import { JwtPayload } from '../users/entities/user.entity';
import { User } from '../decorators/user.decorator';

@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(
    @Body() createCardDto: CreateCardDto,
    @User() authenticatedUser: JwtPayload,
  ) {
    return this.cardsService.create(createCardDto, authenticatedUser);

  }

  @Get()
  findAll(@User() authenticatedUser: JwtPayload) {
    return this.cardsService.findAll(authenticatedUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(+id);
  }
}
