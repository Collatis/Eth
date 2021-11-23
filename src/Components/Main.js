import React, { useEffect, useState } from 'react'
import Campaign from './../contracts/Campaign.json'
import TruffleContract from 'truffle-contract'
import { useMoralis, useNewMoralisObject, useMoralisQuery } from 'react-moralis'
import { Button, Input, Form, Layout, Card, message } from 'antd'
// const web3 = new Moralis.Web3();
const { Content } = Layout
// var Contract = require('web3-eth-contract');

export const Main = () => {
    // console.log(props);
    // Contract.setProvider(props.provider)
    const { user, web3 } = useMoralis();
    // const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr)
    const { save } = useNewMoralisObject("Campaign")
    const { data: campaigns } = useMoralisQuery(
        "Campaign",
        (q) => q
            .descending("createdAt")
        ,
        [],
        { live: true }
    )
    const checkIfRunning = (c) => {
        if (c.attributes.campaignDuration == undefined) {
            return false
        }
        var today = new Date()
        var timeContractIsOnline = Math.round((today - c.attributes.createdAt) / 1000)
        if (timeContractIsOnline > c.attributes.campaignDuration) {
            return false
        } else {
            return true
        }
    }



    let [receipientAddress, setReceipient] = useState("0x3886E559cCDd8f9505FfE71179Afe64d19d0374C")
    let [campaignDuration, setCampaignDuration] = useState("11220")
    // Aus irgwendeinem Grund funktioniert das hier einfach nicht 
    // let [campaignsRunning, setCampaignsRunning] = useState(campaigns.filter(checkIfRunning))
    let [userAddress, setUserAddress] = useState(web3.currentProvider.selectedAddress)
    let [showOldCampaigns, setShowOldCampaigns] = useState(false)
    // let [creatorAdress, setCreatorAdress] = useState("0x5E1153b7bAFB12d0d1cF2507d1336aa3DbF6b627")
    let [showContractMask, setContractMask] = useState(false)
    let [contractAddress, setContractAddress] = useState()
    let [campaignGoal, setCampaignGoal] = useState()
    let [donationAmount, setDonationAmount] = useState()
    let [cause, setCause] = useState('The Max Meuer needs a Yacht Foundation (MMNAYF)')
    let [description, setDescription] = useState('So Far Max Meuer does not have a yacht. But he really needs one. So Pleas, give him Money.')

    const instanciateContract = () => {
        var contract = new TruffleContract(Campaign)
        contract.setProvider(web3.currentProvider)
        return contract
    }


    const handleSubmit = async (e) => {
        var contract = instanciateContract()
        contract.defaults({ from: userAddress })

        const instance = await contract.new(campaignDuration, receipientAddress, campaignGoal)
        setContractAddress(instance.address)
        console.log(instance.address)
        save({
            userAddress,
            receipientAddress,
            contractAddress: instance.address,
            cause,
            campaignDuration,
            campaignGoal
        })
    }

    const getBalance = async (e) => {
        console.log(e);
        let contract = instanciateContract()
        let contractInstance = await contract.at(e);
        let price = await contractInstance.getLatestPrice()
        console.log(price)
        let balance = await contractInstance.getBalance()
        console.log(balance);
        // return <div>asdfasdf</div>
    }

    const handleDonation = async (e) => {
        // var contract = setupTruffelContract(donorAddress)
        var instance = instanciateContract()
        let campaign = await instance.at('0x6cBD4185Dc929c336FA4d6de6c71A05e4F73c08B');
        campaign.donate({ from: userAddress, value: web3.utils.toWei(donationAmount, 'ether') })

    }



    return (
        <>
            {/* {JSON.stringify(campaigns[0].attributes.cause)} */}
            {/* {filterCampaigns()} */}
            <Content style={{ padding: '0 100px' }}>
                {showContractMask ?
                    <Form >
                        <Form.Item label="What is the Cause of This Campaign">
                            {/* Not Part of the Contract Yet */}
                            <Input value={cause} onChange={(e) => setCause(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Descriptions">
                            {/* Not Part of the Contract Yet */}
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Set the Adress of the Receipient">
                            <Input value={receipientAddress} onChange={(e) => setReceipient(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Set the Fianancial Goal of the Campaign">
                            <Input value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Set the Duration of the campaign" >
                            <Input value={campaignDuration} onChange={(e) => setCampaignDuration(e.target.value)} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="submit" onClick={(e) => handleSubmit(e)}>Submit</Button>
                        </Form.Item>
                    </Form>
                    :
                    <Card >
                        <Button
                            centered={true}
                            type="primary"
                            onClick={() => setContractMask(true)}
                        > Create Campaign</Button>
                    </Card>
                }

                {campaigns &&

                    <>
                        {console.log(campaigns)}
                        {campaigns.filter(checkIfRunning).map((c, i) => {
                            return (
                                <Card key={i} title={c.attributes.cause} extra={<a href="#">Donate</a>} style={{ width: 300 }}>
                                    <p>{c.attributes.cause}</p>
                                    <p>{c.attributes.duration}</p>
                                    {c.attributes.contractAddress !== undefined &&
                                        getBalance(c.attributes.contractAddress)
                                    }
                                    {/* {getBalance(c.attributes.contractAddress)} */}
                                    <div>{c.attributes.receipientAddress}</div>
                                </Card>
                            )

                        })}
                        {showOldCampaigns &&
                            campaigns.filter(!checkIfRunning).map((c, i) => {
                                return (
                                    <Card key={i} title={c.attributes.cause} extra={<a href="#">Donate</a>} style={{ width: 300 }}>
                                        <p>{c.attributes.cause}</p>
                                        <p>{c.attributes.duration}</p>
                                        {/* <p>{getContractBalance(c.attributes.contractAddress)}</p> */}
                                        <div>{c.attributes.receipientAddress}</div>
                                    </Card>
                                )

                            })
                        }
                    </>
                }
                {/* // <Form >
                //     <Form.Item>Donate now to the Max Meuer needs a yacht foundation
                //         <Input onChange={(e) => setDonationAmount(e.target.value)} />
                //     </Form.Item>
                //     <Form.Item>
                //         <Button type="submit" onClick={(e) => handleDonation(e)}>Donate</Button>
                //     </Form.Item>
                // </Form> */}
            </Content>
        </>
    )
}