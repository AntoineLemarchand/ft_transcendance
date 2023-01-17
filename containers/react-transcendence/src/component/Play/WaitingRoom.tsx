import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "static/Play/WaitingRoom.scss";

function WaitingRoom() {
  const navigate = useNavigate();
  const [dotAmount, setDotAmount] = useState("");
  const [gameFound, setGameFound] = useState(true);
  const [Gamemode, setGamemode] = useState("Normal");
  const [userReady, setUserReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setDotAmount(dotAmount + ".");
      if (dotAmount === "...") setDotAmount("");
    }, 500);
  });

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

  if (gameFound)
    return (
      <div className="waitingRoom">
        <button onClick={() => setGameFound(!gameFound)}>switch</button>
        <div className="Prompt">
          <p>waiting for a game{dotAmount}</p>
        </div>
      </div>
    );

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

export default WaitingRoom;
