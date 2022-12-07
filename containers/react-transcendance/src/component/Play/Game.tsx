import * as React from 'react';
import { useEffect, useState } from 'react';

import 'static/Play/Game.scss'

function Game() {

  const gameSpeed = 2;
  const boardSpeed = 10;
  const [pLeftPos, setPLeftPos] = useState(37.5);
  const [pRightPos, setPRightPos] = useState(37.5);
  const [ballPos, setBallPos] = useState({x: 10, y: 10});

  const keypressHandler = (event: any) => {
    if (event.code === "KeyJ" && pLeftPos < 75)
      setPLeftPos(pLeftPos + boardSpeed > 75 ? 75 : pLeftPos + boardSpeed)
    else if (event.code === "KeyK" && pLeftPos > 0)
      setPLeftPos(pLeftPos - boardSpeed < 0 ? 0 : pLeftPos - boardSpeed)
    if (event.code === "KeyN" && pRightPos < 75)
      setPRightPos(pRightPos + boardSpeed > 75 ? 75 : pRightPos + boardSpeed)
    else if (event.code === "KeyM" && pRightPos > 0)
      setPRightPos(pRightPos - boardSpeed < 0 ? 0 : pRightPos - boardSpeed)
    else if (event.code === "KeyT")
      setBallPos({x: 90, y: 90});
  }

  useEffect(() => {
    window.addEventListener("keypress", keypressHandler, false);
    return function cleanup() {
      window.removeEventListener("keypress", keypressHandler);
    }
  })

  const ballStyle = {
    left: ballPos.x + '%',
    top: ballPos.y + '%',
    transition: 'linear ' +gameSpeed + 's',
  }

  return (
  <div className="Game">
    <span className="player left" style={{top: pLeftPos + '%'}}/>
    <span className="separator" />
    <span className="player right" style={{top: pRightPos + '%'}}/>
    <span className="ball" style={ballStyle}/>
  </div>
  )
}

export default Game;
