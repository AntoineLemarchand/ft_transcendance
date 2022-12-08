import React from 'react';

import 'static/Profile/Historic.scss';

const matches = [
{ opponent: "op1", gain: 5, loss: 3},
{ opponent: "op2oooooooooooong",winned: false, gain: 8, loss: 500},
{ opponent: "op3", gain: 5, loss: 5},
{ opponent: "op4", gain: 5, loss: 3},
{ opponent: "op5", gain: 5, loss: 30},
{ opponent: "op6", gain: 5, loss: 3},
{ opponent: "op7", gain: 5, loss: 3},
{ opponent: "op8", gain: 5, loss: 355},
{ opponent: "op9", gain: 5, loss: 3},
{ opponent: "op10", gain: 5, loss: 312},
{ opponent: "op1", gain: 5, loss: 3},
{ opponent: "op2oooooooooooong",winned: false, gain: 8, loss: 500},
{ opponent: "op3", gain: 5, loss: 3},
{ opponent: "op4", gain: 5, loss: 3},
{ opponent: "op5", gain: 5, loss: 30},
{ opponent: "op6", gain: 5, loss: 3},
{ opponent: "op7", gain: 5, loss: 3},
{ opponent: "op8", gain: 5, loss: 355},
{ opponent: "op9", gain: 5, loss: 3},
{ opponent: "op10", gain: 5, loss: 312},
{ opponent: "op1", gain: 5, loss: 3},
{ opponent: "op2oooooooooooong",winned: false, gain: 8, loss: 500},
{ opponent: "op3", gain: 5, loss: 3},
{ opponent: "op4", gain: 5, loss: 3},
{ opponent: "op5", gain: 5, loss: 30},
{ opponent: "op6", gain: 5, loss: 3},
{ opponent: "op7", gain: 5, loss: 3},
{ opponent: "op8", gain: 5, loss: 355},
{ opponent: "op9", gain: 5, loss: 3},
{ opponent: "op10", gain: 5, loss: 312},
{ opponent: "op1", gain: 5, loss: 3},
{ opponent: "op2oooooooooooong",winned: false, gain: 8, loss: 500},
{ opponent: "op3", gain: 5, loss: 3},
{ opponent: "op4", gain: 5, loss: 3},
{ opponent: "op5", gain: 5, loss: 30},
{ opponent: "op6", gain: 5, loss: 3},
{ opponent: "op7", gain: 5, loss: 3},
{ opponent: "op8", gain: 5, loss: 355},
{ opponent: "op9", gain: 5, loss: 3},
{ opponent: "op10", gain: 5, loss: 312},
];


function Historic() {
	const ChannelStatus = (match: any): React.CSSProperties => {
		if (match.gain > match.loss)
			return {background: "#98971a"};
		else if (match.gain < match.loss)
			return {background: "#cc241d"};
		else
			return {background: "#b16286"};
	}

	return (
		<div className="Historic">
			<header>
			<p>games played: {matches.length}</p>
			<p>Won: {matches.filter(item=>item.gain > item.loss).length}</p>
			<p>Loss: {matches.filter(item=>item.gain < item.loss).length}</p>
			</header>
			<div className="content">
				<div className="head">
					<p>opponent</p>
					<p>status</p>
					<p>score</p>
				</div>
				<ul className="body">
				{
				matches.map((match, idx) =>
						<li className="row" key={idx} 
						style={ChannelStatus(match)}>
							<p>&nbsp;{match.opponent}</p>
							<p>{match.gain > match.loss ? "won" : "lost"}</p>
							<p>{match.gain}/{match.loss}</p>
						</li>
						)
				}
				</ul>
			</div>
		</div>
		);
}

export default Historic;
