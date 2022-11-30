import * as React from 'react';
import { useEffect, useState } from 'react';

import 'static/Game.scss'

function Game() {

  const gameSpeed = 2;
  const boardSpeed = 10;
  const [pLeftPos, setPLeftPos] = useState(0);
  const [pRightPos, setPRightPos] = useState(0);
  const [ballPos, setBallPos] = useState({x: 0, y: 0});

  const updateBallPosition = () => {
    setBallPos({x: ballPos.x++, y: ballPos.y})
  }

  useEffect(() => {
    window.addEventListener("keypress", keypressHandler, false);
    return function cleanup() {
      window.removeEventListener("keypress", keypressHandler);
    }
  })

  const keypressHandler = event => {
    if (event.code === "KeyJ" && pLeftPos < 75)
      setPLeftPos(pLeftPos + boardSpeed > 75 ? 75 : pLeftPos + boardSpeed)
    else if (event.code === "KeyK" && pLeftPos > 0)
      setPLeftPos(pLeftPos - boardSpeed < 0 ? 0 : pLeftPos - boardSpeed)
    else if (event.code === "KeyA")
      setBallPos({x: 50, y: 50});
  }

  const pLeftStyle = {
    top: pLeftPos + '%'
  }

  const ballStyle = {
    left: ballPos.x + '%',
    top: ballPos.y + '%',
    transition: 'linear ' +gameSpeed + 's',
  }

  return (
  <div className="Game">
    <span className="player left" style={pLeftStyle}/>
    <span className="player right"/>
    <span className="ball" style={ballStyle}/>
  </div>
  )
}

export default Game;
