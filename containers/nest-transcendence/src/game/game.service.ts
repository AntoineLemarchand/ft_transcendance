import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { GameObjectRepository } from './game.currentGames.repository';
@Injectable()
export class GameService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private currentGames: GameObjectRepository,
  ) {}
  async initGame(player1Username: string, player2Username: string) {
    if (player1Username === player2Username)
      return Promise.reject(new Error('a player cannot play against himself'));
    if (
      (await this.userService.getUser(player1Username)) === undefined ||
      (await this.userService.getUser(player2Username)) === undefined
    )
      return Promise.reject(new Error('all players must be registered users'));
    return this.currentGames.create(player1Username, player2Username);
  }

  getOpenGames() {
    return this.currentGames.findAll();
  }
}
