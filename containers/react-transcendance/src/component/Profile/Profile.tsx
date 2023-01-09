import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {useNavigate} from 'react-router-dom';

import 'static/Profile/Profile.scss'

import Historic from './Historic'
import Friends from './Friends'

import { User } from '../../utils/User'

import { Channel } from "../../utils/Message";

import {
  FaLockOpen,
  FaLock,
  FaUserPlus,
  FaUserTimes,
  FaUserSlash,
  FaTableTennis,
  FaEnvelope,
} from 'react-icons/fa'

function ProfileBadge(props: {
  mainUser: any,
  shownUser: any,
  inviteButton: any
  }) {
  const twoFa = false
  const isFriend = false

  const AddFriend = () => {
      fetch('http://localhost:3000/user/friend', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
      }).then((response) => {
        response.text().then((content) => {
          const method = JSON.parse(content).friends.indexOf(props.shownUser.name) > -1 ? 'DELETE' : 'POST';
          fetch('http://localhost:3000/user/friend', {
            credentials: 'include',
            method: method,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
              username: props.shownUser.name
            }),
          })
        })
      })
  }
 

  const BlockUser = (event: any) => {
      fetch('http://localhost:3000/user/blockedUser', {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
      }).then((response) => {
        response.text().then((content) => {
          const method = JSON.parse(content).blockedUsers.indexOf(props.shownUser.name) > -1 ? 'DELETE' : 'POST';
          fetch('http://localhost:3000/user/blockedUser', {
            credentials: 'include',
            method: method,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
              username: props.shownUser.name
            }),
          })
      })
    })
  }
  if (props.mainUser === undefined ||
    props.mainUser.name === props.shownUser.name) {
    return (
      <div className="profileBadge">
        <button
        style={{
          background: twoFa ? '#b8bb26' : '#cc241d',
          gridRow: '1/3',
          gridColumn: '1/3',
          }}
        >
        { twoFa ? <FaLock/> : <FaLockOpen />}</button>
      </div>
    )
  }
  return (
    <div className="profileBadge">
      <button
      onClick={AddFriend}
      style={{background: isFriend ? '#fb4934' : '#b8bb26'}}
      > {isFriend ? <FaUserTimes /> : <FaUserPlus/>}</button>
      <button style={{background: '#cc241d'}} onClick={BlockUser}><FaUserSlash /></button>
      <button style={{background: '#fe8019'}}><FaTableTennis /></button>
      <button style={{background: '#458588'}} onClick={props.inviteButton}><FaEnvelope /></button>
    </div>
  )
}

function InviteMenu(props: {callback: any, mainUser: string, shownUser: string}) {
	const [ joinedChannels, setJoinedChannels ] = useState<Channel[]>([])

  const InviteToChannel = (event: any) => {
    console.log(event.target.value);
    fetch('http://localhost:3000/channel/invite', {
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
    fetch('http://localhost:3000/user/channels', {
        credentials: 'include',
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
    }).then((result) => {
      result.text().then((text)=> {
        setJoinedChannels(JSON.parse(text).channels);
        console.log(JSON.parse(text).channels);
      });
    })
  }, [])

  return (
    <div className="InviteMenu" onClick={props.callback}>
      <div className="Prompt" onClick={(event)=>{event.stopPropagation()}}>
        <div className="List">
        {
          joinedChannels && joinedChannels.map((channel: Channel, idx: number) => {
            if (channel.type !== 2 && channel.admins.includes(props.mainUser))
              return (
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
		fetch('http://localhost:3000/user/info/' +
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
	}, [params.uid])

	return (
			<div className="Profile">
        {inviteMenu && user &&
        <InviteMenu
          callback={()=>setInviteMenu(false)}
          mainUser={props.user.name}
          shownUser={user && user.name}
          />}
				<div className="userCard">
					<div className="profileHeader">
						<img src='https://voi.img.pmdstatic.net/fit/http.3A.2F.2Fprd2-bone-image.2Es3-website-eu-west-1.2Eamazonaws.2Ecom.2Fvoi.2Fvar.2Fvoi.2Fstorage.2Fimages.2Fmedia.2Fimages.2Fles-potins-du-jour.2Fpotins-26-novembre-2009.2Fshrek.2F5584668-1-fre-FR.2Fshrek.2Ejpg/753x565/cr/wqkgIC8gVm9pY2k%3D/crop-from/top/video-shrek-4-decouvrez-le-premier-teaser.jpg' alt="JD" />
					</div>
          <h1>{user !== undefined && user.name}</h1>
          {
            user !== undefined && <ProfileBadge 
            mainUser={props.user}
            shownUser={user}
            inviteButton={()=>setInviteMenu(true)}
          />
          }
				</div>
				<div className="tabs">
					<button
						onClick={()=>setTabIndex(0)}
						style={TabStyle(0)}
					>Friends</button>
					<button
						onClick={()=>setTabIndex(1)}
						style={TabStyle(1)}
						>Historic</button>
				</div>
				<div className="content">
					<Friends isSelected={tabIndex === 0}
          friends={user === undefined ? [] : user.friends}/>
					<Historic isSelected={tabIndex === 1}/>
				</div>
		</div>
	)}

export default Profile;
