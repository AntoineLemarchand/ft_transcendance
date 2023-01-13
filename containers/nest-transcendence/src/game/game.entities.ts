export enum GameState {
  INITIALIZED,
  RUNNING,
  FINISHED,
}
export class GameObject {
  private state: GameState;
  private readyPlayers: Set<string>;
  constructor(
    private gameId: number,
    private player1: string,
    private player2: string,
  ) {
    this.state = GameState.INITIALIZED;
    this.readyPlayers = new Set<string>();
  }
  setReady(executorName: string) {
    this.readyPlayers.add(executorName);
    if (this.readyPlayers.size === 2)
      this.state = GameState.RUNNING;
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
