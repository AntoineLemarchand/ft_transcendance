import React from 'react'
import { useEffect, useState } from 'react'

import '../static/Profile.scss'
import {ReactComponent as SchoolLogo} from '../static/logo.svg'

import PlaceholderPic from '../static/yikes.jpg'

import Historic from './Historic'


function Profile() {
	const [ getState, setState ] =  useState({
	name: ''
	});

	function fetchUserData() {
		let data = fetch("http://localhost:3000",
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

	fetchUserData();
	const placeholderPic = PlaceholderPic;
	const wins: number = 2;
	const loss: number = 4;
	const gamesPlayed: number = 6;
	const Oauth = true;

	return (
			<div className="Profile">
			<div className="userCard">
			<div className="stats">
			<img src={placeholderPic} alt="JD" />
			<h4>{getState.name}</h4>
			<a href="" className="Oauth"
			style={{background: Oauth ? "#b8bb26" : "#cc241d"}}>
			<SchoolLogo/> {Oauth ? "√" : "×" }
			</a>
			<p className="games">
			games played<br/>{gamesPlayed}
			</p>
			<p className="win">
			win<br/>{wins}
			</p>
			<p className="loss">
			loss<br/>{loss}
			</p>
			</div>
			</div>
	<Historic></Historic>
	</div>
	);
}

export default Profile;
