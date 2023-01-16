import {Collision} from "./game.logic";

export enum GameProgress {
  INITIALIZED,
  RUNNING,
  FINISHED,
}
export class GameObject {
  private progress: GameProgress;
  private readyPlayers: Set<string>;
  collision: Collision;
  constructor(
    private gameId: number,
    private player1: string,
    private player2: string,
  ) {
    this.progress = GameProgress.INITIALIZED;
    this.readyPlayers = new Set<string>();
  }
  setReady(executorName: string) {
    this.readyPlayers.add(executorName);
    if (this.readyPlayers.size === 2)
      this.progress = GameProgress.RUNNING;
  }
  init(){
  }
  getId() {
    return this.gameId;
  }

  getStatus() {
    return this.progress;
  }

  getPlayerNames() {
    return [this.player1, this.player2];
  }
}
