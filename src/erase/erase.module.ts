import { Module } from '@nestjs/common';
import { EraseService } from './erase.service';
import { EraseController } from './erase.controller';
import { EraseRepository } from './erase.repository';

@Module({
  controllers: [EraseController],
  providers: [EraseService, EraseRepository],
})
export class EraseModule {}
