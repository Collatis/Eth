import React, { useState } from 'react'
import axios from 'axios'
import Campaign from './../contracts/Campaign.json'
import TruffleContract from 'truffle-contract'
import { useMoralis, useNewMoralisObject, useMoralisFile } from 'react-moralis'
import { Button, Input, Form, Layout, Card, message, Upload } from 'antd'
import uuid from "uuid"
import { InboxOutlined, PlusOutlined } from '@ant-design/icons'
const { Dragger } = Upload

export const CreateCampaignCard = () => {

    const { Moralis, user, web3 } = useMoralis();
    const { save: saveCampaign } = useNewMoralisObject("Campaign")
    const { save: saveNFT_Metadata } = useNewMoralisObject("NFT_Metadata")

    const {
        error,
        isUploading,
        moralisFile,
        saveFile,
    } = useMoralisFile()

    let [userAddress, _] = useState(user.get('ethAddress'))
    let [showContractMask, setContractMask] = useState(false)
    let [cause, setCause] = useState('The Max Meuer needs a Yacht Foundation (MMNAYF)')
    let [description, setDescription] = useState('So Far Max Meuer does not have a yacht. But he really needs one. So Pleas, give him Money.')
    let [receipientAddress, setReceipient] = useState("0x3886E559cCDd8f9505FfE71179Afe64d19d0374C")
    let [campaignGoal, setCampaignGoal] = useState("2")
    let [campaignDuration, setCampaignDuration] = useState("11220")
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
        var contract = new TruffleContract(Campaign)
        contract.setProvider(web3.currentProvider)
        return contract
    }

    const handleSubmit = async (e) => {
        let paddedHex = getId(64)

        // upload the png
        const moralisFile = new Moralis.File(`${paddedHex}.png`,
            NFTFiles[0].originFileObj, "image/png")
        await moralisFile.saveIPFS()
        console.log("moralisFile", moralisFile)
        let image_url = moralisFile._ipfs
        console.log("image_url", image_url)
        // console.log(image_CID)

        //upload metadata
        let nftMetadata = {
            name: cause,
            description: description,
            image: image_url,
            nftId: paddedHex
        }
        saveNFT_Metadata(nftMetadata)

        // return metadata by useing GET: https://dnw6c3v77ahg.usemoralis.com:2053/server/functions/getNFT?_ApplicationId=RC8zJRpeRV5MdzR4pSbCEpnqBXNUgh7npI6sFJAa&id=6837914930984095715274442178749360054362109603603214733682723680


        var contract = instanciateContract()
        contract.defaults({ from: userAddress })

        const instance = await contract.new(campaignDuration, receipientAddress, campaignGoal, paddedHex)
        console.log(instance.address)
        saveCampaign({
            userAddress,
            receipientAddress,
            contractAddress: instance.address,
            cause,
            campaignDuration,
            campaignGoal,
            nftId: paddedHex,
            image: image_url,
        })
    }

    return (
        <>
            {console.log("filelist", NFTFiles)}
            {showContractMask ?
                <Card >
                    <Form >
                        <Form.Item label="What is the Cause of This Campaign">
                            {/* Not Part of the Contract Yet */}
                            <Input value={cause} onChange={(e) => setCause(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Descriptions">
                            {/* Not Part of the Contract Yet */}
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Set the Adress of the Receipient">
                            <Input value={receipientAddress} onChange={(e) => setReceipient(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Set the Fianancial Goal of the Campaign">
                            <Input value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Set the Duration of the campaign" >
                            <Input value={campaignDuration} onChange={(e) => setCampaignDuration(e.target.value)} />
                        </Form.Item>
                        <Form.Item label="Upload png for your NFT" >
                            <Upload
                                fileList={NFTFiles}
                                onChange={({ fileList }) => setNFTFiles(fileList)}
                                listType="picture-card"
                                beforeUpload
                                accept={[".png"]}
                            >
                                {NFTFiles.length < 1 &&
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>}
                            </Upload>
                        </Form.Item>
                        <Form.Item>
                            <Button type="submit" onClick={(e) => handleSubmit(e)}>Submit</Button>
                        </Form.Item>
                    </Form>
                </Card>
                :
                <Card >
                    <Button
                        centered={true}
                        type="primary"
                        onClick={() => setContractMask(true)}
                    > Create Campaign</Button>
                </Card>
            }
        </>
    )
}