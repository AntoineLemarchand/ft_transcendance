import 'static/Account/Prompt.scss';
import { useState } from 'react';

function TwoFactor() {
  const [twoFaStatus, setTwoFaStatus] = useState(false);

  return (
    <div className="Prompt">
      <header>
        <h1>Two factor status: </h1>
        <label className="switch">
          <input
            type="checkbox"
            onChange={(event)=>setTwoFaStatus(event.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </header>
      <img src="" alt={twoFaStatus ? 'activated' : 'deactivated'} />
    </div>
  )
}

export default TwoFactor;
