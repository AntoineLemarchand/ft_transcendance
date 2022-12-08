import React from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import 'static/Profile/Profile.scss'
import {ReactComponent as SchoolLogo} from 'static/logo.svg'

import Historic from './Historic'


function Profile() {
	const uid = useParams();
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

return (
  <div className="Profile">
    <div className="userCard">
      <div className="profileHeader">
	<img src={user.picture} alt="JD" />
	<a href="42.fr" className="Oauth"
	style={{background: user.Oauth ? "#b8bb26" : "#cc241d"}}>
	  <SchoolLogo/> {user.Oauth ? "√" : "×" }
	</a>
      </div>
      <h1>{user.name}</h1>
    </div>
    <Historic />
  </div>
);
}

export default Profile;
