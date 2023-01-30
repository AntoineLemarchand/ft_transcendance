import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Socket } from "socket.io-client";
import "static/Play/GameRooms.scss";
import Game from "./Game";
import UserImage from "../Profile/UserImage";

export function PreMatchRoom(props: { socket: Socket }) {
  const [userReady, setUserReady] = useState(false);
  const [gameStart, setGameStart] = useState("");
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [currentGamemode, setCurrentGamemode] = useState("Normal");
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "http://" +
        process.env.REACT_APP_SERVER_IP +
        "/api/game/getById/" +
        params.gid,
      {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    ).then((response) => {
      if (response.status === 404) navigate("/game/" + params.gid);
      else {
        response.text().then((text) => {
          const data = JSON.parse(text);
          if (data.gameInfo.gameObject && data.gameInfo.gameObject.progress) {
            setIsGameRunning(true);
          }
        });
      }
    });
  }, []);

  const GamemodeButtonStyle = (gamemode: string) => {
    return gamemode === currentGamemode
      ? { background: "#83a598", border: "inset" }
      : { background: "#458588" };
  };

  const PlayerReadyButton = (isReady: boolean) => {
    return isReady
      ? { background: "#b8bb26", border: "inset" }
      : { background: "#cc241d" };
  };

  useEffect(() => {
    fetch("http://" + process.env.REACT_APP_SERVER_IP + "/api/game/setReady", {
      credentials: "include",
      method: userReady ? "POST" : "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        gameId: params.gid,
      }),
    }).then((response) => {
      if (response.status === 404) navigate("/game");
    });
  }, [userReady]);

  useEffect(() => {
    const messageListener = (payload: string) => {
      if (JSON.parse(payload).gameId == params.gid)
        setGameStart(payload);
    }
    props.socket.on("gameUpdateToClient", messageListener)
    return (() => {props.socket.off("gameUpdateToClient", messageListener)})
    return (() => {props.socket.off("gameUpdateToClient", messageListener)})
  }, [])

  if (gameStart !== '') {
    return (<Game firstMove={gameStart} socket={props.socket}/>)
  }
  return (
    <div className="waitingRoom">
      {!isGameRunning ? (
        <div className="Prompt">
          <div className="Gamemode">
            <button
              onClick={() => setCurrentGamemode("Normal")}
              style={GamemodeButtonStyle("Normal")}
            >
              Normal
            </button>
            <button
              onClick={() => setCurrentGamemode("Hardcore")}
              style={GamemodeButtonStyle("Hardcore")}
            >
              Hardcore
            </button>
          </div>
          <div className="PlayerStatus">
            <button
              onClick={() => setUserReady(!userReady)}
              style={PlayerReadyButton(userReady)}
            >
              Ready
            </button>
          </div>
        </div>
      ) : (
        <div className="LoadingScreen">
          <img src="/loading.gif" alt="loading" />
        </div>
      )}
    </div>
  );
}

export function MatchMakingRoom(props: { socket: Socket }) {
  const [dotAmount, setDotAmount] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setDotAmount(dotAmount + ".");
      if (dotAmount === "...") setDotAmount("");
    }, 500);
  });

  useEffect(() => {
    const messageListener = (payload: string) => {
      navigate("/game/" + payload);
    };
    props.socket.on("emitMatchMadeToClient", messageListener);
    return () => {
      props.socket.off("emitMatchMadeToClient", messageListener);
    };
  }, []);

  useEffect(() => {
    fetch(
      "http://" + process.env.REACT_APP_SERVER_IP + "/api/game/matchMaking",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
  }, []);

  return (
    <div className="waitingRoom">
      <div className="Prompt">
        <p>waiting for a game{dotAmount}</p>
        <img src="/loading.gif" alt="loading" />
      </div>
    </div>
  );
}

export function ResultRoom() {
  const params = useParams();

  useEffect(() => {
    fetch(
      "http://" + process.env.REACT_APP_SERVER_IP + "/api/game/matchMaking",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
  }, []);

  return (
    <div class="resultRoom">
      <div className="Prompt">
        <h1>Game finished</h1>
        <div className="stats">
          <UserImage username="a" />
          <p>10</p>
          <p>0</p>
          <UserImage username="a" />
        </div>
      </div>
    </div>
  );
}
