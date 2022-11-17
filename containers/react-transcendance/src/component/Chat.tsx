import React from 'react';
import { useRef, useState } from 'react'

import '../static/Chat.scss'

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
			name: "channel2",
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
    messageRef: useRef(null),
	})

	const SelectChannel = (channel: any) => {
		setState({
    currentChannel: channel,
    messageRef: getState.messageRef,
    })
	}

  const handleInput = (event) => {
    if (event.key == 'Enter') {
      setState({
      currentChannel: channel + {sender: UserName, getState.messageRef.current.value},
      messageRef: getState.messageRef,
      })
    }
  }

	const senderMessageStyle = {
		textAlign: "right"
	}

	return (
		<div className="Chat">
			<div className="channelList">
			{channels.map((channel, idx) =>
				<button
				key={idx}
				onClick={()=>SelectChannel(channel)}
        style={channel.name == getState.currentChannel.name ?
        {
          background:  '#83a598',
          border: 'double #1d2021'
        } : {
          background:  '#458588',
        }
        }>
				{channel.name}</button>
			)}
			</div>
			<ul className="channelContent">
      <div className="chatArea">
        {getState.currentChannel.content.map((message, idx) =>
            <li key={idx}
            className="message" style={
            {textAlign: message.sender == UserName ? "right" : "left"}
            }>
            <p className="sender" style={
            {color: message.sender == UserName ? "#fe8019" : "#b2bb26"}
            }>
              {message.sender}
            </p>
            <p className="content">
              {message.content}
            </p>
          </li>
        )}
      </div>
      <input type="text" placeholder="Say something smart !" onKeyDown={handleInput}/>
			</ul>
		</div>
	)
}

export default Chat;
