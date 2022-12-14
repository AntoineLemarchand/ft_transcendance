import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCookies } from 'react-cookie'

import 'static/Profile/Profile.scss'
import {ReactComponent as SchoolLogo} from 'static/logo.svg'

import Historic from './Historic'
import Friends from './Friends'
import Settings from './Settings'

import { User } from '../../utils/User'


function Profile() {
	const params = useParams();
	const [ tabIndex, setTabIndex ] = useState(0);
	const [ user, setUser ] = useState<User>();
	const [ cookie ] = useCookies(['auth'])

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
			result.text().then((text)=> {
				setUser(JSON.parse(text).userInfo);
			});
		})
	}, [])

	return (
			<div className="Profile">
				<div className="userCard">
					<div className="profileHeader">
						<img src='' alt="JD" />
					</div>
					<h1>{user !== undefined && user.name}</h1>
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
					<button
						onClick={()=>setTabIndex(2)}
						style={TabStyle(2)}
						>Settings</button>
				</div>
				<div className="content">
					<Friends isSelected={tabIndex === 0}/>
					<Historic isSelected={tabIndex === 1}/>
					<Settings isSelected={tabIndex === 2}/>
				</div>
		</div>
	)}

export default Profile;
