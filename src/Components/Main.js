import React, { useEffect, useState } from 'react'
import Campaign from './../contracts/Campaign.json'
import { useMoralis, useNewMoralisObject, useMoralisQuery } from 'react-moralis'
import { Button, Input, Form, Layout, Card, message } from 'antd'
const { Content } = Layout

export const Main = () => {
    const { user } = useMoralis();
    const { save } = useNewMoralisObject("Campaign")
    const { data: campaigns } = useMoralisQuery(
        "Campaign",
        (q) => q,
        [],
        { live: true }
    )

    let [receipientAddress, setReceipient] = useState("0x605CEF716cC3cc9B3705FB971c68C621747635cA")
    let [duration, setDuration] = useState("120")
    let [showContractMask, setContractMask] = useState(false)
    let [contractAddress, setContractAddress] = useState()
    let [donationAmount, setDonationAmount] = useState()
    let [cause, setCause] = useState('The Max Meuer needs a Yacht Foundation (MMNAYF)')

    const handleSubmit = async (e) => {
        // Muss wirklich für jede campaign ein contract deplyed werden oder kann man instanz benutzen?
        // hab ich hier erstmal rausgenommen

        // save contract at moralis
        save({
            creatorAdress: user.get("ethAddress"),
            receipientAddress,
            contractAddress,
            cause,
            duration
        })
    }

    const handleDonation = async (e) => {

    }

    return (
        <>
            <Content style={{ padding: '0 100px' }}>
                {showContractMask ?
                    <Form >
                        <Form.Item label="What is the Cause of This Campaign">
                            {/* Not Part of the Contract Yet */}
                            <Input value={cause} onChange={(e) => setCause(e.target.vlaue)} />
                        </Form.Item>
                        <Form.Item label="Set the Adress of the Receipient">
                            <Input value={receipientAddress} onChange={(e) => setReceipient(e.target.vlaue)} />
                        </Form.Item>
                        <Form.Item label="Set the Duration of the campaign" >
                            <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
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
                {contractAddress &&
                    <Form >
                        <Form.Item>Donate now to the Max Meuer needs a yacht foundation
                            <Input onChange={(e) => setDonationAmount(e.target.value)} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="submit" onClick={(e) => handleDonation(e)}>Donate</Button>
                        </Form.Item>
                    </Form>
                }
                {JSON.stringify(campaigns)}
            </Content>
        </>
    )
}