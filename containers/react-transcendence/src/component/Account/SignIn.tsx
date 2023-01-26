import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import 'static/Account/Prompt.scss'

function SignIn() {
	const navigate = useNavigate();
  const [state, setState] = useState({
    username: '',
    password: '',
    confirmation: '',
  })

  const UpdateUsername = (event) => {
    setState({
      username: event.target.value,
      password: state.password,
      confirmation: state.confirmation,
    })
  }

  const UpdatePassword = (event) => {
    setState({
      username: state.username,
      password: event.target.value,
      confirmation: state.confirmation,
    })
  }

  const UpdateConfirmation = (event) => {
    setState({
      username: state.username,
      password: state.password,
      confirmation: event.target.value,
    })
  }

	const ProcessSignIn = () => {
  if (state.password !== state.confirmation) {
    alert('Passwords do not match ' + state.password + '~' + state.confirmation);
    return;
  }
  fetch('http://localhost:3000/auth/signin', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      'username': state.username,
      'password': state.password,
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
			<input type="text" placeholder="Username" onChange={UpdateUsername}/>
			<input type="password" placeholder="Password" onChange={UpdatePassword}/>
			<input type="password" placeholder="Confirm Password" onChange={UpdateConfirmation}/>
      <div className="buttonBox">
        <button className="signin" onClick={ProcessSignIn}>Sign in</button>
      </div>
		</div>
	)
}

export default SignIn;
