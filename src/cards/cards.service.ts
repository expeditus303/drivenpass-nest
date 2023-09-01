import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto, ProcessedCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardsRepository } from './cards.repository';
import { JwtPayload } from '../users/entities/user.entity';
import { decrypt, encrypt } from '../utils/encryption.utils';

@Injectable()
export class CardsService {

  constructor(private readonly cardsRepository: CardsRepository) {}

  async create(createCardDto: CreateCardDto, authenticatedUser: JwtPayload) {
    const isTitleOwnedByUser = await this.cardsRepository.findTitleByUser(
      createCardDto.title,
      authenticatedUser.id,
    );

    if (isTitleOwnedByUser)
      throw new ConflictException(
        'A card with this title already exists for the user.',
      );

    const encryptedCardNumber = await encrypt(createCardDto.cardNumber);

    const encryptedCVC = await encrypt(createCardDto.CVC);

    const encryptedPassword = await encrypt(createCardDto.password);



    const processedCardDto: ProcessedCardDto = this.transformToProcessedDto(
      createCardDto,
      encryptedCardNumber,
      encryptedCVC,
      encryptedPassword
    );

    await this.cardsRepository.create(
      processedCardDto,
      authenticatedUser.id,
    );

    return {
      message: `Card '${createCardDto.title}' successfully registered.`,
    };
  }

  async findAll(authenticatedUser: JwtPayload) {
    const userCards = await this.cardsRepository.findAll(authenticatedUser.id);
  
    const userCardsDecrypted = await Promise.all(
      userCards.map(async (card) => {
        return this.decryptCard(card);
      })
    );
  
    return userCardsDecrypted;
  }

  async findOne(id: number, authenticatedUser: JwtPayload) {
    const userCard = await this.getUserCards(id, authenticatedUser);
    return this.decryptCard(userCard);
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }

  private transformToProcessedDto(
    createCardDto: CreateCardDto,
    encryptedCardNumber: string,
    encryptedCVC: string,
    encryptedPassword: string
  ): ProcessedCardDto {
    const { cardNumber, CVC, password, ...CardWithoutDecryptedData } = createCardDto;
    return {
      ...CardWithoutDecryptedData,
      encryptedCardNumber: encryptedCardNumber,
      encryptedCVC: encryptedCVC,
      encryptedPassword: encryptedPassword
    };
  }

  private async getUserCards(id: number, authenticatedUser: JwtPayload) {
    const userCards = await this.cardsRepository.findById(id);

    if (!userCards) throw new NotFoundException('Card not found.');

    if (userCards.userId !== authenticatedUser.id)
      throw new ForbiddenException(
        'You do not have permission to access this card.',
      );

    return userCards;
  }

  async decryptCard(card: any): Promise<CreateCardDto> {
    try {
      const decryptedCardNumber = await decrypt(card.encryptedCardNumber);
      const decryptedCVC = await decrypt(card.encryptedCVC);
      const decryptedPassword = await decrypt(card.encryptedPassword);
  
      const { encryptedCardNumber, encryptedCVC, encryptedPassword, ...cardWithoutEncryption } = card;
  
      return {
        ...cardWithoutEncryption,
        cardNumber: decryptedCardNumber,
        CVC: decryptedCVC,
        password: decryptedPassword,
      };
    } catch (error) {
      throw new Error(`Failed to decrypt card with title: ${card.title}`);
    }
  }
}
