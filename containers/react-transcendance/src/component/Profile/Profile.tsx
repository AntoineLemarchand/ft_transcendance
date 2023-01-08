import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {useNavigate} from 'react-router-dom';

import 'static/Profile/Profile.scss'

import Historic from './Historic'
import Friends from './Friends'

import { User } from '../../utils/User'

import { FaLockOpen, FaLock } from 'react-icons/fa'
import { FaUserPlus, FaUserTimes, FaUserSlash } from 'react-icons/fa'
import { FaTableTennis } from 'react-icons/fa'

function ProfileBadge(props: {mainUser: any, shownUser: any}) {
  const twoFa = false
  const isFriend = false

  if (props.mainUser === undefined ||
    props.mainUser.name === props.shownUser.name) {
    return (
      <div className="profileBadge">
        <button
        style={{background: twoFa ? '#b8bb26' : '#cc241d'}}
        >
        { twoFa ? <FaLock/> : <FaLockOpen />}</button>
      </div>
    )
  }
  return (
    <div className="profileBadge">
      <button
      style={{background: isFriend ? '#fb4934' : '#b8bb26'}}
      > {isFriend ? <FaUserTimes /> : <FaUserPlus/>}</button>
      <button style={{background: '#cc241d'}}><FaUserSlash /></button>
      <button style={{background: '#fe8019'}}><FaTableTennis /></button>
    </div>
  )
}

function Profile(props: {user: any}) {
	const params = useParams();
  const navigate = useNavigate();
	const [ tabIndex, setTabIndex ] = useState(0);
	const [ user, setUser ] = useState<User>();

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
				<div className="userCard">
					<div className="profileHeader">
						<img src='https://voi.img.pmdstatic.net/fit/http.3A.2F.2Fprd2-bone-image.2Es3-website-eu-west-1.2Eamazonaws.2Ecom.2Fvoi.2Fvar.2Fvoi.2Fstorage.2Fimages.2Fmedia.2Fimages.2Fles-potins-du-jour.2Fpotins-26-novembre-2009.2Fshrek.2F5584668-1-fre-FR.2Fshrek.2Ejpg/753x565/cr/wqkgIC8gVm9pY2k%3D/crop-from/top/video-shrek-4-decouvrez-le-premier-teaser.jpg' alt="JD" />
					</div>
          <h1>{user !== undefined && user.name}</h1>
          <ProfileBadge 
            mainUser={user}
            shownUser={props.user}
          />
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
          friends={user !== undefined ? user.friends : []}/>
					<Historic isSelected={tabIndex === 1}/>
				</div>
		</div>
	)}

export default Profile;
