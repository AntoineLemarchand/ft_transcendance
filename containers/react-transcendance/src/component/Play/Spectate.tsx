import * as React from 'react';
import { useState } from 'react';

import 'static/Play/Spectate.scss'

import Game from './Game'

function Spectate() {
	
	const livegames = [
		{
			players: ["Jaydee", "some random dude"],
			scores: [5, 0]
		},
		{
			players: ["Jaydee", "Jaydee"],
			scores: [5, 300]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [5, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
		{
			players: ["some other dude", "some random dude"],
			scores: [3, 3]
		},
	]

	interface Game {
		players: string[],
		scores: number[],
	}

	const [getState, setState] = useState({
		spectateMode: false,
		currentGame: null,
	})

	const SelectGame = (game: Game) => {
		setState({
			spectateMode: true,
			currentGame: game,
		})
	}

	const CloseGame = (game: Game) => {
		setState({
			spectateMode: false,
			currentGame: null,
		})
	}

	const scoreStyle = (score0: number, score1: number) => {
		if (score0 > score1) {
			return {background: "#b8bb26"}
		} else if (score0 !== score1) {
			return {background: "#cc241d"}
		} else {
			return {background: "#d3869b"}
		}
	}

	const SpectateGame = ((game: Game) => {
		if (getState.spectateMode)
		return (
			<div className="spectateScreen" onClick={CloseGame}>
				<Game /> 
			</div>
		)
	})

	return (
	<div className="Spectate">
	{
		livegames.map((game, idx) =>
			<li className="game" key={idx} onClick={()=>SelectGame(game)}>
				<div className="player player1">
					<p className="name">{game.players[0]}</p>
					<p className="score"
					style={scoreStyle(game.scores[1], game.scores[0])}
					>{game.scores[1]}</p>
				</div>
				<div className="player player2">
					<p className="name">{game.players[1]}</p>
					<p className="score"
					style={scoreStyle(game.scores[0], game.scores[1])}
					>{game.scores[0]}</p>
				</div>
			</li>
		)
	}
			<SpectateGame />
	</div>
	)
}
export default Spectate;

