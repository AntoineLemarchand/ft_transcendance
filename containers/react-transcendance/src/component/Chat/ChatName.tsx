import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Channel } from "../../utils/Message";

import 'static/Chat/ChatName.scss'

function ChatName(props: {username: string,
  sender: string,
  channel: Channel,
  userName: string
  }) {

	const [ menuToggle, setMenuToggle ] = useState(false);

	const ToggleUserMenu = () => {
		setMenuToggle(!menuToggle);
	}

	const MessageSenderStyle: React.CSSProperties = (props.sender === props.username ? {
			color: "#fe9019",
			textAlign: "right",
		} : {
			color: "#b2bb26",
	})

	const ButtonStyle: React.CSSProperties = props.sender === props.username ? {
		marginLeft: "auto",
	} : {}

	const DropDownStyle = menuToggle ?
		{display: "block"} : {display: "none"}

	const options = [
		"Block",
		"Invite to play",
		"Invite to channel",
	]

  const adminOption = [
		"Make Admin",
		"Mute",
		"Ban"
  ]

  if (props.sender == props.userName)
    return (
      <div className="ChatName">
        <Link to='/profile'>{props.sender}</Link>
      </div>
    )
	return (
	<div className="ChatName">
		<div className="wrapper">
			<button
				style={MessageSenderStyle}
				onClick={ToggleUserMenu}
			>{props.sender}</button>
			<div className="options" style={DropDownStyle} onClick={ToggleUserMenu}>
				<div className="optionList" onClick={(event)=>{event.stopPropagation()}}>
				<h3 style={MessageSenderStyle}>{props.sender}</h3>
				<Link to={"/profile/" + props.sender}><button>Profile</button></Link>
				{
					options.map( (option, idx) => 
						<button key={idx} style={ButtonStyle}>{option}</button>)
        }
        {
          props.channel.admins.includes(props.userName) &&
					adminOption.map( (option, idx) => 
						<button key={idx} style={ButtonStyle}>{option}</button>)
				}
				</div>
			</div>
		</div>
	</div>
	)
}
export default ChatName;

