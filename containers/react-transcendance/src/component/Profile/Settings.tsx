function Settings(props: {isSelected: boolean}) {
	return <p style={{display: props.isSelected ? "block" : "none"}}>Settings</p>
}

export default Settings;
