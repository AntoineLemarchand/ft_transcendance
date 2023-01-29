import "static/Play/GameStatus.scss";
import UserImage from '../Profile/UserImage'

function GameStatus(props: { game: any }) {
  const scoreStyle = (scoreP1: number, scoreP2: number) => {
    if (scoreP1 > scoreP2) {
      return { background: "#b8bb26" };
    } else if (scoreP1 !== scoreP2) {
      return { background: "#cc241d" };
    } else {
      return { background: "#d3869b" };
    }
  };

  return (
    <div className="GameStatus">
      <div className="player player1">
        <UserImage username={props.game.players[0].name}/>
        <p className="name">{props.game.players[0].name}</p>
        <div className="score" style={
          scoreStyle(props.game.players[0].score, props.game.players[1].score)}>
          {props.game.players[0].score}
        </div>
      </div>
      <div className="player player2">
        <UserImage username={props.game.players[1].name}/>
        <p className="name">{props.game.players[1].name}</p>
        <div className="score" style={
          scoreStyle(props.game.players[1].score, props.game.players[0].score)}>
          {props.game.players[1].score}
        </div>
      </div>
    </div>
  );
}

export default GameStatus;
