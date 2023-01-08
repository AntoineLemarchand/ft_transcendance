import * as React from 'react'
import { useState, useEffect } from 'react'
import {useNavigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';

import 'static/Account/Prompt.scss'

import {ReactComponent as SchoolLogo} from 'static/logo.svg'

function Login() {
    const navigate = useNavigate();
    const [cookie, setCookie] = useCookies(['auth', 'userInfo']);
    const [state, setState] = useState({
        username: '',
        password: '',
    });

    useEffect(() => {
			if (cookie['auth'] !== undefined)
				navigate('/home')
    })

    const ProcessLogin = () => {
			fetch('http://localhost:3000/auth/login', {
				method: 'POST',
				headers: {
						'Content-type': 'application/json; charset=UTF-8',
				},
				body: JSON.stringify({
						'username': state.username,
						'password': state.password,
				}),
			}).then(async response => {
					if (response.status === 201) {
							const token = await response.text().then((body) => {
									return JSON.parse(body).access_token
							})
							setCookie('auth', token, {path: '/'})
              setCookie('userInfo', '', {path: '/'})
							fetch('http://localhost:3000/user/info', {
									credentials: 'include',
									method: 'GET',
									headers: {
											Accept: 'application/json',
											'Content-Type': 'application/json'
									},
							}).then((result) => {
								result.text().then((text)=> {
									setCookie('userInfo', JSON.parse(text).userInfo, {path: '/'});
								})
							})
              navigate('/home');
					} else {
							alert('Wrong credentials');
					}
			})
		}

    const ProcessSignIn = () => {
        navigate('/signin');
    }

    const ProcessOauth = () => {
        navigate('/home');
    }

    const UpdatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            username: state.username,
            password: event.target.value,
        });
    }

    const UpdateLogin = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({
            username: event.target.value,
            password: state.password,
        });
    }

    return (
        <div className="Prompt">
            <input type="text" onChange={UpdateLogin} placeholder="Login"/>
            <input type="password" onChange={UpdatePassword} placeholder="Password"/>
            <div className="buttonBox">
                <button className="login"
                        onClick={ProcessLogin}>Login
                </button>
                <button className="signin"
                        onClick={ProcessSignIn}>Sign in
                </button>
                <button className="Oauth"
                        onClick={ProcessOauth}><SchoolLogo/></button>
            </div>
        </div>
    )
}

export default Login;
