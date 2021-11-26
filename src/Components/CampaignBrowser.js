import React, { useEffect, useState } from 'react'
import { useMoralisQuery, useMoralis } from 'react-moralis'
import { CampaignABI } from './../contracts/Campaign'
import { Row } from 'antd'
import { CampaignCard } from './CampaignCard'

export const CampaignBrowser = ({ browsing }) => {
    const { user, web3 } = useMoralis()
    const { data: campaigns } = useMoralisQuery(
        "Campaign",
        (q) => q.descending("createdAt")
        ,
        [],
        { live: true }
    )
    const [donations, setDonations] = useState([])

    const instanciateContract = (address) => {
        let contract = new web3.eth.Contract(CampaignABI, address)
        contract.setProvider(web3.currentProvider)
        contract.options.address = address
        return contract
    }

    const checkIfRunning = (c) => {
        var today = new Date()
        var timeContractIsOnline = Math.round((today - c.attributes.createdAt) / 1000)
        if (timeContractIsOnline > c.attributes.campaignDuration)
            return false
        return true
    }

    const checkNFTs = async (contractAddress, nftId) => {
        const numberOfNFTs = await instanciateContract(contractAddress).methods.balanceOf(user.get("ethAddress"), nftId).call()
        return parseInt(numberOfNFTs)
    }

    const getAllDonations = async () => {
        let myDonations = []
        for (let campaign_i in campaigns) {
            const numberOfTokens = await checkNFTs(campaigns[campaign_i].attributes.contractAddress, campaigns[campaign_i].attributes.nftId)
            if (numberOfTokens > 0 || browsing)
                myDonations.push({
                    attributes: campaigns[campaign_i].attributes,
                    numberOfTokens
                })
        }
        setDonations(myDonations)
    }

    const getRunning = (running) => {
        return (
            <>
                <h1>{!running && "Not"} Running</h1>
                <Row >
                    {donations.filter((c) => running ? checkIfRunning(c) : !checkIfRunning(c)).map((c) => <div style={{ margin: '10px' }}>
                        <CampaignCard running data={c} count={c.numberOfTokens} />
                    </div>)}
                </Row>
            </>
        )
    }

    useEffect(() => {
        if (campaigns)
            getAllDonations()
    }, [campaigns, browsing])

    return (
        <>
            {getRunning(true)}
            {getRunning(false)}
        </>
    )
}