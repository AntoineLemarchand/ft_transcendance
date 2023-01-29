import * as React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
	const style: React.CSSProperties = {
		color: "#ebdbb2",
		textAlign: "center",
	}
	return (
		<div className="NotFound" style={style}>
			<h1>404</h1>
			<h2>Page not found.</h2>
			<Link to="/home"><button style={{padding: "3rem"}}>Home</button></Link>
		</div>
	)
}

export default NotFound;
