import * as React from "react";
import { useEffect, useState } from "react";

import "static/Play/Game.scss";
import GameStatus from "./GameStatus";

function Game() {
  let ballSpeed: number = 0.1;
  const paddleSpeed = 10;
  const paddleHeight = 25;
  const paddleWidth = 3;
  const ballSize = paddleWidth + 2;
  const [paddle1, setPaddle1] = useState({ x: 5, y: 37.5 });
  const [paddle2, setPaddle2] = useState({ x: 95, y: 37.5 });
  const [ballPos, setBallPos] = useState({ x: 48, y: 45 });
  const [ballDirection, setBallDirection] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  const ballStyle = {
    left: ballPos.x + "%",
    top: ballPos.y + "%",
  };

  /* put ball in the middle of the screen and give it a random direction */
  function initBall() {
    setBallPos({ x: 47, y: 45 });
    setBallDirection({
      x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1,
    });
  }

  const keypressHandler = (event: any) => {
    /* Player 1 controls */
    if (event.code === "KeyJ" && paddle1.y < 75)
      /* Down */
      setPaddle1({
        x: paddle1.x,
        y: paddle1.y + paddleSpeed > 75 ? 75 : paddle1.y + paddleSpeed,
      });
    else if (event.code === "KeyK" && paddle1.y > 0)
      /* Up*/
      setPaddle1({
        x: paddle1.x,
        y: paddle1.y - paddleSpeed < 0 ? 0 : paddle1.y - paddleSpeed,
      });
    /* Player 2 controls */
    if (event.code === "KeyN" && paddle2.y < 75)
      /* Down */
      setPaddle2({
        x: paddle2.x,
        y: paddle2.y + paddleSpeed > 75 ? 75 : paddle2.y + paddleSpeed,
      });
    else if (event.code === "KeyM" && paddle2.y > 0)
      /* Up */
      setPaddle2({
        x: paddle2.x,
        y: paddle2.y - paddleSpeed < 0 ? 0 : paddle2.y - paddleSpeed,
      });
    else if (event.code === "KeyT") {
      /* Start new game */
      initBall();
      setScore({ player1: 0, player2: 0 });
    }
  };

  /* keypress event listener */
  useEffect(() => {
    window.addEventListener("keypress", keypressHandler, false);
    return function cleanup() {
      window.removeEventListener("keypress", keypressHandler);
    };
  });

  /* collision detection */
  useEffect(() => {
    /* floor and ceiling */
    if (ballPos.y <= 0 || ballPos.y >= 90)
      setBallDirection({ x: ballDirection.x, y: -ballDirection.y });
    /* left wall */
    if (ballPos.x <= 0) {
      setScore({ ...score, player2: score.player2 + 1 });
      initBall();
    }
    /* right wall */
    if (ballPos.x >= 100) {
      setScore({ ...score, player1: score.player1 + 1 });
      initBall();
    }
    /* paddle 1 contact */
    if (ballPos.x <= paddle1.x) {
      if (ballPos.y > paddle1.y && ballPos.y < paddle1.y + paddleHeight) {
        ballPos.x = paddle1.x + paddleWidth + ballSize; // prevent ball from getting stuck in paddle
        setBallDirection({ x: -ballDirection.x, y: ballDirection.y });
      }
    }
    /* paddle 2 contact */
    if (ballPos.x >= paddle2.x - ballSize) {
      if (ballPos.y > paddle2.y && ballPos.y < paddle2.y + paddleHeight) {
        ballPos.x = paddle2.x - ballSize; // prevent ball from getting stuck in paddle
        setBallDirection({ x: -ballDirection.x, y: ballDirection.y });
      }
    }
  }, [ballPos]);

  /* move ball */
  useEffect(() => {
    const interval = setInterval(() => {
      setBallPos({
        x: ballPos.x + ballDirection.x * ballSpeed,
        y: ballPos.y + ballDirection.y * ballSpeed,
      });
    }, ballSpeed * 10);
    return () => clearInterval(interval);
  }, [ballPos, ballDirection]);

  /* Update the score */
  function updateScore(player: "player1" | "player2", value: number) {
    setScore({ ...score, [player]: value });
  }

  return (
    <div className="container">
      <div className="Game">
        <span className="player left" style={{ top: paddle1.y + "%" }} />
        <span className="separator" />
        <span className="player right" style={{ top: paddle2.y + "%" }} />
        <span className="ball" style={ballStyle} />
      </div>
      <div className="statusbar">
        <GameStatus score={score} updateScore={updateScore} />
      </div>
    </div>
  );
}

export default Game;
