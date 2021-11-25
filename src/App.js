import { useEffect } from "react"
import './App.css'
import { Main } from "./Components/Main"
import { useMoralis } from "react-moralis"

function App() {
  const { authenticate, isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();
  // const provider  =   detectEthereumProvider();
  // console.log(provider)
  // const provider = new web3.providers.HttpProvider("https://mainnet.infura.io/v3/4eb0d4d9903f4677bd21614122edf7e6") 
  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <>
      {isAuthenticated && isWeb3Enabled ?
        <Main ></Main>
        // <Main provider={provider}></Main>
        :
        <div>
          <button onClick={() => authenticate()}>Authenticate</button>
        </div>
      }
    </>
  );
}

export default App;
