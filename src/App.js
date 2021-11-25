import { useEffect } from "react"
import './App.css'
import { Main } from "./Components/Main"
import { useMoralis } from "react-moralis"

function App() {
  const { authenticate, isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();
  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <>
      {isAuthenticated && isWeb3Enabled ?
        <Main ></Main>
        :
        <div>
          <button onClick={() => authenticate()}>Authenticate</button>
        </div>
      }
    </>
  );
}

export default App;
