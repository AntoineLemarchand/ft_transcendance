import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { GameObjectRepository } from './game.currentGames.repository';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
@Injectable()
export class GameService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private broadcastingGateway: BroadcastingGateway,
    private currentGames: GameObjectRepository,
  ) {}

  //todo: add exception filter -> transform Error to HTTPException
  async initGame(player1name: string, player2name: string) {
    await this.prohibitNonActivePlayerActions(player1name, player2name);
    const result = this.currentGames.create(player1name, player2name);
    await this.createRoom(player1name, result.getId(), player2name);
    return result;
  }

  getOpenGames() {
    return this.currentGames.findAll();
  }

  async setReady(executorName: string, gameId: number) {
    const game = await this.currentGames.findOne(gameId);
    if (!game.getPlayerNames().find((name) => name === executorName))
      return Promise.reject(
        new Error('only active players can set themselves as ready'),
      );
    game.setReady(executorName);
  }

  private async prohibitNonActivePlayerActions(
    player1name: string,
    player2name: string,
  ) {
    if (player1name === player2name)
      return Promise.reject(new Error('a player cannot play against himself'));
    if (
      (await this.userService.getUser(player1name)) === undefined ||
      (await this.userService.getUser(player2name)) === undefined
    )
      return Promise.reject(new Error('all players must be registered users'));
  }

  private async createRoom(
    player1name: string,
    gameId: number,
    player2name: string,
  ) {
    await this.broadcastingGateway.putUserInRoom(
      player1name,
      gameId.toString(),
    );
    await this.broadcastingGateway.putUserInRoom(
      player2name,
      gameId.toString(),
    );
  }
}
