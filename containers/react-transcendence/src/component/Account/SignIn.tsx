import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import 'static/Account/Prompt.scss'

function SignIn() {
	const navigate = useNavigate();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const UpdateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const UpdatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const UpdateConfirmation = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmation(event.target.value)
  }

	const ProcessSignIn = () => {
  if (password !== confirmation) {
    alert('Passwords do not match');
    return;
  }
  fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      'username': username,
      'password': password,
    }),
  })
  .then(response => {
    if (response.status === 201) {
      navigate('/');
    } else {
      alert('Wrong credentials');
    }
  })
}

	return (
		<div className="Prompt">
			<input type="text" placeholder="Username"
        onChange={UpdateUsername}/>
			<input type="password" placeholder="Password"
        onChange={UpdatePassword}/>
			<input type="password" placeholder="Confirm Password"
        onChange={UpdateConfirmation}/>
      <div className="avatar">
        <p>Avatar:</p>
        <input type="file" accept="image/*"/>
      </div>
      <div className="buttonBox">
        <button className="signin" onClick={ProcessSignIn}>Sign in</button>
      </div>
		</div>
	)
}

export default SignIn;
