import React from 'react'
import { useNavigate } from 'react-router-dom';

import 'static/Prompt.scss'

function SignIn() {
	const navigate = useNavigate();

	const ProcessSignIn = () => {
		navigate('/dashboard');
	}

	return (
		<div className="Prompt">
			<input type="text" placeholder="SignIn"/>
			<input type="text" placeholder="Password"/>
			<input type="text" placeholder="Confirm Password"/>
      <div className="buttonBox">
        <button className="signin" onClick={ProcessSignIn}>Sign in</button>
      </div>
		</div>
	)
}

export default SignIn;
