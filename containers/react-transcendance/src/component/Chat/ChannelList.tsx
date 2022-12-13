import { useState, useEffect } from 'react'
import  * as React from 'react'
import {Channel, Message, putMessageInChannels} from "../../utils/Message";
import {io,  Socket } from 'socket.io-client'
import { useCookies } from 'react-cookie';

function ChannelList(props: {currentChannel: Channel | undefined, setCurrentChannel: React.Dispatch<React.SetStateAction<Channel | undefined>>}) {
	const [joinedChannel, setJoinedChannel] = useState<Channel[]>([])
	const [socket, setSocket] = useState<Socket>()
  const [cookies] = useCookies(['auth']);

	useEffect(() => {
    const messageListener = (payload: string) => {
      const message: Message = JSON.parse(payload);
      const allChannels = putMessageInChannels(message, joinedChannel)
      setJoinedChannel(allChannels);
    }
		socket?.on("messageToClient", messageListener)
		return () => {socket?.off("messageToClient", messageListener)}
	}, [socket, joinedChannel])

	useEffect( () => {
    updateJoinedChannels();
    setSocket(
      io("http://localhost:8001", {
        withCredentials: true,
        query: {auth: cookies.auth},
      })
    );
		//eslint-disable-next-line
	}, [])

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
        if (props.currentChannel === undefined)
          props.setCurrentChannel(joinedChannel[0]);
      });
    })
  }

	const ChannelButtonStyle = (channel: string) => {
		return currentChannel === undefined
    || channel.channelName !== currentChannel.channelName ? {
			backgroundColor:  '#458588',
		} : {
			backgroundColor:  '#83a598',
			border: 'inset .2rem #a89984'
		}
	}


	return (
			<div className="channelList">{
					joinedChannel.map((channel, idx) =>
						<button
							key={idx}
							onClick={()=>props.setCurrentChannel(channel)}
							style={ChannelButtonStyle(channel.channelName)}>
							{channel.channelName}</button>)}
			</div>
	)
}

export default ChannelList;
