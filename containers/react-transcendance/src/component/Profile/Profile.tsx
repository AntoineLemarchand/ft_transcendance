import React from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import 'static/Profile/Profile.scss'
import {ReactComponent as SchoolLogo} from 'static/logo.svg'

import Historic from './Historic'
import Friends from './Friends'
import Settings from './Settings'


function Profile() {
	const uid = useParams();
	const [ tabIndex, setTabIndex ] = useState(0);
	const [ user, /*setUser*/ ] =  useState({
		name: uid.uid === undefined ? "Jean Marie" : uid.uid,
		picture: "https://cdn.intra.42.fr/users/f27b945e9b897115a72dec00527d7bcd/fschlute.JPG",
		wins: 2,
		losses: 4,
		gamesPlayed: 6,
		Oauth: true,
	});

	/*
		 function fetchUserData() {
		 fetch("localhost:3000",
		 {method: 'GET'})
		 .then(request => {
		 return request.text();
		 })
		 .then((text)=> {
		 setState({name: text});
		 })
		 .catch(error => {
		 return "test";
		 })
		 };
		 */
	const TabStyle = (index: number): React.CSSProperties =>{
		return index === tabIndex ? {
			background: '#83a598',
			border: 'inset .2rem #a89984'
		} : {
			background: '#458588'
		}
	}

	return (
			<div className="Profile">
				<div className="userCard">
					<div className="profileHeader">
						<img src={user.picture} alt="JD" />
					</div>
					<h1>{user.name}</h1>
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
