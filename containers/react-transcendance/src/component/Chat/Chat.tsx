import React, {useEffect} from 'react';
import { useState, useCallback } from 'react'

import { GiHamburgerMenu } from 'react-icons/gi'
import {io,  Socket } from 'socket.io-client'

import 'static/Chat/Chat.scss'

import ChatName from './ChatName'
import NewChannelButton from './NewChannelButton'
import NewChannelMenu from './NewChannelMenu'
import {Channel, Message, putMessageInChannels} from "../../utils/Message";
import { useCookies } from 'react-cookie';

function Chat() {
	const [NewConvMenu, SetNewConvMenu] = useState(false)
	const [isSearching, setIsSearching] = useState(false)
	const [joinedChannel, setJoinedChannel] = useState<Channel[]>([])
	const [currentChannel, setCurrentChannel ] =  useState<Channel>()
	const [currentMessage, setCurrentMessage ] =  useState('')
  const [cookies] = useCookies(['auth']);
	const [socket, setSocket] = useState<Socket>()

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
        if (currentChannel === undefined)
          setCurrentChannel(joinedChannel[0]);
      });
    })
  }

	useEffect( () => {
    updateJoinedChannels();
    setSocket(
      io("http://localhost:8001", {
        withCredentials: true,
        query: {auth: cookies.auth},
      })
    );
	}, [])

	const send = (sender: string, content: string, channel: string) =>{
		socket?.emit("messageToServer",
      JSON.stringify({sender: sender, content: content, channel: channel}))
	}

	useEffect(() => {
    const messageListener = (payload: string) => {
      const message: Message = JSON.parse(payload);
      const allChannels = putMessageInChannels(message, joinedChannel)
      setJoinedChannel(allChannels);
    }
		socket?.on("messageToClient", messageListener)
		return () => {socket?.off("messageToClient", messageListener)}
	}, [socket, joinedChannel])


	const displayChannelContent = (currentChannel: Channel) => {
		if (currentChannel === undefined)
			return <></>;
		return currentChannel.messages.map((message: Message, idx: number) =>
		<li key={idx}
			className="message" style={
			{textAlign: message.sender === "TODO" ? "right" : "left"}}>
			<ChatName username={message.UserName} sender={message.sender}/>
			<p className="content">
				{message.content}
			</p>
		</li>
	)}

	const OnKeyDown = ((event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' && currentChannel !== undefined) {
			let messageContent: string = (event.target as any).value;
			send("TODO", messageContent, currentChannel.channelName);
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
    setIsSearching(true);
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
					<NewChannelButton
            toggle={()=>SetNewConvMenu(!NewConvMenu)}
            style={isSearching ? {display: "none"} : {}}
          />
				</header>
				<div className="channelList">
					{
						joinedChannel.map((channel, idx) =>
							<button
								key={idx}
								onClick={()=>setCurrentChannel(channel)}
								style={ChannelButtonStyle(channel)}>
                {channel.channelName}</button>
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
