import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { User, updateUserInfo } from "../../utils/User";
import "static/Play/Game.scss";
import GameStatus from "./GameStatus";

function Game(props: { firstMove: string; socket: Socket; mode: boolean }) {
  const [currentMove, setCurrentMove] = useState(JSON.parse(props.firstMove));
  const [leftPos, setLeftPos] = useState(0.5);
  const [rightPos, setRightPos] = useState(0.5);
  const [userInfo, setUserInfo] = useState<User>();
  const navigate = useNavigate();

  const ballStyle = {
    width: "1rem",
    height: "1rem",
    left: "calc(" + currentMove.collision.coordinates.x * 100 + "% - .5rem)",
    bottom: "calc(" + currentMove.collision.coordinates.y * 100 + "% - .5rem)",
    transition: currentMove.collision.time + "s linear",
    background: !props.mode ? "#928374" : "#cc241d",
  };

  const LeftPaddleStyle = {
    bottom: (leftPos - currentMove.players[0].bar.barHeight / 2) * 100 + "%",
    height: "calc(" + currentMove.players[0].bar.barHeight * 100 + "%)",
    background: !props.mode ? "#ebdbb2" : "#b8bb26",
  };

  const RightPaddleStyle = {
    bottom: (rightPos - currentMove.players[1].bar.barHeight / 2) * 100 + "%",
    height: "calc(" + currentMove.players[1].bar.barHeight * 100 + "%)",
    background: !props.mode ? "#928374" : "#282828",
  };

  const BoardStyle = {
    backgroundImage: !props.mode
      ? "url(/thisissparta.jpg)"
      : "url(../../../bg-shrek.jpg)",
    backgroundSize: !props.mode ? "contains" : "cover",
    backgroundRepeat: !props.mode ? "repeat" : "no-repeat",
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
      if (position >= 1 - bar.barHeight / 2 && bar.movement.direction === 1)
        setPosition(1 - bar.barHeight / 2);
      else if (
        position <= 0 + bar.barHeight / 2 &&
        bar.movement.direction === -1
      )
        setPosition(0 + bar.barHeight / 2);
      else
        setPosition(
          bar.position.y +
            ((Date.now() + 200 - bar.movement.startTimeStamp) / 1000) *
              bar.movement.direction * bar.speed
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
      props.socket.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: userInfo.name,
          action: "startUp",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    } else if (event.code === "ArrowDown") {
      props.socket.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: userInfo.name,
          action: "startDown",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    }
  };

  const keyUpHandler = (event: any) => {
    setLeftPos(currentMove.players[0].bar.position.y);
    setRightPos(currentMove.players[1].bar.position.y);
    if (event.code === "ArrowUp") {
      props.socket.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: userInfo.name,
          action: "endUp",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    } else if (event.code === "ArrowDown") {
      props.socket.emit(
        "gameUpdateToServer",
        JSON.stringify({
          username: userInfo.name,
          action: "endDown",
          timeStamp: Date.now(),
          gameId: currentMove.gameId,
        })
      );
    }
  };

  useEffect(() => {
    updateUserInfo(setUserInfo);
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

  useEffect(() => {
    if (!userInfo)
      return;
    if (
      currentMove.players[0].name !== userInfo.name &&
      currentMove.players[1].name !== userInfo.name
    )
      return;
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    return function cleanup() {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, [userInfo]);

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
