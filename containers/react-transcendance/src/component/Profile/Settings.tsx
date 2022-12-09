function Settings(props: {isSelected: boolean}) {
	return (
    <div
      className="Settings"
      style={{display: props.isSelected ? "block" : "none"}}>
      <h1>Settings</h1>
      <div className="setting two-factor">
        <p>2FA status</p>
        <input type="checkbox" />
      </div>
      <div className="setting avatar">
        <p>Avatar</p>
        <input type="file" accept="image/*"/>
      </div>
    </div>
  )
}

export default Settings;
