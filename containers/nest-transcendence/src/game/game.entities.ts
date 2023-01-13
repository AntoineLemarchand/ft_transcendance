export enum GameState {
  INITIALIZED,
  RUNNING,
  FINISHED,
}
export class GameObject {
  private state: GameState;
  constructor(
    private gameId: number,
    private player1: string,
    private player2: string,
  ) {
    this.state = GameState.INITIALIZED;
  }
  getId() {
    return this.gameId;
  }

  getStatus() {
    return this.state;
  }

  getPlayerNames() {
    return [this.player1, this.player2];
  }
}
