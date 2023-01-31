import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "static/Play/Game.scss";
import GameStatus from "./GameStatus";

function Game(props: { firstMove: string; socket: Socket , mode : string}) {
  const [currentMove, setCurrentMove] = useState(JSON.parse(props.firstMove));
  const [cookies] = useCookies(["userInfo"]);
  const [leftPos, setLeftPos] = useState(0.5);
  const [rightPos, setRightPos] = useState(0.5);
  const navigate = useNavigate();

  const BoardStyle = {
    backgroundImage: props.mode === "Normal" ? "url(/thisissparta.jpg)" : "url(../../../bg-shrek.jpg)",
    backgroundSize: props.mode === "Normal" ? "contains" : "cover",
    backgroundRepeat: props.mode === "Normal" ? "repeat" : "no-repeat",
  };

  const ballStyle = {
    width: "1rem",
    height: "1rem",
    left: "calc(" + currentMove.collision.coordinates.x * 100 + "% - .5rem)",
    bottom: "calc(" + currentMove.collision.coordinates.y * 100 + "% - .5rem)",
    transition: currentMove.collision.time + "s linear",
    background: props.mode === "Normal" ? "#928374" : "#cc241d",
  };

  const LeftPaddleStyle = {
    bottom: (leftPos - currentMove.players[0].bar.barHeight / 2) * 100 + "%",
    height: "calc(" + currentMove.players[0].bar.barHeight * 100 + "%)",
    background: props.mode === "Normal" ? "#ebdbb2" : "#b8bb26",
  };

  const RightPaddleStyle = {
    bottom: (rightPos - currentMove.players[1].bar.barHeight / 2) * 100 + "%",
    height: "calc(" + currentMove.players[1].bar.barHeight * 100 + "%)",
    background: props.mode === "Normal" ? "#928374" : "#282828",
  };

  useEffect(() => {
    const updateBarPosition = (
      bar: {
        barHeight: number;
        position: { x: number; y: number };
        movement: { direction: number; startTimeStamp: number };
        speed: number;
      },
      position: number,
      setPosition: Function
    ) => {
      if (position >= 1 - bar.barHeight / 2 &&
        bar.movement.direction === 1)
        setPosition(1 - bar.barHeight / 2);
      else if (
        position <= 0 + bar.barHeight / 2 &&
        bar.movement.direction === -1
      )
        setPosition(0 + bar.barHeight / 2);
      else
        setPosition(
          bar.position.y +
            ((Date.now() - bar.movement.startTimeStamp) / 1000) *
              bar.movement.direction *
              bar.speed
        );
    };
    const interval = setInterval(() => {
      updateBarPosition(currentMove.players[0].bar, leftPos, setLeftPos);
      updateBarPosition(currentMove.players[1].bar, rightPos, setRightPos);
    }, 5);
    return () => clearInterval(interval);
  });

  const keyDownHandler = (event: any) => {
    if (event.repeat) return;
    if (event.code === "ArrowUp") {
      console.log('keydown!');
      props.socket.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: cookies["userInfo"].name,
          action: "startUp",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    } else if (event.code === "ArrowDown") {
      props.socket.emit(
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
    setLeftPos(currentMove.players[0].bar.position.y)
    setRightPos(currentMove.players[1].bar.position.y)
    if (event.code === "ArrowUp") {
      props.socket.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: cookies["userInfo"].name,
          action: "endUp",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    } else if (event.code === "ArrowDown") {
      props.socket.emit(
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
    if (
      currentMove.players[0].name !== cookies["userInfo"].name &&
      currentMove.players[1].name !== cookies["userInfo"].name
    )
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
      const gameStatus = JSON.parse(payload);
      if (gameStatus.gameId !== JSON.parse(props.firstMove).gameId) return;
      if (gameStatus.progress === 2) navigate("/results/" + gameStatus.gameId);
      setCurrentMove(gameStatus);
    };
    props.socket.on("gameUpdateToClient", messageListener);
    return () => {
      props.socket.off("gameUpdateToClient", messageListener);
    };
  }, []);

  return (
    <div className="Game">
      <div className="Board" style={BoardStyle}>
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
