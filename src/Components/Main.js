import React, { useState } from 'react'
import { CreateCampaignCard } from './CreateCampaignCard'
import { Layout, Space, Button } from 'antd'
import { CampaignBrowser } from './CampaignBrowser'
const { Content } = Layout

export const Main = () => {
    const [browsing, setBrowsing] = useState(true)

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
                        type={browsing && "primary"}
                        onClick={() => setBrowsing(true)}
                    >Brows Campaigns</Button>
                    <Button
                        type={!browsing && "primary"}
                        onClick={() => setBrowsing(false)}
                    >My Donations</Button>
                </Space>
                <CreateCampaignCard />
            </div>
            <CampaignBrowser browsing={browsing} />
        </Content >
    )
}