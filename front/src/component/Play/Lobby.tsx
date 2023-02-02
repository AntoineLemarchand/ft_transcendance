import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Spectate from "./Spectate";
import "static/Play/Lobby.scss";

function Lobby() {
  const [tabIndex, setTabIndex] = useState(0);

  const tabStyle = (index: number) => {
    return index === tabIndex
      ? {
          background: "#83a598",
          border: "inset .2rem #a89984",
        }
      : {
          background: "#458588",
        };
  };

  const [invites, setInvites] = useState<any[]>([]);
  useEffect(() => {
    fetch(
      "http://" + process.env.REACT_APP_SERVER_IP + "/api/game/getPerUser",
      {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    ).then((result) => {
      if (result.status === 401) {
        alert("ERROR 401");
      } else {
        result.text().then((text) => {
          setInvites(JSON.parse(text).games);
        });
      }
    });
  }, []);

  function Lobby() {
    const navigate = useNavigate();

    return (
      <div className="MatchMaking">
        <button className="JoinQueue" onClick={() => navigate("/waitingroom")}>
          Join Matchmaking
        </button>
        <div className="Invites">
          {invites.map((invite, idx) => {
            if (invite.progress < 2)
              return (
                <button
                  key={idx}
                  className="Invite"
                  onClick={() => navigate("/game/" + invite.gameId)}
                >
                  <p>
                  {invite.players[0].name + ' VS ' + invite.players[1].name}
                  </p>
                </button>
              );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="Lobby">
      <div className="tabs">
        <button onClick={() => setTabIndex(0)} style={tabStyle(0)}>
          Play
        </button>
        <button onClick={() => setTabIndex(1)} style={tabStyle(1)}>
          Spectate
        </button>
      </div>
      {tabIndex === 0 ? <Lobby /> : <Spectate />}
    </div>
  );
}

export default Lobby;
