import React from 'react';

import 'static/Play.scss'

import PlaceholderPic from 'static/yikes.jpg'

function Play() {
	const gameStatus = {
		players: ["Jaydee", "some random dude"],
		scores: [5, 0]
	}

	return (
		<div className="Play">
			<div className="gameWindow">HERE WE SHOULD PLAY PONG</div>
			<div className="status">
				<div className="Player">
					<img className="player1" src={PlaceholderPic} alt={gameStatus.player1} />
					<p className="name">{gameStatus.players[0]}</p>
				</div>
				<ul className="scores">
					<li className="player1">{gameStatus.scores[0]}</li>
					<li className="player2">{gameStatus.scores[1]}</li>
				</ul>
				<div className="Player">
					<p className="name">{gameStatus.players[1]}</p>
					<img className="player2" src={PlaceholderPic} alt={gameStatus.player2} />
				</div>
			</div>
		</div>
	)
}

export default Play;
