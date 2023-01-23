import { useEffect, useState, useContext } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "../WebSocket";
import "static/Play/Game.scss";
import GameStatus from "./GameStatus";

function Game(props: { firstMove: string }) {
  const context = useContext(SocketContext);
  const [currentMove, setCurrentMove] = useState(JSON.parse(props.firstMove));
  const [cookies] = useCookies(["userInfo"]);
  const [leftPos, setLeftPos] = useState(0.5);
  const [rightPos, setRightPos] = useState(0.5);
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  const ballStyle = {
    left: parseFloat(currentMove.collision.coordinates.x) * 100 + "%",
    bottom: parseFloat(currentMove.collision.coordinates.y) * 100 + "%",
    transition: currentMove.collision.time + "s linear",
  };

  const LeftPaddleStyle = {
    left: "0%",
    bottom: leftPos * 100 + "%",
    height: currentMove.players[0].bar.barHeight * 100 + "%",
  };

  const RightPaddleStyle = {
    right: "5%",
    bottom: rightPos * 100 + "%",
    height: currentMove.players[0].bar.barHeight * 100 + "%",
  };

  const keyDownHandler = (event: any) => {
    if (event.repeat) return;
    if (event.code === "ArrowUp") {
      context.socket!.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: cookies["userInfo"].name,
          action: "startUp",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    } else if (event.code === "ArrowDown") {
      context.socket!.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: cookies["userInfo"].name,
          action: "startDown",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    }
  };

  const keyUpHandler = (event: any) => {
    if (event.code === "ArrowUp") {
      context.socket!.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: cookies["userInfo"].name,
          action: "endUp",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    } else if (event.code === "ArrowDown") {
      context.socket!.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: cookies["userInfo"].name,
          action: "endDown",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    return function cleanup() {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, []);

  const updateScore = (scoreP1: number, scoreP2: number) => {
    setScore({ player1: scoreP1, player2: scoreP2 });
  };

  useEffect(() => {
    const messageListener = (payload: string) => {
      setCurrentMove(JSON.parse(payload));
      updateScore(
        JSON.parse(payload).players[0].score,
        JSON.parse(payload).players[1].score
      );
    };
    if (!context.socket) {
      context.initSocket() &&
        context.socket!.on("gameUpdateToClient", messageListener);
    } else {
      context.socket.on("gameUpdateToClient", messageListener);
    }
    return () => {
      context.socket &&
        context.socket.off("gameUpdateToClient", messageListener);
    };
  }, [context.socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      const leftBar = currentMove.players[0].bar;
      setLeftPos(
        leftBar.position.y +
          ((Date.now() - leftBar.movement.startTimeStamp) / 1000) *
            leftBar.movement.direction *
            leftBar.speed
      );
      const rightBar = currentMove.players[1].bar;
      setRightPos(
        rightBar.position.y +
          ((Date.now() - rightBar.movement.startTimeStamp) / 1000) *
            rightBar.movement.direction *
            rightBar.speed
      );
    }, 100);
    return () => clearInterval(interval);
  });

  return (
    <div className="container">
      <div className="Game">
        <span className="player left" style={LeftPaddleStyle} />
        <span className="separator" />
        <span className="player right" style={RightPaddleStyle} />
        <span className="ball" style={ballStyle} />
      </div>
      <GameStatus score={score} />
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
