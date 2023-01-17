import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Channel } from "../../utils/Message";

import 'static/Chat/ChatName.scss'

function ChatName(props: {username: string,
  sender: string,
  userName: string,
  channel: Channel,
  updateContent: Function,
  }) {

	const [ menuToggle, setMenuToggle ] = useState(false);
	const [ muteTime, setMuteTime ] = useState(false);

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

  const BanUser = () => {
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/channel/user', {
      credentials: 'include',
      method: 'DELETE',
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
          'bannedUserName': props.sender,
          'channelName': props.channel.channelName,
      }),
    }).then((result)=>{
      if (result.status === 401) {
        alert('cannot ban ' + props.sender);
      } else {
        alert(props.sender + ' has been banned')
      }
      ToggleUserMenu();
    })
  }

  const MakeAdmin = () => {
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/channel/admin', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
          'adminCandidateName': props.sender,
          'channelName': props.channel.channelName,
      }),
    }).then((result)=>{
      if (result.status === 401) {
        alert(props.sender + ' is already administrator or cannot be upgraded');
      } else {
        alert(props.sender + ' has been upgraded as administrator')
      }
      ToggleUserMenu();
    })
  }
  //req.body.mutedUsername,
  //req.body.muteForMinutes,
  //req.body.channelName,
  
  const MuteUser = () => {
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/channel/mute', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        'mutedUsername': props.sender,
        'muteForMinutes': 30,
        'channelName': props.channel.channelName,
      }),
    }).then((result)=>{
      if (result.status === 401) {
        alert(props.sender + ' cannot be muted');
      } else {
        alert(props.sender + ' has been muted for ' + muteTime + 'minutes')
      }
      ToggleUserMenu();
    })
  }

	const options = [
		{name: "Invite To Play", onClick: ()=>{}},
	]

  const adminOption = [
		{name: "Make Admin", onClick: MakeAdmin},
		{name: "Mute 30min", onClick: MuteUser},
		{name: "Ban", onClick: BanUser},
  ]

  if (props.sender === props.userName)
    return (
      <div className="ChatName">
        <Link to={'/profile'}>{props.sender}</Link>
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
              onClick={option.onClick}
              >{option.name}</button>)
        }
        {
          props.channel.admins.includes(props.userName) && props.channel.type !== 2 &&
					adminOption.map( (option, idx) => 
						<button
              key={idx}
              style={ButtonStyle}
              onClick={option.onClick}
              >{option.name}</button>)
				}
				</div>
			</div>
		</div>
	</div>
	)
}
export default ChatName;

