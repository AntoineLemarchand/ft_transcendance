import 'static/Account/Prompt.scss';
import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

function TwoFactor(props: {socket: Socket}) {
  const [twoFaStatus, setTwoFaStatus] = useState(false);
  const [initComponent, setInitComponent] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [cookies, setCookies, removeCookies] = useCookies(['auth']);
  const navigate = useNavigate();

  const connect2fa = () => {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + '/api/auth/2fa/login', {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          code2fa: currentCode,
        }),
      }).then(response => {
        response.text().then(text => {
          setCookies('auth', JSON.parse(text).access_token,
            {path: {path: "/", sameSite: 'strict'}}
          )
          navigate('/profile');
        });
      })
  }

  const statusHook = (event) => {
    if (!initComponent || !cookie['auth'])
      return;
    if (!event.target.checked) {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + '/api/auth/2fa/deactivate', {
        credentials: "include",
        method: "POST",
      }).then(result => {
        if (result.status == 401) {
          alert('please type your code to deactivate')
        } else {
          setQrCode('');
          setTwoFaStatus(false);
        }
      })
    } else {
      fetch("http://" + process.env.REACT_APP_SERVER_IP + '/api/auth/2fa/activate', {
        credentials: "include",
        method: "POST",
      }).then(response => {
        response.blob().then( (blob: Blob) => {
          const fileReader = new FileReader();
          fileReader.onload = (event) => {
              setQrCode(event.target!.result as string);
          }
          fileReader.readAsDataURL(blob);
        })
      })
      setTwoFaStatus(true);
    }
  }

  useEffect(() => {
      if (!cookies['auth'])
        navigate('/');
      fetch("http://" + process.env.REACT_APP_SERVER_IP + '/api/auth/2fa/status', {
        credentials: "include",
        method: "GET",
      }).then(response => {
        response.text().then(text => setTwoFaStatus(JSON.parse(text).status))
      })
      setInitComponent(true);
  }, [])

  return (
    <div className="Prompt">
      <header>
        <h1>Two factor status: </h1>
        <label className="switch">
          <input
            type="checkbox"
            onChange={statusHook}
            checked={twoFaStatus}/>
          <span className="slider"></span>
        </label>
      </header>
        { twoFaStatus && 
          <div className="Activated">
            <img src={qrCode} alt={twoFaStatus ? 'activated' : ''} />
            <input
              type="text"
              value={currentCode}
              onChange={(event)=>setCurrentCode(event.target.value)}/>
            <button onClick={connect2fa}>Connect</button>
            <button onClick={()=>{
              removeCookies('auth', {path: '/'});
              props.socket.close();
              navigate('/')}
            }>
              Logout</button>
          </div>
        }
    </div>
  )
}

export default TwoFactor;
