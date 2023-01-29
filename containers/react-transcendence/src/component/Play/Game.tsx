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

  const ballStyle = {
    width: '1rem',
    height: '1rem',
    left: 'calc(' + currentMove.collision.coordinates.x * 100 + "% - .5rem)",
    bottom: 'calc(' + currentMove.collision.coordinates.y * 100 + "% - .5rem)",
    transition: currentMove.collision.time + "s linear",
  };

  const LeftPaddleStyle = {
    bottom: leftPos * 100 + "%",
    height: currentMove.players[0].bar.barHeight * 100 + "%",
  };

  const RightPaddleStyle = {
    bottom: rightPos * 100 + "%",
    height: currentMove.players[1].bar.barHeight * 100 + "%",
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
  if (currentMove.players[0].name !== cookies['userInfo'].name &&
    currentMove.players[1].name !== cookies['userInfo'].name)
    return;
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    return function cleanup() {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, []);

  useEffect(() => {
    const messageListener = (payload: string) => {
      setCurrentMove(JSON.parse(payload));
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

    const updateBarPosition = (
      bar: {
        barHeight: number,
        position: {x: number, y: number}
        movement: { direction: number, startTimeStamp: number },
        speed: number,
      },
      position: number,
      setPosition: Function
    ) => {
      if (position >= 1 - bar.barHeight &&
        bar.movement.direction === 1)
        setPosition(1 - bar.barHeight / 2);
      else if (position <= 0 + bar.barHeight / 2 &&
        bar.movement.direction === -1)
        setPosition(0 + bar.barHeight / 2);
      else
        setPosition(bar.position.y +
          (Date.now() - bar.movement.startTimeStamp) / 1000 *
          bar.movement.direction * bar.speed)
    }
    const interval = setInterval(() => {
      updateBarPosition(currentMove.players[0].bar, leftPos, setLeftPos);
      updateBarPosition(currentMove.players[1].bar, rightPos, setRightPos);
    }, 5)
    return (() => clearInterval(interval))
  })

  return (
    <div className="Game">
      <div className="Board">
        <span className="player left" style={LeftPaddleStyle} />
        <div className="Field">
          <span className="separator" />
          <span className="ball" style={ballStyle} />
        </div>
        <span className="player right" style={RightPaddleStyle} />
      </div>
      <GameStatus game={currentMove} />
    </div>
  );
}

export default Game;
