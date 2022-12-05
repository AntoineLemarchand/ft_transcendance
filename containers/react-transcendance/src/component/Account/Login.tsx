import React from 'react'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom';
import { useCookies } from 'react-cookie';

import 'static/Prompt.scss'

import {ReactComponent as SchoolLogo} from 'static/logo.svg'

function Login() {

    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['auth']);
    const [state, setState] = useState({
        username: 'Thomas',
        password: 'test',
    });

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
                    setCookie('auth', token)
                    fetch('http://localhost:3000/user/friend', {
                        credentials: 'include',
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                    }).then((result) => {console.log('user infos'); result.text().then(body => console.log(body))})

                    navigate('/dashboard');
                } else {
                    alert('Wrong credentials');
                }
            })
    }

    const ProcessSignIn = () => {
        navigate('/signin');
    }

    const ProcessOauth = () => {
        navigate('/dashboard');
    }

    const UpdatePassword = (event) => {
        setState({
            username: state.username,
            password: event.target.value,
        });
    }

    const UpdateLogin = (event) => {
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
