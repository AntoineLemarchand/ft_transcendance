import 'static/Profile/Settings.scss'

function Settings(props: {isSelected: boolean}) {
	return (
    <div
      className="Settings"
      style={{display: props.isSelected ? "flex" : "none"}}>
      <h1>Settings</h1>
      <div className="SettingList">
        <div className="setting two-factor">
          <p>2FA status</p>
          <p>TO BE DETERMINED</p>
        </div>
      </div>
    </div>
  )
}

export default Settings;
