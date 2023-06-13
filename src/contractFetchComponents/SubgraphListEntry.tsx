import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import SubgraphManagerABI from "../SubgraphManager.json";
import { useContractReads } from "wagmi";


function SubgraphListEntry({ address, subgraphSetter, userAddress }: any) {
    const chainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID as string);

    console.log('PLOOG PLOOG PLOGG')
    const subgraphData = { protocolName: "", subgraphQueryURI: "" }
    // upon mount, call function to make read call to contract and set isLoading to true


    const { data, isSuccess, isLoading } = useContractReads({
        contracts: [
            {
                abi: SubgraphManagerABI as any,
                address: address,
                functionName: 'protocolName',
                args: [],
                chainId: chainId
            },
            {
                abi: SubgraphManagerABI as any,
                address: address,
                functionName: 'subgraphQueryURI',
                args: [],
                chainId: chainId
            },
            {
                abi: SubgraphManagerABI as any,
                address: address,
                functionName: 'currentPositionBalance',
                args: ["0x93Bd06006402FfFeD9e7C575D1Cf543d0ad77F6B"],
                chainId: chainId
            },
        ]
    })

    useEffect(() => {
        console.log('LAOOAOA', isLoading)
    }, [isLoading])
    useEffect(() => {
        console.log('ADSDRS', address)
    }, [address])

    const protocolName: string = data?.[0]?.result as any
    const subgraphQueryURI: string = data?.[1]?.result as any
    const posBal: string = data?.[2]?.result as any
    console.log(posBal, 'fjir')
    subgraphData.protocolName = protocolName
    subgraphData.subgraphQueryURI = subgraphQueryURI


    if (isLoading) {
        return (
            <div onClick={() => { return subgraphSetter(address) }} className="SubgraphListEntry" style={{ display: "flex", "justifyContent": "space-evenly" }}>
                <span>{address}</span>
                <CircularProgress size={40} />
            </div>);
    }

    return (
        <div onClick={() => { return subgraphSetter(address) }} className="SubgraphListEntry" style={{ display: "flex", "justifyContent": "space-evenly" }}>
            <span>{subgraphData.protocolName.slice(0, 20)}</span>
            <span> -- {subgraphData.subgraphQueryURI.slice(0, 20)}</span>
            <span> -- {address.slice(0, 20)}</span>
        </div>
    );
}

export default SubgraphListEntry;
