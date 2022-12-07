import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import 'static/Main.scss'

import {
	FaHome,
	FaTableTennis,
	FaCommentDots,
	FaUser,
	FaDoorOpen
	} from 'react-icons/fa'

import { HiVideoCamera } from 'react-icons/hi'

import Home from './Home/Home'
import Play from './Play/Play'
import Spectate from './Play/Spectate'
import Chat from './Chat/Chat'
import Profile from './Profile/Profile'

function Main(props: {component: any}) {
	const navigate = useNavigate();

	const ProcessLogout = () => {
		navigate('/');
	}

	const pages = [
		{ icon: <FaHome/>, ref: 'home', component: <Home/>},
		{ icon: <FaTableTennis/>, ref: 'game', component: <Play/>},
		{ icon: <HiVideoCamera/>, ref: 'spectate', component: <Spectate/>},
		{ icon: <FaCommentDots/>, ref: 'chat', component: <Chat/>},
		{ icon: <FaUser/>, ref: 'profile', component: <Profile/>},
	];

	return (
			<main>
				<div className="links">
				{
					pages.map((page, idx) => 
						<Link to={'/' + page.ref} key={idx}>
							{page.icon}
						</Link>
					)
				}
				<button onClick={ProcessLogout}><FaDoorOpen /></button></div>
				<div className="slides">{props.component}</div>
			</main>
		   )
}

export default Main;

