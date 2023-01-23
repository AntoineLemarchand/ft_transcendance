import { Injectable } from '@nestjs/common';
import { GameObject, GameStat } from './game.entities';
import { GameService } from './game.service';
import { ErrNotFound } from '../exceptions';

let gameService: GameService;

@Injectable()
export class GameObjectRepository {
  private currentGames = new Map<number, GameObject>();
	//private currentId = gameService.getSavedGamesLastId() + 1;
	private currentId = 0;

  constructor() {}

  findAll(): GameObject[] {
    return Array.from(this.currentGames.values());
  }

  findOne(GameId: number) {
    const Game = this.currentGames.get(GameId);
    if (!Game) return Promise.reject(new ErrNotFound('No such Game'));
    return Game;
  }

  remove(GameId: number) {
    this.currentGames.delete(GameId);
    return;
  }

  create(creatorUsername: string, player2Username = '') {
    const newId = this.currentId;
    this.currentGames.set(
      newId,
      new GameObject(this.currentId, creatorUsername, player2Username),
    );
    this.currentId++;
    return this.currentGames.get(newId) as GameObject;
  }

  clear() {
    this.currentGames.clear();
    this.currentId = 0;
  }
}
