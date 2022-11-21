import React from 'react';

import 'static/Play.scss'


function Play() {
	const gameStatus = {
		players: ["Jaydee", "some random dude"],
		scores: [5, 0]
	}

	const PlaceholderPic1 = "https://cdn.intra.42.fr/users/e67b5f138e3ee505e5180dba55a55ac5/dpaccagn.jpg"
	const PlaceholderPic2 = "https://cdn.intra.42.fr/users/26f8442a6176644e8c7fa706d568d790/alemarch.jpg"

	return (
		<div className="Play">
			<div className="gameWindow">HERE WE SHOULD PLAY PONG</div>
			<div className="status">
				<div className="Player">
					<img className="player1"
					src={PlaceholderPic1}
					alt={gameStatus.player1} />
					<p className="name">{gameStatus.players[0]}</p>
				</div>
				<ul className="scores">
					<li className="player1">{gameStatus.scores[0]}</li>
					<li className="player2">{gameStatus.scores[1]}</li>
				</ul>
				<div className="Player">
					<p className="name">{gameStatus.players[1]}</p>
					<img className="player2"
					src={PlaceholderPic2}
					alt={gameStatus.player2} />
				</div>
			</div>
		</div>
	)
}

export default Play;
