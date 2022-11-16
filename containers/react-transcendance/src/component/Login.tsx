import React from 'react'

import '../static/Login.scss'

import {ReactComponent as SchoolLogo} from '../static/logo.svg'
import Header from './Header'

function Login() {
	return (
		<div className="Login">
			<Header></Header>
			<div className="loginPrompt">
				<input type="text" />
				<input type="text" />
				<div className="loginBox">
					<button className="login">Login</button>
					<button className="create">Sign in</button>
					<button className="Oauth">
						<SchoolLogo />
					</button>
				</div>
			</div>
		</div>
	)
}

export default Login;
