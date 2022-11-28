import React from 'react';
import { useState } from 'react'

import { FaPlus } from 'react-icons/fa'
import { GiHamburgerMenu } from 'react-icons/gi'

import 'static/Chat.scss'

import ChatName from './ChatName'

function Chat() {
	const channels = [
		{
			name: "channel1",
			content: []
    },
		{
			name: "channel3",
			content: []
    },
		{
			name: "channel4",
			content: []
    },
		{
			name: "channel6",
			content: []
    },
		{
			name: "channel18",
			content: []
    },
		{
			name: "channel26",
			content: [
				{
					sender: "Jaydee",
					content: "suuuuup its JayDeee"
				}, {
					sender: "Some random dude",
					content: "Who even is jaydee"
				}, {
					sender: "less random dude",
					content: "dude !! its jaydee !!"
				}
			]

		},
		{
			name: "channelLast",
			content: [
				{
					sender: "Some random dude",
					content: "yo who's jaydee ?"
				}, {
					sender: "Jaydee",
					content: "me"
				}, {
					sender: "Some random dude",
					content: "Yo you everywhere ?????"
				}, {
					sender: "Jaydee",
					content: "I'm litteraly god"
				}, 
        {
					sender: "Some random dude",
					content: "AAAAAAAAAAAAAAAAAAAAAHHH"
        },
        {
					sender: "Some random dude",
					content: "AAAAAAAAAAAAAAAAAAAAAHHH"
        },
        {
					sender: "Some random dude",
					content: "AAAAAAAAAAAAAAAAAAAAAHHH"
        },
        {
					sender: "Some random dude",
					content: "AAAAAAAAAAAAAAAAAAAAAHHH"
        },
        {
					sender: "Some random dude",
					content: "AAAAAAAAAAAAAAAAAAAAAHHH"
        },
        {
					sender: "Some random dude",
					content: "AAAAAAAAAAAAAAAAAAAAAHHH"
        },
        {
					sender: "Some random dude",
					content: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHHH"
        },
			]
		},
	]

	const UserName: string = "Jaydee"

	const [ getState, setState ] =  useState({
		currentChannel: channels[0],
		currentMessage: '',
	})

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
			let value: string = (event.target as any).value;
			alert(value);
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
      <input className="burger" type="checkbox" id="burgerToggle"/>
      <label htmlFor="burgerToggle"><GiHamburgerMenu /></label>
			<div className="channelMenu">
			<header>
				<p>Channels</p>
				<button><FaPlus /></button>
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
