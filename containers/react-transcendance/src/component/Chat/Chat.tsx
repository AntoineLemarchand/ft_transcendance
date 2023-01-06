import React, {useEffect} from 'react';
import { useState } from 'react'

import { GiHamburgerMenu } from 'react-icons/gi'

import 'static/Chat/Chat.scss'

import ChatName from './ChatName'
import * as Menus from './ChatMenus'
import ChannelMenu from './ChannelMenu'
import {Channel, Message, putMessageInChannels} from "../../utils/Message";
import {io,  Socket } from 'socket.io-client'
import { useCookies } from 'react-cookie';

function Chat() {
	const [NewConvMenu, SetNewConvMenu] = useState(false)
	const [SearchMenu, SetSearchMenu] = useState(false)
	const [currentChannel, setCurrentChannel ] =  useState<Channel>()
	const [currentMessage, setCurrentMessage ] =  useState('')
  const [cookie] = useCookies(['auth', 'userInfo']);
	const [socket, setSocket] = useState<Socket>()
	const [joinedChannel, setJoinedChannel] = useState<Channel[]>([])
	const [blockedUsers, setBlockedUsers] = useState<string[]>([])

	const send = (sender: string, content: string, channel: string) =>{
		socket?.emit("messageToServer",
      JSON.stringify({sender: sender, content: content, channel: channel}))
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
        query: {auth: cookie.auth},
      })
    );
		//eslint-disable-next-line
	}, [])

	useEffect(() => {
    const messageListener = (payload: string) => {
      const message: Message = JSON.parse(payload);
      const allChannels = putMessageInChannels(message, joinedChannel)
      setJoinedChannel(allChannels);
    }
		socket?.on("messageToClient", messageListener)
		return () => {socket?.off("messageToClient", messageListener)}
	}, [socket, joinedChannel])

  useEffect(() => {
    fetch('http://localhost:3000/user/blockedUser', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
      }).then((response) => {
        response.text().then((content) => {
          setBlockedUsers(JSON.parse(content).blockedUsers);
        })})
  }, [currentChannel])

	const displayChannelContent = (currentChannel: Channel | undefined) => {
		if (currentChannel === undefined)
			return <></>;
    return currentChannel.messages.map((message: Message, idx: number) =>
      <li key={idx}
        className="message" style={
        {textAlign: message.sender === cookie['userInfo'].name ? "right" : "left"}}>
        <ChatName
          username={message.sender}
          sender={message.sender}
          channel={currentChannel}
          userName={cookie['userInfo'].name}
        />
        <p className="content">
          {blockedUsers.indexOf(message.sender) == -1 ? message.content : '--- BLOCKED MESSAGE ---'}
        </p>
      </li>
  )}

	const OnKeyDown = ((event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' && currentChannel !== undefined) {
			let messageContent: string = (event.target as any).value;
			send(cookie['userInfo'].name, messageContent, currentChannel.channelName);
			setCurrentMessage('');
		}
	})

	return (
		<div className="Chat">
			<Menus.NewChannelMenu
				toggle={()=>{SetNewConvMenu(!NewConvMenu)}}
        callback={updateJoinedChannels}
				visible={NewConvMenu}/>
			<Menus.SearchMenu
				toggle={()=>{SetSearchMenu(!SearchMenu)}}
        callback={updateJoinedChannels}
				visible={SearchMenu}
			/>
			<input className="burger" type="checkbox" id="burgerToggle"/>
			<label htmlFor="burgerToggle"><GiHamburgerMenu /></label>
			<ChannelMenu
				currentChannel={currentChannel}
				setCurrentChannel={setCurrentChannel}
				joinedChannel={joinedChannel}
				SetNewConvMenu={SetNewConvMenu}
				SetSearchMenu={SetSearchMenu}
			/>
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
