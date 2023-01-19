import { useEffect, useState, useContext } from "react";

import { SocketContext } from '../WebSocket';

import "static/Play/Game.scss";
//import GameStatus from "./GameStatus";

function Game(props: {firstMove: string}) {
  const context = useContext(SocketContext);
  const [currentMove, setCurrentMove] = useState(JSON.parse(props.firstMove));

  const ballStyle = {
    left: (parseFloat(currentMove.collision.coordinates.x) * 100) + "%",
    top: (parseFloat(currentMove.collision.coordinates.y) * 100) + "%",
    transition: currentMove.time + "s",
  };

  const LeftPaddleStyle = {
    left: "5%",
    top: currentMove.players[0].y + "%",
  };

  const RightPaddleStyle = {
    left: "95%",
    top: currentMove.players[1].y + "%",
  };

  useEffect(()=> {
    const messageListener = (payload: string) => {
      console.log(ballStyle);
      setCurrentMove(JSON.parse(payload));
    }
    if (!context.socket) {
      context.initSocket() &&
      context.socket!.on("gameUpdateToClient", messageListener)
    } else
      context.socket.on("gameUpdateToClient", messageListener)
    console.log('ready to receive game update')
  }, [context.socket])

  return (
    <div className="container">
      <div className="Game">
        <span className="player left" style={LeftPaddleStyle} />
        <span className="separator" />
        <span className="player right" style={RightPaddleStyle} />
        <span className="ball" style={ballStyle} />
      </div>
    </div>
  );
}

/*
function Game() {
  let ballSpeed: number = 0.1;
  const paddleSpeed = 10;
  const paddleHeight = 20;
  const paddleWidth = 3;
  const ballSize = paddleWidth + 2;
  const [paddle1, setPaddle1] = useState({ x: 5, y: 0 });
  const [paddle2, setPaddle2] = useState({ x: 95, y: 0 });
  const [ballPos, setBallPos] = useState({ x: 48, y: 45 });
  const [ballDirection, setBallDirection] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  const keypressHandler = (event: any) => {
    if (event.code === "KeyJ" && paddle1.y < 75)
      setPaddle1({
        x: paddle1.x,
        y: paddle1.y + paddleSpeed > 75 ? 75 : paddle1.y + paddleSpeed,
      });
    else if (event.code === "KeyK" && paddle1.y > 0)
      setPaddle1({
        x: paddle1.x,
        y: paddle1.y - paddleSpeed < 0 ? 0 : paddle1.y - paddleSpeed,
      });
  };

  useEffect(() => {
    window.addEventListener("keypress", keypressHandler, false);
    return function cleanup() {
      window.removeEventListener("keypress", keypressHandler);
    };
  });

  useEffect(() => {
    if (ballPos.y <= 0 || ballPos.y >= 90)
      setBallDirection({ x: ballDirection.x, y: -ballDirection.y });
    if (ballPos.x <= 0) {
      setScore({ ...score, player2: score.player2 + 1 });
      initBall();
    }
    if (ballPos.x >= 100) {
      setScore({ ...score, player1: score.player1 + 1 });
      initBall();
    }
    if (ballPos.x <= paddle1.x) {
      if (ballPos.y > paddle1.y && ballPos.y < paddle1.y + paddleHeight) {
        ballPos.x = paddle1.x + paddleWidth + ballSize; // prevent ball from getting stuck in paddle
        setBallDirection({ x: -ballDirection.x, y: ballDirection.y });
      }
    }
    if (ballPos.x >= paddle2.x - ballSize) {
      if (ballPos.y > paddle2.y && ballPos.y < paddle2.y + paddleHeight) {
        ballPos.x = paddle2.x - ballSize; // prevent ball from getting stuck in paddle
        setBallDirection({ x: -ballDirection.x, y: ballDirection.y });
      }
    }
  }, [ballPos]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBallPos({
        x: ballPos.x + ballDirection.x * ballSpeed,
        y: ballPos.y + ballDirection.y * ballSpeed,
      });
    }, ballSpeed * 10);
    return () => clearInterval(interval);
  }, [ballPos, ballDirection]);

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

*/
export default Game;
