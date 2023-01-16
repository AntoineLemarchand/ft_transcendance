import { Collision, isAlmostEqual, PlayerBar } from './game.logic';

export enum GameProgress {
  INITIALIZED,
  RUNNING,
  FINISHED,
}

class Player {
  score: number;
  ready: boolean;

  constructor(public name: string, public bar: PlayerBar) {
    this.score = 0;
    this.ready = false;
  }
}

export class GameObject {
  private progress: GameProgress;
  collision: Collision;
  players: Player[];
  constructor(private gameId: number, player1: string, player2: string) {
    this.progress = GameProgress.INITIALIZED;
    this.players = [
      new Player(player1, new PlayerBar({ x: 0, y: 0.5 })),
      new Player(player2, new PlayerBar({ x: 1, y: 0.5 })),
    ];
  }
  setReady(executorName: string) {
    for (const player of this.players) {
      if (player.name === executorName) player.ready = true;
    }
    if (this.players[0].ready && this.players[1].ready)
      this.progress = GameProgress.RUNNING;
  }
  getId() {
    return this.gameId;
  }

  getProgress() {
    return this.progress;
  }

  getPlayerNames() {
    return [this.players[0].name, this.players[1].name];
  }

  private calcScorer() {
    if (
      isAlmostEqual(this.collision.getCoordinates().x, 0) &&
      !this.players[0].bar.isContact(this.collision.getCoordinates())
    ) {
      this.players[1].score++;
      return this.players[1];
    }
    if (
      isAlmostEqual(this.collision.getCoordinates().x, 1) &&
      !this.players[1].bar.isContact(this.collision.getCoordinates())
    ) {
      this.players[0].score++;
      return this.players[0];
    }
  }

  executeStep() {
    const scorer = this.calcScorer();
    if (scorer) {
      if (scorer.score === 10) {
        this.progress = GameProgress.FINISHED;
      }
      this.collision.reset();
    } else this.collision.update();
  }
}
