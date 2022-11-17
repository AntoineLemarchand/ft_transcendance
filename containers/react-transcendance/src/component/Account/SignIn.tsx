import React from 'react'
import { useNavigate } from 'react-router-dom';

import 'static/SignIn.scss'

import {ReactComponent as SchoolLogo} from 'static/logo.svg'
import Header from './Header'

function SignIn() {
	const navigate = useNavigate();

	const ProcessSignIn = () => {
		navigate('/dashboard');
	}

	return (
		<div className="SignIn">
			<input type="text" placeholder="SignIn"/>
			<input type="text" placeholder="Password"/>
			<input type="text" placeholder="Confirm Password"/>
			<button className="signin"
			onClick={ProcessSignIn}>Sign in</button>
		</div>
	)
}

export default SignIn;
