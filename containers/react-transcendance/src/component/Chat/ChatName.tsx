import * as React from 'react';
import { useState, useEffect} from 'react';

import 'static/ChatName.scss'

function ChatName(props: {}) {

	const [ getState, setState ] = useState({
		menuToggle: false,
	});

	const ToggleDropDown = (event: React.MouseEvent<HTMLInputElement>) => {
		setState({menuToggle: !getState.menuToggle});
	}

	const MessageSenderStyle = props.sender === props.username ? {
			color: "#fe9019",
			textAlign: "right",
		} : {
			color: "#b2bb26",
	}

	const ButtonStyle = props.sender === props.username ? {
		marginLeft: "auto",
	} : {}

	const DropDownStyle = getState.menuToggle ? {display: "block"} : {display: "none"}

	const options = ["Make Admin", "Profile", "Invite to play", "Mute", "Ban"]

	return (
	<div className="ChatName">
		<div className="wrapper">
			<button
				style={MessageSenderStyle}
				onClick={ToggleDropDown}
			>{props.sender}</button>
			<div className="options" style={DropDownStyle}>
			{
				options.map( (option, idx) => 
					<button key={idx} style={ButtonStyle}>{option}</button>
				)
			}
			</div>
		</div>
	</div>
	)
}
export default ChatName;

