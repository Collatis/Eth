import React from 'react'
import Web3 from 'web3'
import { Button, Space, Layout, message } from 'antd'
import Moralis from 'moralis'
const { Content } = Layout
// import contract from 'truffle-contract';
var web3 = new Web3();
const provider = new web3.providers.HttpProvider("http://localhost:7545")

// Moralis
const moralisServerUrl = "https://dnw6c3v77ahg.usemoralis.com:2053/server"
const moralisAppId = "RC8zJRpeRV5MdzR4pSbCEpnqBXNUgh7npI6sFJAa"
Moralis.start({ serverUrl: moralisServerUrl, appId: moralisAppId })

export const Login = () => {


    const handleLogin = async () => {
        let user = Moralis.User.current()
        if (!user) {
            user = await Moralis.authenticate({ signingMessage: "Login at Moralis" })
            message.success('You are now logged in.')
            console.log(user)
            console.log(user.get("ethAddress"))
        } else {
            message.warning('You are logged in.')
        }
    }

    const handleLogout = async () => {
        let user = Moralis.User.current()
        if (!user) {
            message.warning('You are logged out.')
        } else {
            await Moralis.User.logOut()
            message.success('You are logged out. See you soon :)')
        }
    }


    return (
        <Content style={{ padding: '100px 100px' }}>
            <Space>
                <Button type="submit" onClick={handleLogin}>Login</Button>

                <Button type="submit" onClick={handleLogout}>Logout</Button>
            </Space>
        </Content>
    )
}


// Julians dümmster weg den wallet key zu speichern aber egal
// fortune theory penalty broken glow shrug alien oblige shallow media put maple