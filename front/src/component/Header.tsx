import { Link } from 'react-router-dom';

import '../static/Header.scss'

function Header() {
  return (
  <header className="Header">
	<Link to="/">
		<h1>Ft_transcendence</h1>
		<h2>A 42School project</h2>
	</Link>
  </header>
  );
}

export default Header;
