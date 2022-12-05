import React, {useEffect} from 'react';
import { useState } from 'react'

import { GiHamburgerMenu } from 'react-icons/gi'
import {io,  Socket } from 'socket.io-client'

import 'static/Chat.scss'

import ChatName from './ChatName'
import NewChannelButton from './NewChannelButton'
import NewChannelMenu from './NewChannelMenu'
import {Channel, Message, putMessageInChannels} from "../../utils/Message";import { useCookies } from 'react-cookie';

function Chat() {
	const [NewConvMenu, SetNewConvMenu] = useState(false)
	const [channels, setChannels] = useState<Channel[]>([
		new Channel('channel1'),
		new Channel('channel2'),
		new Channel('channel3'),
		new Channel('channel4'),
		new Channel('channel5'),
	])

	const ToggleNewConvMenu = () => {
		SetNewConvMenu(!NewConvMenu);
	}

	const [cookies, setCookie, removeCookie] = useCookies(['auth']);

	const UserName: string = "Jaydee"
	const [socket, setSocket] = useState<Socket>()
	const [ getState, setState ] =  useState({
		currentChannel: channels[0],
		currentMessage: '',
	})

	const send = (sender: string, content: string, channel: string) =>{
		socket?.emit("messageToServer", JSON.stringify({sender: sender, content: content, channel: channel}))
	}

	//todo: find out why this is not working with https (you will get a CORS error in the browser console)
	//todo: where do we want to configure this ?
	useEffect(() =>{
		const newSocket = io("http://localhost:8001", {
			extraHeaders: {
				Cookie: `auth=CookieValue;`,
			},
			withCredentials: true,
			query: {auth: cookies.auth},
		})
		setSocket(newSocket)
	}, [setSocket])

	//todo: I dont understand react. help (ESLint: The 'messageListener' function makes the dependencies of useEffect Hook (at line 54) change on every render. Move it inside the useEffect callback. Alternatively, wrap the definition of 'messageListener' in its own useCallback() Hook.(react-hooks/exhaustive-deps))
	const messageListener = (payload: string) => {
		const message: Message = JSON.parse(payload);
		const allChannels = putMessageInChannels(message, channels)
		setChannels(allChannels);
		if (message.channel === getState.currentChannel.name)
			SelectChannel(allChannels[allChannels.findIndex(channel => channel.name === message.channel)]);
	}

	useEffect(() => {
		socket?.on("messageToClient", messageListener)
		return () => {
			socket?.off("messageToClient", messageListener)
		}
	}, [messageListener, socket])

	const SelectChannel = (channel: any) => {
		setState({
			currentChannel: channel,
			currentMessage: getState.currentMessage,
		})
	}

	const OnChange = ((event: React.ChangeEvent<HTMLInputElement>) => {
		setState({
			currentChannel: getState.currentChannel,
			currentMessage: event.target.value,
		})
	})

	const OnKeyDown = ((event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			let messageContent: string = (event.target as any).value;
			send(UserName, messageContent, getState.currentChannel.name);
			setState({
				currentChannel: getState.currentChannel,
				currentMessage: '',
			})
		}
	})

	const ChannelButtonStyle = (isActive: boolean) => {
		return isActive ? {
			backgroundColor:  '#83a598',
		} : {
			backgroundColor:  '#458588',
		}
	}

	return (
		<div className="Chat">
			<NewChannelMenu	toggle={ToggleNewConvMenu} setChannels={setChannels} visible={NewConvMenu}/>
			<input className="burger" type="checkbox" id="burgerToggle"/>
			<label htmlFor="burgerToggle"><GiHamburgerMenu /></label>
			<div className="channelMenu">
				<header>
					<p>Channels</p>
					<NewChannelButton toggle={ToggleNewConvMenu}/>
				</header>
				<div className="channelList">
					{
						channels.map((channel, idx) =>
							<button
								key={idx}
								onClick={()=>SelectChannel(channel)}
								style={
									ChannelButtonStyle(channel.name === getState.currentChannel.name)
								}>{channel.name}</button>
						)}
				</div>
			</div>
			<ul className="channelContent">
				<div className="chatArea">
					{getState.currentChannel.content.map((message, idx) =>
						<li key={idx}
							className="message" style={
							{textAlign: message.sender === UserName ? "right" : "left"}
						}>
							<ChatName
								username={UserName}
								sender={message.sender}
								style={message.sender === UserName ? {marginLeft: "auto"} : {}}
							/>
							<p className="content">
								{message.content}
							</p>
						</li>
					)}
				</div>
				<input type="text"
					   placeholder="Say something smart !"
					   value={getState.currentMessage}
					   onChange={OnChange}
					   onKeyDown={OnKeyDown}/>
			</ul>
		</div>
	)
}

export default Chat;
