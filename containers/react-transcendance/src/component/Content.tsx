import * as React from 'react';

import { FaHome, FaTableTennis, FaCommentDots, FaUser } from 'react-icons/fa'

import '../static/Content.scss'

import Home from './Home'
import Play from './Play'
import Chat from './Chat'
import Profile from './Profile'

const pages = [
	{ icon: <FaHome/>, ref: 'Home', component: <Home/>},
	{ icon: <FaTableTennis/>, ref: 'Play', component: <Play/>},
	{ icon: <FaCommentDots/>, ref: 'Discuss', component: <Chat/>},
	{ icon: <FaUser/>, ref: 'Profile', component: <Profile/>}
];


function Content() {
	return (
			<div className="Content">
				<div className="links">
				{
					pages.map((page, idx) => 
						<a href={'#' + page.ref} key={idx}>
							{page.icon}
						</a>
					)
				}
				</div>
				<div className="slides">
				{
					pages.map((page, idx) => 
					 <div id={page.ref} className="component-wrapper" key={idx}>
						{page.component}
					 </div>
					)
				}
				</div>
			</div>
		   )
}

export default Content;
