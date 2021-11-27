import React, { useEffect, useState } from 'react'
import { useMoralisQuery, useMoralis } from 'react-moralis'
import { CampaignABI } from './../contracts/Campaign'
import { Row, Skeleton } from 'antd'
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
    const [update, setUpdate] = useState(false)
    const [openNFTId, setOpenNFTId] = useState(-1)

    const instanciateContract = (address) => {
        let contract = new web3.eth.Contract(CampaignABI, address)
        contract.setProvider(web3.currentProvider)
        contract.options.address = address
        return contract
    }

    const checkNFTs = async (contract, nftId) => {
        const numberOfNFTs = await contract.methods.balanceOf(user.get("ethAddress"), nftId).call()
        return parseInt(numberOfNFTs)
    }

    const getBalance = async (campaign) => {
        const balance = await campaign.methods.getBalance().call()
        return parseFloat(balance) / 10000000000000000000000000
    }

    const getRunning = async (campaign) => {
        return await campaign.methods.isDonationPhase().call()
    }

    const getDonatedAmount = async (campaign) => {
        const balance = await campaign.methods.getDonatedAmount().call()
        return parseFloat(balance) / 10000000000000000000000000
    }

    const getAllDonations = async () => {
        let myDonations = []
        for (let campaign_i in campaigns) {
            let contract = instanciateContract(campaigns[campaign_i].attributes.contractAddress)
            const numberOfTokens = await checkNFTs(
                contract,
                campaigns[campaign_i].attributes.nftId
            )
            const donatedAmount = await getDonatedAmount(contract)
            const isRunning = await getRunning(contract)
            const balance = await getBalance(contract)
            if (numberOfTokens > 0 || browsing)
                myDonations.push({
                    attributes: campaigns[campaign_i].attributes,
                    numberOfTokens,
                    balance,
                    isRunning,
                    donatedAmount
                })
        }
        setDonations(myDonations)
    }

    const getCampains = (running) => {
        return (
            <>
                <h1>{!running && "Not"} Running</h1>
                <Row >
                    {donations.filter((c) => running ? c.isRunning : !c.isRunning).map((c, i) =>
                        <div style={{ margin: '10px' }}>
                            <CampaignCard
                                running={running}
                                data={c}
                                open={openNFTId == c.attributes.nftId}
                                update={(nftId) => {
                                    setUpdate(!update)
                                    setOpenNFTId(nftId)
                                }} />
                        </div>)}
                </Row>
            </>
        )
    }

    const showAllCampains = () => {
        return <> {getCampains(true)}  {getCampains(false)}</>
    }

    useEffect(() => {
        if (campaigns)
            getAllDonations()
    }, [campaigns, browsing, update])

    return (
        <>{donations ?
            showAllCampains()
            :
            <Skeleton />}
        </>
    )
}