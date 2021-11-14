import React, { useState } from 'react'
import TruffleContract from 'truffle-contract'
import Campaign from './../contracts/Campaign.json'
import Web3 from 'web3'
import {Button, Input, Form, Layout} from 'antd'
const {Content} = Layout
// import contract from 'truffle-contract';
var web3 =  Moralis.enableWeb3();
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



    const doSomeThing = () => {
        const msg = "Done :)"
        addMessage(msg)
    }


    const addMessage = (msg) => {
        setReturnMessages([...returnMessages, msg])
    }

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

    const buttonStyle = {
        backgroundColor: 'grey',
        width: '150px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        cursor: 'pointer',
        marginTop: '20px'
    }

    const buttonContainerStyle = {
        position: 'absolute',
        top: '10vh',
        left: 'calc(50vw - 75px)'
    }

    return (
        <>
            <Layout
            >
                <Content>
                    <Button
                        type="primary"
                        onClick={() => setContractMask(true)}
                    > Create Campaign</Button>
                    {showContractMask &&
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <label>What is the Cause of This Campaign
                                <br/>
                                {/* Not Part of the Contract Yet */}
                                <Input value={cause} onChange={(e) => setCause(e.target.vlaue)}/>
                            </label>
                            <br/>
                            <label>Set the Adress of the Receipient
                                <br/>
                                <Input value={receipientAddress} onChange={(e) => setReceipient(e.target.vlaue)}/>
                            </label>
                            <br/>
                            <label>Set the Duration of the campaign
                            <br/>
                                <Input onChange={(e) => setDuration(e.target.value)}/> 
                            </label>
                            <Input type="submit" value="Submit" />
                        </form>

                    }
                    {contractAddress && 
                        <form onSubmit={(e) => handleDonation(e)}>
                        <label>Donate now to the Max Meuer needs a yacht foundation 
                            <Input onChange={(e) => setDonationAmount(e.target.value)}/>
                        </label>
                        <Input type="submit" value="Submit" />
                    </form>
                    }
                    <Button
                        type="primary"
                        onClick={() => setShowCampaigns(true)}
                    > 
                        See Available Campaigns
                    </Button>
                        {showCampaigns && 
                        <iv>HUUHU</div>
                        }
                </Content>
            </Layout>
        </>
    )
}