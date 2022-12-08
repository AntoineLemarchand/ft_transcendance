function Friends(props: {isSelected: boolean}) {
	return <p style={{display: props.isSelected ? "block" : "none"}}>friends</p>
}

export default Friends;
