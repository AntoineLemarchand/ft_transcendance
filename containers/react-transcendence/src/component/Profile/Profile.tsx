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

function Profile(props: {user: any}) {
	const params = useParams();
  const navigate = useNavigate();
	const [ tabIndex, setTabIndex ] = useState(0);
	const [ user, setUser ] = useState<User>();
  const [ inviteMenu, setInviteMenu ] = useState(false)

	const TabStyle = (index: number): React.CSSProperties =>{
		return index === tabIndex ? {
			background: '#83a598',
			border: 'inset .2rem #a89984'
		} : {
			background: '#458588'
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
				setUser(JSON.parse(text).userInfo);
			});
		})
	}, [navigate, params.uid])

	return (
			<div className="Profile">
        {inviteMenu && user &&
        <InviteMenu
          callback={()=>setInviteMenu(false)}
          mainUser={props.user.name}
          shownUser={user && user.name}
          />}
        {user !== undefined &&
          <ProfileHeader
            mainUser={props.user}
            shownUser={user}
            inviteMenu={()=>setInviteMenu(true)}
          />
        }
				<div className="tabs">
					<button
						onClick={()=>setTabIndex(0)}
						style={TabStyle(0)}
					>Friends</button>
					<button
						onClick={()=>setTabIndex(1)}
						style={TabStyle(1)}
						>Historic</button>
          {user && props.user.name === user.name &&
					<button
						onClick={()=>setTabIndex(2)}
						style={TabStyle(2)}
						>Options</button>
          }
				</div>
        {
          user && 
          <div className="content">
            {tabIndex === 0 && <Friends friends={user.friends}/>}
            {tabIndex === 1 && <Historic username={user.name}/>}
            {tabIndex === 2 && <Options username={props.user.name}/>}
          </div>
        }
		</div>
	)}

export default Profile;
