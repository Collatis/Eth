import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { MoralisProvider } from 'react-moralis'

// change to env var
const REACT_APP_MORALIS_APP_ID = "RC8zJRpeRV5MdzR4pSbCEpnqBXNUgh7npI6sFJAa"
const REACT_APP_MORALIS_SERVER_URL = "https://dnw6c3v77ahg.usemoralis.com:2053/server"

ReactDOM.render(
  <MoralisProvider
    appId={REACT_APP_MORALIS_APP_ID}
    serverUrl={REACT_APP_MORALIS_SERVER_URL}
  >
    <App />
  </MoralisProvider>,

  document.getElementById('root')
);

