import React from 'react';
import Stack from '@mui/material/Stack';

import '../static/Historic.scss';

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


function Historic() {
	return (
			<table className="Historic">
			<tr>
					<th>opponent</th>
					<th>status</th>
					<th colSpan={2}>scores</th>
			</tr>
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
		   );
}

export default Historic;
