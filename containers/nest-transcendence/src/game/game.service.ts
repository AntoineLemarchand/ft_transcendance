import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { GameObjectRepository } from './game.currentGames.repository';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import {
  GameInput,
  GameObject,
  GameProgress,
  Player,
} from './game.entities';
import { ErrUnAuthorized } from '../exceptions';

@Injectable()
export class GameService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => BroadcastingGateway))
    private broadcastingGateway: BroadcastingGateway,
    private currentGames: GameObjectRepository,
  ) {}

  //todo: add exception filter -> transform Error to HTTPException
  async initGame(player1name: string, player2name: string) {
    await this.areValidPlayers(player1name, player2name);
    const result = this.currentGames.create(player1name, player2name);
    await this.createRoom(player1name, result.getId(), player2name);
    return result;
  }

  getRunningGames(): GameObject[] {
    return this.currentGames
      .findAll()
      .filter(
        (gameObject) => gameObject.getProgress() === GameProgress.RUNNING,
      );
  }

  getGamesForUser(username: string) {
    return this.currentGames
      .findAll()
      .filter(
        (gameObject) =>
          gameObject.players[0].name === username ||
          gameObject.players[1].name === username,
      );
  }

  async setReady(executorName: string, gameId: number) {
    const game = await this.currentGames.findOne(gameId);
    await this.prohibitNonPlayerActions(executorName, game);
    game.setReady(executorName);
    if (game.getProgress() === GameProgress.RUNNING) this.runGame(game);
  }

  async unsetReady(executorName: string, gameId: number) {
    const game = await this.currentGames.findOne(gameId);
    await this.prohibitNonPlayerActions(executorName, game);
    game.unsetReady(executorName);
  }

  async runGame(game: GameObject) {
    function sendStartEvent(broadcastingGateway: BroadcastingGateway) {
      broadcastingGateway.emitGameUpdate(game.getId().toString(), game);
    }

    sendStartEvent(this.broadcastingGateway);
    while (game.getProgress() !== GameProgress.FINISHED) {
      game.executeStep();
      this.broadcastingGateway.emitGameUpdate(game.getId().toString(), game);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * game.collision.getTimeUntilImpact()),
      );
    }
  }

  private async prohibitNonPlayerActions(
    executorName: string,
    game: GameObject,
  ) {
    if (!game.getPlayerNames().find((name) => name === executorName))
      return Promise.reject(
        new ErrUnAuthorized('only active players can set themselves as ready'),
      );
  }

  private async areValidPlayers(player1name: string, player2name: string) {
    if (player1name === player2name)
      return Promise.reject(
        new ErrUnAuthorized('a player cannot play against himself'),
      );
    if (
      (await this.userService.getUser(player1name)) === undefined ||
      (await this.userService.getUser(player2name)) === undefined
    )
      return Promise.reject(
        new ErrUnAuthorized('all players must be registered users'),
      );
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

  async processUserInput(input: GameInput) {
    const game = await this.currentGames.findOne(input.gameId);
    let player: Player;
    if (input.username === game.getPlayerNames()[0]) player = game.players[0];
    else player = game.players[1];
    if (input.action.includes('start')) {
      if (input.action.includes('Up'))
        player.bar.startMoving(input.timeStamp, 1);
      if (input.action.includes('Down'))
        player.bar.startMoving(input.timeStamp, -1);
    } else player.bar.stopMoving(input.timeStamp);
    this.broadcastingGateway.emitGameUpdate(game.getId().toString(), game);
  }
}
