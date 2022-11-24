import React from 'react'
import { useNavigate } from 'react-router-dom';

import 'static/Prompt.scss'

import {ReactComponent as SchoolLogo} from 'static/logo.svg'

function Login() {
	const navigate = useNavigate();

	const ProcessLogin = () => {
		navigate('/dashboard');
	}

	const ProcessSignIn = () => {
		navigate('/signin');
	}

	const ProcessOauth = () => {
		navigate('/dashboard');
	}

	return (
		<div className="Prompt">
			<input type="text" placeholder="Login"/>
			<input type="text" placeholder="Password"/>
			<div className="buttonBox">
				<button className="login"
				onClick={ProcessLogin}>Login</button>
				<button className="signin"
				onClick={ProcessSignIn}>Sign in</button>
				<button className="Oauth"
				onClick={ProcessOauth}><SchoolLogo /></button>
			</div>
		</div>
	)
}

export default Login;
