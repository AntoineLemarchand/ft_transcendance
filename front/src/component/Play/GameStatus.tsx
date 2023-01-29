import "static/Play/GameStatus.scss";

type GameStatusProps = {
  score: {
    player1: number;
    player2: number;
  };
};

function GameStatus({ score }: GameStatusProps) {
  const gameStatus = {
    players: ["Jaydee", "some random dude"],
  };

  const PlaceholderPic1 =
    "https://cdn.intra.42.fr/users/e67b5f138e3ee505e5180dba55a55ac5/dpaccagn.jpg";
  const PlaceholderPic2 =
    "https://cdn.intra.42.fr/users/26f8442a6176644e8c7fa706d568d790/alemarch.jpg";

  const scoreStyle = (scoreP1: number, scoreP2: number) => {
    if (scoreP1 > scoreP2) {
      return { background: "#b8bb26" };
    } else if (scoreP1 !== scoreP2) {
      return { background: "#cc241d" };
    } else {
      return { background: "#d3869b" };
    }
  };

  return (
    <div className="GameStatus">
      <div className="player player1">
        <img
          className="picture"
          src={PlaceholderPic1}
          alt={gameStatus.players[0]}
        />
        <p className="name">{gameStatus.players[0]}</p>
        <div className="score" style={scoreStyle(score.player1, score.player2)}>
          {score.player1}
        </div>
      </div>
      <div className="player player2">
        <img
          className="picture"
          src={PlaceholderPic2}
          alt={gameStatus.players[1]}
        />
        <p className="name">{gameStatus.players[1]}</p>
        <div className="score" style={scoreStyle(score.player2, score.player1)}>
          {score.player2}
        </div>
      </div>
    </div>
  );
}

export default GameStatus;
