import { useState, useEffect } from "react";

import "static/Profile/Historic.scss";

function Historic(props: { username: string }) {
  const [playedGames, setPlayedGames] = useState<
    {
      gameId: number;
      player1: string;
      score1: number;
      player2: string;
      score2: number;
    }[]
  >([]);

  const ChannelStatus = (
    currentScore: number,
    otherScore: number
  ): React.CSSProperties => {
    if (currentScore > otherScore) return { background: "#b8bb26" };
    else if (currentScore < otherScore) return { background: "#cc241d" };
    else return { background: "#b16286" };
  };

  useEffect(() => {
    fetch(
      "http://" +
        process.env.REACT_APP_SERVER_IP +
        "/api/game/getSavedGamesByPlayer/" +
        props.username,
      {
        credentials: "include",
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    ).then((response) => {
      response.text().then((text) => {
        setPlayedGames(JSON.parse(text).games);
      });
    });
  }, []);

  const isPlayerOne = (game: any) => {
    return game.player1 === props.username;
  };

  return (
    <div className="Historic">
      <div className="statsHeader">
        <p>games played: {playedGames.length}</p>
        <p>
          Won:{" "}
          {
            playedGames.filter((item) =>
              isPlayerOne(item)
                ? item.score1 > item.score2
                : item.score2 > item.score1
            ).length
          }
        </p>
        <p>
          Lost:{" "}
          {
            playedGames.filter((item) =>
              isPlayerOne(item)
                ? item.score2 > item.score1
                : item.score1 > item.score2
            ).length
          }
        </p>
      </div>
      <div className="content">
        <div className="head">
          <p />
          <p>Opponent</p>
          <p>Scored</p>
          <p>Lost</p>
        </div>
        <ul className="body">
          {playedGames.reverse().map((game, idx) => (
            <li className="row" key={idx}>
              <span
                style={
                  isPlayerOne(game)
                    ? ChannelStatus(game.score1, game.score2)
                    : ChannelStatus(game.score2, game.score1)
                }
              />
              <p>{isPlayerOne(game) ? game.player2 : game.player1}</p>
              <p>{isPlayerOne(game) ? game.score1 : game.score2}</p>
              <p>{isPlayerOne(game) ? game.score2 : game.score1}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Historic;
