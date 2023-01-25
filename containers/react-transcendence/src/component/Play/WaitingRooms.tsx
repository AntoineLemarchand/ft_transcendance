import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from '../WebSocket'
import "static/Play/WaitingRoom.scss";
import Game from './Game'

export function PreMatchRoom() {
  const [userReady, setUserReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [gameStart, setGameStart] = useState('');
  const [Gamemode, setGamemode] = useState("Normal");
	const params = useParams();
  const navigate = useNavigate();
  const context = useContext(SocketContext);

  const GamemodeButtonStyle = (gamemode: string) => {
    return gamemode === Gamemode
      ? {
          background: "#83a598",
          border: "inset",
        }
      : {
          background: "#458588",
        };
  };

  const PlayerReadyButton = (isReady: boolean) => {
    return isReady
      ? {
          background: "#b8bb26",
          border: "inset",
        }
      : {
          background: "#cc241d",
        };
  };

  useEffect(() => {
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/game/setReady', {
      credentials: 'include',
      method: userReady ? 'POST' : 'DELETE',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        'gameId': params.gid,
      }),
    }).then((response) => {
      if (response.status === 500)
        navigate('/game');
    })
  }, [userReady])

  useEffect(()=> {
    const messageListener = (payload: string) => {
      setGameStart(payload);
    }
    if (!context.socket) {
      context.initSocket() &&
      context.socket!.on("gameUpdateToClient", messageListener)
    } else
      context.socket.on("gameUpdateToClient", messageListener)
  }, [])

  if (gameStart != '') {
    return (<Game firstMove={gameStart}/>)
  }
  return (
    <div className="waitingRoom">
      <div className="Prompt">
        <div className="Gamemode">
          <button
            onClick={() => setGamemode("Normal")}
            style={GamemodeButtonStyle("Normal")}
          >
            Normal
          </button>
          <button
            onClick={() => setGamemode("Hardcore")}
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
          <button onClick={() => {}} style={PlayerReadyButton(opponentReady)}>
            Ready
          </button>
        </div>
      </div>
    </div>
  );
}

export function MatchMakingRoom() {
  const [dotAmount, setDotAmount] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setDotAmount(dotAmount + ".");
      if (dotAmount === "...") setDotAmount("");
    }, 500);
  });

  return (
    <div className="waitingRoom">
      <div className="Prompt">
        <p>waiting for a game{dotAmount}</p>
      </div>
    </div>
  );

}

