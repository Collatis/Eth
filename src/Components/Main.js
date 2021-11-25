import React, { useEffect, useState } from 'react'
import Campaign from './../contracts/Campaign.json'
import { CreateCampaignCard } from './CreateCampaignCard'
import TruffleContract from 'truffle-contract'
import { useMoralis, useNewMoralisObject, useMoralisQuery } from 'react-moralis'
import { Button, Input, Form, Layout, Card, message, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
const { Content } = Layout
const { Dragger } = Upload

export const Main = () => {

    const { user, web3 } = useMoralis();
    const { save } = useNewMoralisObject("Campaign")
    const { data: campaigns } = useMoralisQuery(
        "Campaign",
        (q) => q
            .descending("createdAt")
        ,
        [],
        { live: true }
    )
    let [receipientAddress, setReceipient] = useState("0x3886E559cCDd8f9505FfE71179Afe64d19d0374C")
    let [campaignDuration, setCampaignDuration] = useState("11220")
    // Aus irgwendeinem Grund funktioniert das hier einfach nicht 
    // let [campaignsRunning, setCampaignsRunning] = useState(campaigns.filter(checkIfRunning))
    let [userAddress, setUserAddress] = useState(web3.currentProvider.selectedAddress)
    let [showOldCampaigns, setShowOldCampaigns] = useState(true)
    // let [creatorAdress, setCreatorAdress] = useState("0x5E1153b7bAFB12d0d1cF2507d1336aa3DbF6b627")
    let [showContractMask, setContractMask] = useState(false)
    let [contractAddress, setContractAddress] = useState()
    let [campaignGoal, setCampaignGoal] = useState()
    let [donationAmount, setDonationAmount] = useState()
    let [cause, setCause] = useState('The Max Meuer needs a Yacht Foundation (MMNAYF)')
    let [description, setDescription] = useState('So Far Max Meuer does not have a yacht. But he really needs one. So Pleas, give him Money.')

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

    const instanciateContract = () => {
        var contract = new TruffleContract(Campaign)
        contract.setProvider(web3.currentProvider)
        return contract
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
                <CreateCampaignCard />
                {console.log("campaigns", campaigns)}
                {campaigns &&

                    <>
                        <h1>Running</h1>
                        {campaigns.filter(checkIfRunning).map((c, i) => {
                            return (
                                <Card key={i} title={c.attributes.cause} extra={<a href="#">Donate</a>} style={{ width: 300 }}>
                                    <p>{c.attributes.cause}</p>
                                    <p>{c.attributes.duration}</p>
                                    {/* {c.attributes.contractAddress !== undefined &&
                                        getBalance(c.attributes.contractAddress)
                                    } */}
                                    {/* {getBalance(c.attributes.contractAddress)} */}
                                    <div>{c.attributes.receipientAddress}</div>
                                </Card>
                            )

                        })}
                        {showOldCampaigns && <>
                            <h1>Not Running</h1>
                            {campaigns.filter((c) => !checkIfRunning(c)).map((c, i) => {
                                return (
                                    <Card key={i} title={c.attributes.cause} extra={<a href="#">Donate</a>} style={{ width: 300 }}>
                                        <p>{c.attributes.cause}</p>
                                        <p>{c.attributes.duration}</p>
                                        {/* <p>{getContractBalance(c.attributes.contractAddress)}</p> */}
                                        <div>{c.attributes.receipientAddress}</div>
                                    </Card>
                                )

                            })}
                        </>
                        }
                    </>
                }
            </Content>
        </>
    )
}