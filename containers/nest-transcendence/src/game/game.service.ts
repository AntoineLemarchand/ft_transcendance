import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { GameObjectRepository } from './game.currentGames.repository';
import { GameObject } from './game.entities';
@Injectable()
export class GameService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private currentGames: GameObjectRepository,
  ) {}

  //todo: add exception filter -> transform Error to HTTPException
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

  async setReady(executorName: string, gameId: number) {
    const game = await this.currentGames.findOne(gameId);
    if (
      game.getPlayerNames().find((name) => name === executorName) === undefined
    )
      return Promise.reject(
        new Error('only active players can set themselves as ready'),
      );
    game.setReady(executorName);
  }
}
