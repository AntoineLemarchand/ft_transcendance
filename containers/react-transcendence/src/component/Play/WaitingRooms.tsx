import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "static/Play/WaitingRoom.scss";

export function PreMatchRoom() {
  const [userReady, setUserReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [Gamemode, setGamemode] = useState("Normal");
	const params = useParams();

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
    })
  }, [userReady])

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

