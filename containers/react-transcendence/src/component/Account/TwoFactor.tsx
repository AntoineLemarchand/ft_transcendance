import 'static/Account/Prompt.scss';
import { useState, useEffect } from 'react';

function TwoFactor() {
  const [twoFaStatus, setTwoFaStatus] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const ToggleTwoFa = (event) => {
    setTwoFaStatus(event.target.checked);
    if (event.target.checked) {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + '/api/2fa/activate', {
        credentials: "include",
        method: "GET",
      }).then(response => {
        response.blob().then( (blob: Blob) => {
          const fileReader = new FileReader();
          fileReader.onload = (event) => {
              setQrCode(event.target!.result as string);
          }
          fileReader.readAsDataURL(blob);
        })
      })
    } else {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + '/api/2fa/deactivate', {
        credentials: "include",
        method: "GET",
      })
      setQrCode('');
    }
  }

  useEffect(() => {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + '/api/2fa/status', {
        credentials: "include",
        method: "GET",
      }).then(response => {
        response.text().then(text => setTwoFaStatus(JSON.parse(text).status))
      })
  })

  return (
    <div className="Prompt">
      <header>
        <h1>Two factor status: </h1>
        <label className="switch">
          <input
            type="checkbox"
            onChange={ToggleTwoFa}
            checked={twoFaStatus}
          />
          <span className="slider"></span>
        </label>
      </header>
      <img src={qrCode} alt={twoFaStatus ? 'activated' : 'deactivated'} />
    </div>
  )
}

export default TwoFactor;
