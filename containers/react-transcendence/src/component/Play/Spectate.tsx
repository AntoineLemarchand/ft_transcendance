import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRedo } from 'react-icons/fa';

import 'static/Play/Spectate.scss'

import Game from './Game'

function Spectate() {
  const [runningGames, setRunningGames] = useState<any[]>([]);
  const navigate = useNavigate();

	const scoreStyle = (score0: number, score1: number) => {
		if (score0 > score1) {
			return {background: "#b8bb26"}
		} else if (score0 !== score1) {
			return {background: "#cc241d"}
		} else {
			return {background: "#d3869b"}
		}
	}

  const updateGames = () => {
    console.log('games: ')
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/game/getRunning', {
        credentials: 'include',
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((result) => {
      result.text().then(text => {
        console.log(JSON.parse(text));
        setRunningGames(JSON.parse(text).games)
      })
    })
  }

  const spectateGame = (gameId: number) => {
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/game/spectate', {
        credentials: 'include',
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId: gameId,
        })
    });
    navigate('/game/' + gameId);
  }

  useEffect(() => {
    updateGames();
  }, [])

	return (
	<div className="Spectate">
  <div className="LiveGames">
    <p>Live games</p>
      <button onClick={updateGames}><FaRedo /></button>
  </div>
	{
		runningGames.map((game, idx) =>
			<li className="game" key={idx}
        onClick={()=>spectateGame(game.gameId)}>
				<div className="player player1">
					<p className="name">{game.players[0].name}</p>
					<p className="score"
					style={scoreStyle(game.players[1].score, game.players[0].score)}
					>{game.players[1].score}</p>
				</div>
				<div className="player player2">
					<p className="name">{game.players[1].name}</p>
					<p className="score"
					style={scoreStyle(game.players[0].score, game.players[1].score)}
					>{game.players[0].score}</p>
				</div>
			</li>
		)
	}
	</div>
	)
}
export default Spectate;

