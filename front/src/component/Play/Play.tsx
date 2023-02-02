import React from 'react';

import 'static/Play/Play.scss'
import Game from './Game'
import Lobby from './Lobby'
import { useParams } from 'react-router-dom'


function Play() {
  const params = useParams();
	return (
		<div className="Play">
      {
        params.gid === undefined ? <Lobby /> : <Game />
      }
		</div>
	)
}

export default Play;
