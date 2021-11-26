import React, { useEffect, useState } from 'react'
import { CampaignABI } from './../contracts/Campaign'
import { useMoralis } from 'react-moralis'
import {
    Badge,
    Card,
    Input,
    Button,
    message,
    Progress,
    Row,
    Col,
    Modal,
    Layout,
    Typography,
    Descriptions
} from 'antd'
const { Text, Title } = Typography;
const { Content } = Layout
const { Meta } = Card;

export const CampaignCard = ({ data, running, count }) => {

    const { user, web3 } = useMoralis();
    const [donationAmount, setDonationAmount] = useState("0.001")
    const [submitLoading, setSubmitLoading] = useState(false)
    const [endCampaignLoading, setEndCampaignLoading] = useState(false)
    const [cardLoading, setCardLoading] = useState(false)
    const [countdown, setCountdown] = useState()
    const [balance, setBalance] = useState(1)
    const [detailedView, setDetailedView] = useState(false)

    const instanciateContract = (address) => {
        let contract = new web3.eth.Contract(CampaignABI, address)
        contract.setProvider(web3.currentProvider)
        contract.options.address = address
        return contract
    }

    const getCountdown = () => {
        const running = (new Date() - data.attributes.createdAt) / 1000
        const countdown = data.attributes.campaignDuration - running
        setCountdown(parseFloat(countdown / 60).toFixed(1))
    }

    const getBalance = async () => {
        let campaign = instanciateContract(data.attributes.contractAddress)
        let sbalance = await campaign.methods.getBalance().call()
        setBalance(sbalance / 10000000000000000000000000)
    }

    const getAction = (cardIsOpened = false) => {
        if (running && balance < data.attributes.campaignGoal) {
            return [
                <Input.Group compact>
                    <Input
                        style={{ width: cardIsOpened ? "100px" : 'calc(100% - 120px)' }}
                        defaultValue={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                    />
                    <Button
                        type="primary"
                        onClick={handleDonation}
                        loading={submitLoading}
                    >Donate</Button>
                </Input.Group>
            ]

        } else if (user.get("ethAddress") === data.attributes.userAddress) {
            return [
                <Button
                    type="primary"
                    danger
                    loading={endCampaignLoading}
                    onClick={handlePayout}>
                    Payout
                </Button>
            ]
        }
    }

    const handleDonation = async () => {
        setSubmitLoading(true)
        try {
            let campaign = instanciateContract(data.attributes.contractAddress)
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
        setEndCampaignLoading(true)
        try {
            let campaign = instanciateContract(data.attributes.contractAddress)
            await campaign.methods.payout().send({ from: user.get('ethAddress') })
            message.info("The Money was succesfully distributed.")
        } catch (error) {
            message.error("Somthing went wrong sorry :(")
        }
        setEndCampaignLoading(false)
    }

    const cutTextToLength = (text, length) => {
        if (text.length > length) {
            return text.slice(0, length) + "..."
        }
        return text
    }

    const CodeBox = (props) => {
        return (<div
            style={{
                backgroundColor: "black",
                padding: "1px 5px",
                margin: "0 5px",
                borderRadius: "5px"
            }}
        >
            <Text copyable>
                <b
                    style={{
                        color: "white",

                    }}
                >{props.children}
                </b>
            </Text>
        </div>)
    }

    const showCountIfInDonationView = (children) => {
        if (count)
            return (
                <Badge.Ribbon text={count}>
                    {children}
                </Badge.Ribbon>
            )
        return children

    }

    useEffect(() => {
        const syncLoading = async () => {
            setCardLoading(true)
            getCountdown()
            await getBalance()
            setCardLoading(false)
        }
        syncLoading()
    }, [submitLoading, endCampaignLoading])

    return showCountIfInDonationView(
        <>
            <Card
                loading={cardLoading}
                hoverable
                style={{
                    width: 400
                }}
                cover={
                    <div style={{ height: 500, margin: "auto", overflow: "hidden" }}>
                        <img style={{ width: 400 }} alt="nft" src={data.attributes.imageUrl} />
                    </div>}
                actions={getAction()}
                onClick={() => setDetailedView(true)}
            >
                <Meta
                    style={{
                        height: 240
                    }}
                    title={data.attributes.cause}
                    description={<>
                        <Row justify="space-between">
                            <Col>
                                <p>Countdown: {countdown} Min.</p>
                                <p>Balance: {parseFloat(balance).toFixed(2)} USD</p>
                                <p>Goal: {data.attributes.campaignGoal} USD</p>
                            </Col>
                            <Col>
                                <Progress type="circle" percent={Math.round(balance / data.attributes.campaignGoal * 100)} width={90} />
                            </Col>
                        </Row>
                        <br />
                        <p>{cutTextToLength(data.attributes.description, 150)}</p>
                    </>
                    }
                />

            </Card>
            <Modal
                visible={detailedView}
                width={"min(98%, 800px)"}
                onCancel={() => setDetailedView(false)}
                footer={false}
                bodyStyle={{ padding: 0 }}
            >
                <img style={{ width: "100%" }} alt="nft" src={data.attributes.imageUrl} />
                <Content
                    style={{
                        padding: '30px min(5vw, 50px)'
                    }}
                >
                    <div
                        style={{ display: "flex", justifyContent: "space-between" }}
                    >
                        <h1>{data.attributes.cause}</h1>
                        <div
                            style={{ paddingTop: "10px" }}
                        >{getAction(true)}</div></div>
                    <Row
                        justify="space-between"
                    >
                        <Col span={18}>
                            <Descriptions
                                title="Campaign Info"
                                column={2}
                            >
                                <Descriptions.Item label="Countdown"><b>{countdown} Min.</b></Descriptions.Item>
                                <Descriptions.Item label="Balance"><b>{parseFloat(balance).toFixed(2)} USD</b></Descriptions.Item>
                                <Descriptions.Item label="Duration"><b>{parseFloat(data.attributes.campaignDuration / 60).toFixed(1)} Min.</b></Descriptions.Item>
                                <Descriptions.Item label="Goal"><b>{data.attributes.campaignGoal} USD</b></Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={6}>
                            <Descriptions
                                title=" "
                            ><Descriptions.Item>
                                    <Progress
                                        type="circle"
                                        percent={Math.round(balance / data.attributes.campaignGoal * 100)}
                                        width={"100px"}
                                    />
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                    <div
                        style={{ fontSize: "120%", padding: "5px 0 60px" }}
                    >
                        <Title level={4}>Campaign Description</Title>
                        {data.attributes.description}
                    </div>
                    <Descriptions
                        title="Campaign Details"
                        column={1}
                    >
                        <Row>
                            <Col span={6}>
                                Creator Address:
                            </Col>
                            <Col>
                                <CodeBox>{data.attributes.userAddress}</CodeBox>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                Receipient Address:
                            </Col>
                            <Col>
                                <CodeBox>{data.attributes.receipientAddress}</CodeBox>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                Contract Address:
                            </Col>
                            <Col>
                                <CodeBox>{data.attributes.contractAddress}</CodeBox>
                            </Col>
                        </Row>
                    </Descriptions>
                </Content>
            </Modal >
        </>
    )
}