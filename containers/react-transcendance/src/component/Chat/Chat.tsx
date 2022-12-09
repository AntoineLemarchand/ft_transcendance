import React, {useEffect} from 'react';
import { useState } from 'react'

import { GiHamburgerMenu } from 'react-icons/gi'
//import {io,  Socket } from 'socket.io-client'

import 'static/Chat/Chat.scss'

import ChatName from './ChatName'
import NewChannelButton from './NewChannelButton'
import NewChannelMenu from './NewChannelMenu'
import {Channel, Message, putMessageInChannels} from "../../utils/Message";
//import { useCookies } from 'react-cookie';

function Chat() {
	const [NewConvMenu, SetNewConvMenu] = useState(false)
	const [joinedChannel, setJoinedChannel] = useState<Channel[]>([])
	const [currentChannel, setCurrentChannel ] =  useState<Channel>(joinedChannel[0])
	const [currentMessage, setCurrentMessage ] =  useState('')
	const [socket, setSocket] = useState<Socket>()
	const UserName = 'Thomas';


	const send = (sender: string, content: string, channel: string) =>{
		socket?.emit("messageToServer", JSON.stringify({sender: sender, content: content, channel: channel}))
	}

  const updateJoinedChannels = () => {
		fetch('http://localhost:3000/user/channels', {
				credentials: 'include',
				method: 'GET',
				headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
				},
		}).then((result) => {
      result.text().then((text)=> {
        setJoinedChannel(JSON.parse(text).channels);
        setCurrentChannel(joinedChannel[0]);
      });
		})
  }

	useEffect( () => {
    updateJoinedChannels();
	}, [setJoinedChannel, setCurrentChannel])

	const displayChannelContent = (currentChannel: Channel) => {
		if (currentChannel === undefined)
			return <></>;
		return currentChannel.messages.map((message: Message, idx: number) =>
		<li key={idx}
			className="message" style={
			{textAlign: message.sender === UserName ? "right" : "left"}}>
			<ChatName username={UserName} sender={message.sender}/>
			<p className="content">
				{message.content}
			</p>
		</li>
	)
	}

	const OnKeyDown = ((event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			let messageContent: string = (event.target as any).value;
			send(UserName, messageContent, currentChannel.name);
			setCurrentMessage('');
		}
	})

	const ChannelButtonStyle = (channel: string) => {
		return currentChannel === undefined
    || channel.channelName !== currentChannel.channelName ? {
			backgroundColor:  '#458588',
		} : {
			backgroundColor:  '#83a598',
			border: 'inset .2rem #a89984'
		}
	}

	const focusSearch = (event: React.FocusEvent<HTMLInputElement>) => {
	}

	return (
		<div className="Chat">
			<NewChannelMenu
				toggle={()=>SetNewConvMenu(!NewConvMenu)}
        callback={updateJoinedChannels}
				visible={NewConvMenu}/>
			<input className="burger" type="checkbox" id="burgerToggle"/>
			<label htmlFor="burgerToggle"><GiHamburgerMenu /></label>
			<div className="channelMenu">
				<header>
					<input type="text" onFocus={focusSearch} placeholder="search"/>
					<NewChannelButton toggle={()=>SetNewConvMenu(!NewConvMenu)}/>
				</header>
				<div className="channelList">
					{
						joinedChannel.map((channel, idx) =>
							<button
								key={idx}
								onClick={()=>setCurrentChannel(channel)}
								style={
									ChannelButtonStyle(channel)
								}>{channel.channelName}</button>
						)}
				</div>
			</div>
			<ul className="channelContent">
				<div className="chatArea">
					{displayChannelContent(currentChannel)}
				</div>
				<input type="text"
					   placeholder="Say something smart !"
					   value={currentMessage}
					   onChange={(event)=>setCurrentMessage(event.target.value)}
					   onKeyDown={OnKeyDown}/>
			</ul>
		</div>
	)
}

export default Chat;
