import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Main from './Main'
import Header from './Header'
import Login from './Account/Login'
import SignIn from './Account/SignIn'

import '../static/App.scss'

function App() {
	return (
	<div className="App">
		<Header/>
		<BrowserRouter>
		<Routes>
			<Route path="/" element={ <Login /> }/>
			<Route path="/signin" element={ <SignIn /> }/>
			<Route path="/dashboard" element={ <Main /> }/>
		</Routes>
		</BrowserRouter>
	</div>
	)
}
export default App;
