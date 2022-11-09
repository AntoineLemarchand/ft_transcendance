import * as React from 'react';
import {
	AppBar,
	Toolbar,
	IconButton,
	Button,
	Stack,
	Avatar,
	Menu,
	MenuItem,
	Fade,
} from '@mui/material/';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';

const pages = ['Play', 'Discuss'];
const settings = ['Profile', 'Settings', 'Logout'];

function Nav() {
	const backgroundColor = "#282828";
	const textColor = "#ebdbb2";

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
			<AppBar
				position='static'
				className='Nav'
				sx={{bgcolor: backgroundColor, color: textColor}}>
			<Toolbar>
			<IconButton
				size='large'
				edge='start'
				color='inherit'
				aira-label='logo'
				sx={{flexgrow: 1}}>
				<SportsCricketIcon />
			</IconButton>
			<Stack direction='row' component='div' sx={{flexGrow: 1}}>
			{
				pages.map((page) => 
					<Button color='inherit'>{page}</Button>
				)
			}
			</Stack>
			<Button
				id='profileButton'
				aria-controls={open ? 'profileButton' : undefined}
				aria-haspopup='true'
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				<Avatar>JD</Avatar>
			</Button>
			<Menu
				id='profileMenu'
				MenuListProps={{
					'aria-labelledby': 'profileButton',
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				TransitionComponent={Fade}
				sx={{bgColor: 'red'}}
			>
			{
				settings.map((setting) => 
					<MenuItem color='inherit'>{setting}</MenuItem>
				)
			}
			</Menu>
			</Toolbar>
			</AppBar>
		   )
}

export default Nav;
