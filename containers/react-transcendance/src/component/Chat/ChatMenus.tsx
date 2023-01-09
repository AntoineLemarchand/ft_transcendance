import * as React from 'react';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import 'static/Chat/ChatMenus.scss';
import { FaUser, FaUsers } from 'react-icons/fa'

export function ChannelModifyMenu(props: {channel: string, callback: Function}) {
  const [ newPassword, setNewPassword ] = useState('')

  const ChangePassword = () => {
    alert('here the new password should be ' + newPassword);
    props.callback();
  }

  return (
    <div
      className="ChatMenu"
      onClick={()=>props.callback()}>
      <div className="choiceBox" onClick={(e)=>e.stopPropagation()}>
        <p>New Password for {props.channel}:</p>
        <input type="password" placeholder="New Password..."
          onChange={(event)=>setNewPassword(event.target.value)}/>
        <button onClick={ChangePassword}>Submit</button>
      </div>
    </div>
  )
}

export function NewChannelMenu(props: {
	toggle: React.MouseEventHandler<HTMLDivElement>,
  callback: Function,
	visible: boolean,
	}) {

  const [channelName, setChannelName] = useState('');
  const [channelPassword, setChannelPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const NewChannel = () => {
    if (channelName === '') {
      alert("Please provide at least a channel name")
      return;
    }
    fetch('http://localhost:3000/channel/join', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
          'channelName': channelName,
          'channelPassword': channelPassword,
          'channelType': isPrivate ? 'private' : 'standard',
      }),
    }).then(response=>{
      if (response.status !== 201)
        alert("Could not create nor find channel");
      else {
        props.callback();
        setChannelName('');
        setChannelPassword('');
        props.toggle();
      }
    })
  }

	return (
		<div className="ChatMenu" style={
			{display: !props.visible ? "none" : "flex"}} onClick={props.toggle}>
			<div className="choiceBox" onClick={(event=>{event.stopPropagation()})}>
          <input type="text"
            placeholder="Name"
            onChange={(event)=>{setChannelName(event.target.value)}}
            value={channelName}
            />
          <input type="password"
            placeholder="Password"
            onChange={(event)=>{setChannelPassword(event.target.value)}}
            value={channelPassword}
            />
            <div className="CheckBox">
              <input type="checkbox"
              onClick={(event)=>setIsPrivate(event.target.checked)}/>
              <p>Private</p>
            </div>
          <button onClick={NewChannel}>Create Conversation</button>
			</div>
		</div>
	)
}

export function SearchMenu( props: {
	visible: boolean,
  callback: Function,
	toggle: React.MouseEventHandler<HTMLDivElement>,
}) {
	const [searchedChannels, setSearchedChannels] = useState<string[]>([])
	const [searchedUsers, setSearchedUsers] = useState<string[]>([])
	const [channelName, setChannelName] = useState<string>('')
	const [channelPassword, setChannelPassword] = useState<string>('')

	const updateSearchedChannels = (query: string) => {
    fetch('http://localhost:3000/channel/getMatchingNames/' + query , {
        credentials: 'include',
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((result) => {
      result.text().then((text)=> {
        setSearchedChannels(JSON.parse(text).channels);
      });
    })
    fetch('http://localhost:3000/user/getMatchingNames/' + query , {
        credentials: 'include',
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((result) => {
      result.text().then((text)=> {
				setSearchedUsers(JSON.parse(text).usernames);
      });
    })
	}

	const closeSearch = () => {
		setChannelName('');
		props.toggle();
    props.callback();
	}

	const connectToChannel = async (channelName: string, channelPassword: string)
		:Promise<number> => {
    return await fetch('http://localhost:3000/channel/join', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
          'channelName': channelName,
          'channelPassword': channelPassword,
          'channelType': 'standard',
      }),
    }).then(response=>{
			return response.status;
    }).catch(error=>{
			return error.status;
		})
	}

	const tryConnection = (event: any) => {
		connectToChannel(event.target.value, '').then(result=> {
			if (result === 401)
				setChannelName(event.target.value);
			else
				closeSearch();
		})
	}

	const newDirectMessage = async (targetUsername: string)
		:Promise<number> => {
    return await fetch('http://localhost:3000/channel/join', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
          'targetUsername': targetUsername,
          'channelType': 'directMessage',
      }),
    }).then(response=>{
			return response.status;
    }).catch(error=>{
			return error.status;
		})
	}

	const directMessage = (event: any) => {
		newDirectMessage(event.target.value).then(result=> {
			if (result === 401)
        alert("You cannot discuss with this user at the moment")
		})
    closeSearch();
	}

	const connectWithPassword = () => {
		connectToChannel(channelName, channelPassword).then(result=> {
			if (result === 401) {
				alert('Wrong Password');
				setChannelPassword('');
			} else {
				props.callback();
				closeSearch();
			}
		})
	}

	useEffect(()=> {
		updateSearchedChannels('');
	}, [])
	const [ cookie ,,] = useCookies(['userInfo']);

	if (channelName === '') {
		return (
			<div className="ChatMenu" style={
				{display: !props.visible ? "none" : "flex"}} onClick={closeSearch}>
				<div className="choiceBox" onClick={(event=>{event.stopPropagation()})}>
						<input type="text"
							placeholder="Search..."
							onChange={(event)=>updateSearchedChannels(event.target.value)}/>
            <div className="ChannelList">
						{
							searchedChannels.map((channel: string, idx: number) => {
                return ( !channel.includes('_') &&
                  <button key={idx} value={channel} onClick={tryConnection}>
                    <FaUsers /> {channel}
                  </button>
                )
							})
						}
						{
							searchedUsers.map((username: string, idx: number) => {
                return ( (username !== cookie['userInfo'].name) &&
                  <button key={idx} value={username} onClick={directMessage}>
                    <FaUser /> {username}
                  </button>
                )
							})
						}
            </div>
				</div>
			</div>
		)
	} else {
		return (
			<div className="ChatMenu" style={
				{display: !props.visible ? "none" : "flex"}} onClick={closeSearch}>
				<div className="choiceBox" onClick={(event=>{event.stopPropagation()})}>
						<p>{channelName}</p>
						<input type="password"
							placeholder="Password"
							value={channelPassword}
							onChange={(event)=>{setChannelPassword(event.target.value)}}
						/>
						<button onClick={connectWithPassword}>connect</button>
				</div>
			</div>
		)
	}
}

