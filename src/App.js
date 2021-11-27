import { useEffect } from "react"
import './App.css'
import { Main } from "./Components/Main"
import { useMoralis } from "react-moralis"
import { Typography, Layout, Button } from 'antd';

const { Title, Paragraph } = Typography;

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
        <Layout style={{ margin: "100px 200px", padding: "50px" }}>
          {/* <> */}
          <Title>Welcome to Donation Project</Title>
          <Paragraph>
            Please connect with MeatMask.
            MetaMask is a software cryptocurrency wallet used to interact with the Ethereum blockchain. It allows users to access their Ethereum wallet through a browser extension or mobile app, which can then be used to interact with decentralized applications.
            <a href="https://metamask.io/" />
          </Paragraph>
          <Button style={{ width: "200px", height: "50px" }} onClick={() => authenticate()}>Authenticate</Button>
          {/* </> */}
        </Layout>
      }
    </>
  );
}

export default App;
