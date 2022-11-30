import React from 'react';

import 'static/Play.scss'
import Game from './Game'


function Play() {
	const gameStatus = {
		players: ["Jaydee", "some random dude"],
		scores: [5, 0]
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
		<div className="Play">
			<Game/>
			<div className="status">
				<div className="player player1">
					<img className="picture" src={PlaceholderPic1}
					alt={gameStatus.player1} />
					<p className="name">{gameStatus.players[0]}</p>
				</div>
				<ul className="scores">
					<li className="player1"
            style={scoreStyle(gameStatus.scores[0], gameStatus.scores[1])}
          >{gameStatus.scores[0]}</li>
					<li className="player2"
            style={scoreStyle(gameStatus.scores[1], gameStatus.scores[0])}
          >{gameStatus.scores[1]}</li>
				</ul>
				<div className="player player2">
					<p className="name">{gameStatus.players[1]}</p>
					<img className="picture" src={PlaceholderPic2}
					alt={gameStatus.player2} />
				</div>
			</div>
		</div>
	)
}

export default Play;
