import React, { useState } from 'react'
import TruffleContract from 'truffle-contract'
import Campaign from './../contracts/Campaign.json'
import Web3 from 'web3'
import {Button, Input, Form, Layout, Card} from 'antd'
const {Content} = Layout
// import contract from 'truffle-contract';
var web3 = new Web3();
const provider = new web3.providers.HttpProvider("http://localhost:7545") 

export const Main = () => {

    let [showContractMask, setContractMask] = useState(false)
    let [receipientAddress, setReceipient] = useState("0x605CEF716cC3cc9B3705FB971c68C621747635cA")
    let [creatorAdress, setCreatorAdress] = useState("0x91f69aFFb0cC4465AD63154Bf9dAd922B2389376")
    let [donorAddress, setDonorAddress] = useState("0x32f17d2caAe07E782e947E089172DCA0911dccE3")
    let [duration, setDuration] = useState()
    let [showCampaigns, setShowCampaigns] = useState(false)
    let [contractAddress, setContractAddress] = useState()
    let [donationAmount, setDonationAmount] = useState()
    let [cause, setCause] = useState('The Max Meuer needs a Yacht Foundation (MMNAYF)')

    const setupTruffelContract = (fromAdress) =>{
        var contract = TruffleContract(Campaign)
        contract.defaults({from:fromAdress})
        contract.setProvider(provider)
        return contract
    }
    
    const handleSubmit = async (e) =>{
        e.preventDefault()
        var contract = setupTruffelContract(creatorAdress)
        // needs to be the Adress of the User Creating the Contract, Has to be defined !!  
        const instance = await contract.new( 1234, receipientAddress)
        setContractAddress(instance.address)
    }

    const handleDonation = async (e) =>{
        e.preventDefault()
        var contract = setupTruffelContract(donorAddress)
        
        let instance = await contract.at(contractAddress);
        console.log(donationAmount);
        instance.donate({value: web3.utils.toWei(donationAmount, 'ether')})

    }

    return (
        <>
            <Content style={{ padding: '0 100px' }}>
                {showContractMask ?
                    <Form >
                        <Form.Item label="What is the Cause of This Campaign">
                            {/* Not Part of the Contract Yet */}
                            <Input value={cause} onChange={(e) => setCause(e.target.vlaue)}/>
                        </Form.Item>
                        <Form.Item label="Set the Adress of the Receipient">
                            <Input value={receipientAddress} onChange={(e) => setReceipient(e.target.vlaue)}/>
                        </Form.Item>
                        <Form.Item label="Set the Duration of the campaign" >
                            <Input onChange={(e) => setDuration(e.target.value)}/> 
                        </Form.Item>
                        <Form.Item>
                            <Button type="submit" value="Submit" onClick={(e) => handleSubmit(e)}>Submit</Button>
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
                {contractAddress && 
                    <Form onSubmit={(e) => handleDonation(e)}>
                        <Form.Item>Donate now to the Max Meuer needs a yacht foundation 
                            <Input onChange={(e) => setDonationAmount(e.target.value)}/>
                            <Button  type="submit" value="Submit" />
                        </Form.Item>
                    </Form>
                }
                <Card>
                <Button
                    type="primary"
                    onClick={() => setShowCampaigns(true)}
                > 
                    See Available Campaigns
                </Button>
                </Card>
                    {showCampaigns && 
                    <div>HUUH</div>
                    }
            </Content>
        </>
    )
}