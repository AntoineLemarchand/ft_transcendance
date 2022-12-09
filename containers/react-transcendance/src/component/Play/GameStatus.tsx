import 'static/Play/GameStatus.scss'

function GameStatus() {
	const gameStatus = {
		players: ["Jaydee", "some random dude"],
		scores: [10, 2]
	}

	const PlaceholderPic1 = "https://cdn.intra.42.fr/users/e67b5f138e3ee505e5180dba55a55ac5/dpaccagn.jpg"
	const PlaceholderPic2 = "https://cdn.intra.42.fr/users/26f8442a6176644e8c7fa706d568d790/alemarch.jpg"

	const scoreStyle = (score0: number, score1: number) => {
		if (score0 > score1) {
			return {background: "#b8bb26"}
		} else if (score0 !== score1) {
			return {background: "#cc241d"}
		} else {
			return {background: "#d3869b"}
		}
	}
  return (
    <div className="GameStatus">
      <div className="player player1">
        <img className="picture" src={PlaceholderPic1}
        alt={gameStatus.player1} />
        <p className="name">{gameStatus.players[0]}</p>
        <div className="score"
          style={scoreStyle(gameStatus.scores[0], gameStatus.scores[1])}
        >{gameStatus.scores[0]}</div>
      </div>
      <div className="player player2">
        <img className="picture" src={PlaceholderPic2}
        alt={gameStatus.player2} />
        <p className="name">{gameStatus.players[1]}</p>
        <div className="score"
          style={scoreStyle(gameStatus.scores[1], gameStatus.scores[0])}
        >{gameStatus.scores[1]}</div>
      </div>
    </div>
  )
}

export default GameStatus;
