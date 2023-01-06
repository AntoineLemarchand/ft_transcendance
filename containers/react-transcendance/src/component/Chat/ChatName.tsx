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

  const BlockUser = (event: any) => {
      fetch('http://localhost:3000/user/blockedUser', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
      }).then((response) => {
        response.text().then((content) => {
          const method = JSON.parse(content).blockedUsers.indexOf(event.target.value) > -1 ? 'DELETE' : 'POST';
            fetch('http://localhost:3000/user/blockedUser', {
              credentials: 'include',
              method: method,
              headers: {
                  'Content-type': 'application/json; charset=UTF-8',
              },
              body: JSON.stringify({
                username: event.target.value
              }),
            })
        })
      })
  }

	const options = [
		{name: "Block/Unblock", action: BlockUser},
		{name: "Invite to play", action: ()=>{}}
	]

  const adminOption = [
		{name: "Make Admin", action: BlockUser},
		{name: "Mute", action: BlockUser},
		{name: "Ban", action: BlockUser},
  ]

  if (props.sender === props.userName)
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
						<button key={idx}
              style={ButtonStyle}
              value={props.sender}
              onClick={option.action}
              >{option.name}</button>)
        }
        {
          props.channel.admins.includes(props.userName) &&
					adminOption.map( (option, idx) => 
						<button key={idx} style={ButtonStyle}>{option.name}</button>)
				}
				</div>
			</div>
		</div>
	</div>
	)
}
export default ChatName;

