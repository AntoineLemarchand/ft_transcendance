import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import 'static/Profile/Profile.scss'

import ProfileHeader from './Header'
import Historic from './Historic'
import Friends from './Friends'
import Options from './Options'

import { User } from '../../utils/User'
import { Channel } from "../../utils/Message";

function InviteMenu(props: {callback: any, mainUser: string, shownUser: string}) {
	const [ joinedChannels, setJoinedChannels ] = useState<Channel[]>([])

  const InviteToChannel = (event: any) => {
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/channel/invite', {
        credentials: 'include',
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: props.shownUser,
          channelName: event.target.value,
        })
    }).then((result) => {
      if (result.status === 401) {
        alert('cannot invite this user')
      } else {alert('invited !')}
      props.callback();
    })
  }

  useEffect(()=> {
    fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/user/channels', {
        credentials: 'include',
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((result) => {
      result.text().then((text)=> {
        setJoinedChannels(JSON.parse(text).channels);
      });
    })
  }, [])

  return (
    <div className="InviteMenu" onClick={props.callback}>
      <div className="Prompt" onClick={(event)=>{event.stopPropagation()}}>
        <div className="List">
        {
          joinedChannels && joinedChannels.map((channel: Channel, idx: number) => {
            return channel.type !== 2 &&
            channel.admins.includes(props.mainUser) && (
                <button
                  className="channel"
                  key={idx}
                  value={channel.channelName}
                  onClick={InviteToChannel}>
                  {channel.channelName}
                </button>
              )
          })
        }
        </div>
      </div>
    </div>
  )
}

function Profile() {
	const params = useParams();
  const navigate = useNavigate();
	const [ tabIndex, setTabIndex ] = useState(0);
	const [ mainUser, setMainUser ] = useState<User>();
	const [ shownUser, setShownUser ] = useState<User>();
  const [ inviteMenu, setInviteMenu ] = useState(false)

	const TabStyle = (selected: boolean): React.CSSProperties =>{
    return selected ? {
      background: '#83a598',
      border: 'inset .2rem #a89984',
      width: shownUser === undefined || mainUser.name === shownUser.name ?
        undefined : '50%',
    } : {
      background: '#458588',
      width: shownUser === undefined || mainUser.name === shownUser.name ?
        undefined : '50%',
    }
	}

	useEffect(() => {
		fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/user/info/' +
		(params.uid === undefined ? '' : params.uid), {
				credentials: 'include',
				method: 'GET',
				headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
				},
		}).then((result) => {
      if (result.status === 404) {navigate('/profile')}
			result.text().then((text)=> {
				setShownUser(JSON.parse(text).userInfo);
			});
		})
		fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/user/info/', {
				credentials: 'include',
				method: 'GET',
				headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
				},
		}).then((result) => {
			result.text().then((text)=> {
				setMainUser(JSON.parse(text).userInfo);
			});
		})
	}, [params.uid])

	if (mainUser && shownUser)
	return (
      <div className="Profile">
        {inviteMenu &&
        <InviteMenu
          callback={()=>setInviteMenu(false)}
          mainUser={mainUser.name}
          shownUser={shownUser.name}
          />}
        <ProfileHeader
          mainUser={mainUser}
          shownUser={shownUser}
          inviteMenu={()=>setInviteMenu(true)}
        />
				<div className="tabs">
					<button
						onClick={()=>setTabIndex(0)}
						style={TabStyle(0 === tabIndex)}
					>Friends</button>
					<button
						onClick={()=>setTabIndex(1)}
						style={TabStyle(1 === tabIndex)}
						>Historic</button>
          {mainUser.name === shownUser.name &&
					<button
						onClick={()=>setTabIndex(2)}
						style={TabStyle(2 === tabIndex)}
						>Options</button>
          }
				</div>
        <div className="content">
          {tabIndex === 0 && <Friends friends={shownUser.friends} />}
          {tabIndex === 1 && <Historic username={shownUser.name} />}
          {tabIndex === 2 && <Options />}
        </div>
		</div>
	)}

export default Profile;
