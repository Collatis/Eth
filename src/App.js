import { useEffect } from "react"
import './App.css'
import { Main } from "./Components/Main"
import { useMoralis } from "react-moralis"
import { Typography, Divider, Layout, Button } from 'antd';

const { Title, Paragraph, Text, Link } = Typography;

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
          <Title>Welcome to "InsertCool Name Here"</Title>
          <Paragraph>
            This project aims to to do good in the world while also giving you the opportunity to participate in the scam that are NFTs.
          </Paragraph>
          <Button style={{ width: "200px", height: "50px" }} onClick={() => authenticate()}>Authenticate</Button>
          {/* </> */}
        </Layout>
      }
    </>
  );
}

export default App;
