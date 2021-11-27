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
    Descriptions,
    Icon
} from 'antd'
const { Text, Title } = Typography;
const { Content } = Layout
const { Meta } = Card;

export const CampaignCard = ({ data, running, update, open, browsing }) => {

    const { user, web3 } = useMoralis();
    const [donationAmount, setDonationAmount] = useState("0.001")
    const [submitLoading, setSubmitLoading] = useState(false)
    const [endCampaignLoading, setEndCampaignLoading] = useState(false)
    const [cardLoading, setCardLoading] = useState(false)
    const [countdown, setCountdown] = useState()
    const [countdownType, setCountdownType] = useState()
    const [detailedView, setDetailedView] = useState(open)

    const instanciateContract = (address) => {
        let contract = new web3.eth.Contract(CampaignABI, address)
        contract.setProvider(web3.currentProvider)
        contract.options.address = address
        return contract
    }

    const getCountdown = () => {
        const running = (new Date() - data.attributes.createdAt) / 1000
        let scountdown = data.attributes.campaignDuration - running
        let type
        if (scountdown > 86400) {
            scountdown = (scountdown / 86400).toFixed()
            type = "Days"
        } else if (scountdown > 3600) {
            scountdown = (scountdown / 3600).toFixed()
            type = "Hours"
        } else {
            scountdown = parseFloat(scountdown / 60).toFixed()
            type = "Minutes"
        }
        setCountdown(scountdown)
        setCountdownType(type)
    }

    const getAction = (cardIsOpened = false) => {
        if (running) {
            return [
                <Input.Group compact>
                    <div
                        style={{
                            maxWidth: "208px",
                            margin: "auto",
                            position: "relative",
                            display: "inline-block"
                        }}
                    >
                        <Input
                            style={{ width: cardIsOpened ? "100px" : 'calc(100% - 120px)' }}
                            defaultValue={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                        />
                        <span
                            style={{
                                paddingTop: "5px",
                                position: "absolute",
                                top: "0",
                                right: "5px",
                                zIndex: "9999",
                                color: "grey"
                            }}
                        >
                            Eth
                        </span>
                    </div>
                    <Button
                        type="primary"
                        onClick={handleDonation}
                        loading={submitLoading}
                    >Donate</Button>
                </Input.Group>
            ]

        } else if (user.get("ethAddress") === data.attributes.userAddress && parseFloat(data.balance) > 0) {
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
            console.log(error)
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
            <b
            >
                <Text
                    style={{
                        color: "white",

                    }} copyable>{props.children}
                </Text>
            </b>
        </div>)
    }

    const showBadges = (children) => {
        let res = children
        if (user.get("ethAddress") === data.attributes.userAddress && parseFloat(data.balance) > 0 && !running)
            res = <Badge.Ribbon text={"Payout"} placement={"start"} color={"red"} children={res} />
        if (data.numberOfTokens)
            res = <Badge.Ribbon text={data.numberOfTokens} children={res} />
        return res

    }

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    useEffect(() => {
        const syncLoading = async () => {
            setCardLoading(true)
            update(data.attributes.nftId)
            getCountdown()
            setCardLoading(false)
        }
    }, [submitLoading, endCampaignLoading])

    return showBadges(
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
                                <p>Countdown: {countdown} {countdownType}</p>
                                <p>Donated: {numberWithCommas(data.donatedAmount.toFixed(2))} USD</p>
                                <p>Goal: {numberWithCommas(data.attributes.campaignGoal)} USD</p>
                            </Col>
                            <Col>
                                <Progress type="circle" percent={Math.round(data.donatedAmount / data.attributes.campaignGoal * 100)} width={90} />
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
                        <h1>{data.attributes.cause} {data.donatedAmount > 0 &&
                            <img
                                style={{
                                    width: "25px",
                                    height: "25px",
                                    cursor: "pointer",
                                }}
                                onClick={() => window.open(`https://testnets.opensea.io/assets/${data.attributes.contractAddress}/${data.attributes.nftId}`)}
                                alt="opensea"
                                src={"https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"}
                            />}</h1>
                        <div
                            style={{ paddingTop: "10px" }}
                        >{getAction(true)}
                        </div>
                    </div>
                    <Row
                        justify="space-between"
                    >
                        <Col span={18}>
                            <Descriptions
                                title="Campaign Info"
                                column={2}
                            >
                                <Descriptions.Item label="Countdown"><b>{countdown} {countdownType}</b></Descriptions.Item>
                                <Descriptions.Item label="Donated"><b>{numberWithCommas(data.donatedAmount.toFixed(2))} USD</b></Descriptions.Item>
                                <Descriptions.Item label="Creation Date"><b>{data.attributes.createdAt.toLocaleString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' })}</b></Descriptions.Item>
                                <Descriptions.Item label="Goal"><b>{numberWithCommas(data.attributes.campaignGoal)} USD</b></Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={6}>
                            <Descriptions
                                title=" "
                            ><Descriptions.Item>
                                    <Progress
                                        type="circle"
                                        percent={Math.round(data.donatedAmount / data.attributes.campaignGoal * 100)}
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
                        <Row>
                            <Col span={6}>
                                Current Balance:
                            </Col>
                            <Col>
                                {numberWithCommas(data.balance.toFixed(2))} USD
                            </Col>
                        </Row>
                    </Descriptions>
                </Content>
            </Modal >
        </>
    )
}