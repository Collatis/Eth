import React, { useEffect, useState } from 'react'
import { CampaignABI } from './../contracts/Campaign'
import { useMoralis } from 'react-moralis'
import { Card, Input, Button, message, Progress } from 'antd'
const { Meta } = Card;

export const CampaignCard = ({ data }) => {

    const { user, web3 } = useMoralis();
    const [donationAmount, setDonationAmount] = useState("0.01")
    const [submitLoading, setSubmitLoading] = useState(false)
    const [allowPayout, setAllowPayout] = useState(false)
    const [running, setRunning] = useState()
    const [countdown, setCountdown] = useState()
    const [balance, setBalance] = useState(false)


    useEffect(async () => {
        const srunning = (new Date() - data.attributes.createdAt) / 1000
        setRunning(srunning)
        setCountdown(parseFloat(data.attributes.campaignDuration - srunning / 60).toFixed(1))
        try {
            let campaign = instanciateContract()
            campaign.options.address = data.attributes.contractAddress
            let sbalance = await campaign.methods.getBalance().call()
            setBalance(sbalance / 10000000000000000000000000)
            if ((sbalance >= data.attributes.campaignGoal || countdown <= 0) && user.get("ethAddress") == data.attributes.userAddress) {
                setAllowPayout(true)
            }
        } catch (error) {
            setBalance("Couldn't fetch the Balance of this Campaign")
        }

    }, [])

    const instanciateContract = () => {
        let contract = new web3.eth.Contract(CampaignABI, data.attributes.contractAddress)
        contract.setProvider(web3.currentProvider);
        return contract
    }


    const getCountdown = () => {
        const running = (new Date() - data.attributes.createdAt) / 1000
        const countdown = data.attributes.campaignDuration - running
        return parseFloat(countdown / 60).toFixed(1)
    }

    const handleDonation = async () => {
        setSubmitLoading(true)
        try {
            let campaign = instanciateContract()
            campaign.options.address = data.attributes.contractAddress
            await campaign.methods.donate().send({
                from: user.get("ethAddress"),
                value: web3.utils.toWei(donationAmount, 'ether')
            })
            message.info("Thank you for donating!")
        } catch (error) {
            message.error("Somthing went wrong sorry :(")
        }
        setSubmitLoading(false)

    }

    const handlePayout = async () => {
        try {
            let campaign = instanciateContract()
            campaign.options.address = data.attributes.contractAddress
            await campaign.methods.payout().send({ from: user.get('ethAddress') })
            message.info("The Money was succesfully distributed")
        } catch (error) {
            message.error("Somthing went wrong sorry :(")
        }

    }


    return (
        <Card
            hoverable
            style={{ width: 400 }}
            cover={
                <div style={{ height: 550, margin: "auto", overflow: "hidden" }}>
                    <img style={{ width: 400 }} alt="nft" src={data.attributes.imageUrl} />
                </div>}
            actions={[
                <Input.Group compact>
                    <Input style={{ width: 'calc(100% - 100px)' }} value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} />
                    <Button
                        type="primary"
                        onClick={handleDonation}
                        loading={submitLoading}
                    >Donate</Button>
                </Input.Group>
            ]}
        >
            {console.log(balance / 1000000000000000000)}
            <Meta
                title={data.attributes.cause}

                description={<>
                    <p>Countdown: {countdown} Min.</p>
                    <p>Balance: {Math.round(100 * balance) / 100} US Dollars</p>
                    <Progress type="circle" percent={Math.round(balance / data.attributes.campaignGoal * 100)} />
                    {allowPayout ?
                        <>
                            <p>End Campaign and transact Money to the receipients</p>
                            <Button onClick={handlePayout}>End Campaign</Button>
                        </>
                        :
                        <p>This Campaign has the financial Goal of reaching {data.attributes.campaignGoal} US Dollars</p>
                    }
                    <br></br>
                    <br></br>
                    <p>Receipient: {data.attributes.receipientAddress}</p>
                    <p>Contract: {data.attributes.contractAddress}</p>
                </>
                }
            />

        </Card>
    )
}