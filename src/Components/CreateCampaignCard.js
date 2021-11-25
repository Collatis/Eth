import React, { useState } from 'react'
import { CampaignABI, CampaignBytes } from './../contracts/Campaign'
import { useMoralis, useNewMoralisObject } from 'react-moralis'
import { Button, Input, Form, Card, Upload, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export const CreateCampaignCard = () => {
    const [form] = Form.useForm();
    const { Moralis, user, web3 } = useMoralis();
    const { save: saveCampaign } = useNewMoralisObject("Campaign")
    let [showContractMask, setContractMask] = useState(false)
    let [submitLoading, setSubmitLoading] = useState(false)
    let [NFTFiles, setNFTFiles] = useState([])

    const getId = (length) => {
        let res = ''
        var numbers = '0123456789';
        var numbersLength = numbers.length;
        for (let i = 0; i < length; i++) {
            res += numbers.charAt(Math.floor(Math.random() *
                numbersLength));
        }
        return res;
    }

    const instanciateContract = () => {
        let contract = new web3.eth.Contract(CampaignABI)
        contract.setProvider(web3.currentProvider);
        return contract
    }

    const handleSubmit = async ({ cause, description, duration, goal, receipient }) => {
        setSubmitLoading(true)
        try {
            let paddedHex = getId(64)

            // upload the png
            const moralisFile = new Moralis.File(`${paddedHex}.png`,
                NFTFiles[0].originFileObj, "image/png")
            await moralisFile.saveIPFS()
            let image_url = moralisFile._ipfs

            // upload metadata
            const metadata = {
                name: cause,
                description: description,
                image: image_url
            }
            const metaDataFile = new Moralis.File(
                `${paddedHex}.json`,
                { base64: btoa(JSON.stringify(metadata)) })
            await metaDataFile.saveIPFS()
            let meta_url = metaDataFile._ipfs

            // deploy contract
            var contract = instanciateContract()
            web3.eth.defaultAccount = user.get("ethAddress")
            const instance = await contract.deploy({
                data: CampaignBytes,
                arguments: [duration, receipient, goal, paddedHex, meta_url]
            }).send({
                from: user.get("ethAddress"),
            })


            saveCampaign({
                userAddress: user.get('ethAddress'),
                receipientAddress: receipient,
                contractAddress: instance._address,
                cause,
                campaignDuration: duration,
                campaignGoal: goal,
                nftId: paddedHex,
                metadataUrl: meta_url,
                imageUrl: image_url
            })
        } catch (error) {
            message.error("Somthing went wrong sorry :(")
        }

        setSubmitLoading(false)
        setContractMask(false)
    }

    return (
        <>
            {showContractMask ?
                <Card >
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: true }}
                        onFinish={handleSubmit}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="What is the Cause of This Campaign"
                            name="cause"
                            rules={[{ required: true, message: 'Please input the cause of the Campaign!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Descriptions"
                            name="description"
                            rules={[{ required: true, message: 'Please input your description!' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            rules={[{ required: true, message: 'Please input the receipient!' }]}
                            label="Set the Adress of the Receipient"
                            name="receipient">
                            <Input />
                        </Form.Item>
                        <Form.Item
                            rules={[{ required: true, message: 'Please input your goal!' }]}
                            label="Set the Fianancial Goal of the Campaign"
                            name="goal">
                            <Input />
                        </Form.Item>
                        <Form.Item
                            rules={[{ required: true, message: 'Please input the duration!' }]}
                            label="Set the Duration of the campaign"
                            name="duration" >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            rules={[{ required: true, message: 'Please input your png!' }]}
                            label="Upload png for your NFT"
                            name="png">
                            <Upload
                                listType="picture-card"
                                onChange={(uploader) => setNFTFiles(uploader.fileList)}
                                beforeUpload
                                accept={[".png", ".gif"]}
                            >
                                {NFTFiles.length < 1 && <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>}
                            </Upload>
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" loading={submitLoading}>Submit </Button>
                        </Form.Item>
                    </Form>
                </Card>
                :
                <Card >
                    <Button
                        centered={true}
                        type="primary"
                        onClick={() => setContractMask(true)}
                    > Create Campaign </Button>
                </Card>
            }
        </>
    )
}