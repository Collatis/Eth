import React from 'react'
import { CreateCampaignCard } from './CreateCampaignCard'
import { useMoralisQuery } from 'react-moralis'
import { Layout, Row, Space, Button } from 'antd'
import { CampaignCard } from './CampaignCard'
const { Content } = Layout

export const Main = () => {

    const { data: campaigns } = useMoralisQuery(
        "Campaign",
        (q) => q.descending("createdAt")
        ,
        [],
        { live: true }
    )


    const checkIfRunning = (c) => {
        if (c.attributes.campaignDuration === undefined) {
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

    return (
        <Content style={{ padding: '0 100px' }}>
            <div
                style={{
                    width: "100%",
                    padding: "20px 0",
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                <Space>
                    <Button
                        type="primary"
                    >Brows Campaigns</Button>
                    <Button
                        type="primary"
                    >My Donations</Button>
                </Space>
                <CreateCampaignCard />
            </div>
            {campaigns &&
                <>
                    <h1>Running</h1>
                    <Row >
                        {campaigns.filter(checkIfRunning).map((c, i) => <div style={{ margin: '10px' }}><CampaignCard data={c} /></div>)}
                    </Row>


                    <h1>Not Running</h1>
                    <Row >
                        {campaigns.filter((c) => !checkIfRunning(c)).map((c, i) => <div style={{ margin: '10px' }}><CampaignCard data={c} /></div>)}
                    </Row>
                </>
            }
        </Content >
    )
}