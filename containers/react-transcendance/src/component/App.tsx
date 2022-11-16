import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Main from './Main'
import Login from './Login'

function App() {
	//const [token, setToken] = useState();
	return (
			<div className="App">
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Login />}/>
						<Route path="/dashboard" element={<Main />}/>
					</Routes>
				</BrowserRouter>
			</div>
			)
}

export default App;

