import React from 'react';

import '../static/Profile.scss'
import Historic from './Historic'

function Profile() {
  var placeholderName = "John Doe"
  var placeholderPic = ""
  var wins: number = 2
  var loss: number = 4
  var gamesPlayed: number = 6

	const matches = [
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "op1", winned: true, gain: 5, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oploooooooooooong",winned: false, gain: 8, loss: 500},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
		{ opponent: "oplooooooong", winned: true, gain: 80, loss: 1},
		{ opponent: "oploooooooo", winned: false, gain: 1, loss: 3},
	];

  return (
	<div className="Profile">
			<div className="userCard">
				<img src="" alt="JD" />
				<h3>{placeholderName}</h3>
				<div className="stats">
					<p className="games">
						games played<br/>{gamesPlayed}
					</p>
					<p className="win">
						win<br/>{wins}
					</p>
					<p className="loss">
						loss<br/>{loss}
					</p>
				</div>
			</div>
			<table className="historic">
					<th>opponent</th>
					<th>status</th>
					<th colSpan={2}>scores</th>
			{
				matches.map((match, idx) =>
				<tr key={idx}>
					<td>{match.opponent.slice(0, 7) + (match.opponent.length > 7 ? "..." : "")}</td>
					<td>{match.winned ? "√" : "×"}</td>
					<td>{match.gain}</td>
					<td>{match.loss}</td>
				</tr>
				)
			}
			</table>
	</div>
  );
}

export default Profile;
