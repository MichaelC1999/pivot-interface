import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import SubgraphManagerABI from "../SubgraphManager.json";
import { useContractReads } from "wagmi";
import { hexToString } from "viem";


function SubgraphListEntry({ address, subgraphSetter, userAddress }: any) {
    const chainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID as string);

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
                args: [address],
                chainId: chainId
            },
            {
                abi: SubgraphManagerABI as any,
                address: address,
                functionName: 'getUpdatedRevenueData',
                args: ["0x1164D7B5792D025423bFffeC14e9B01c4EEda3bE"],
                chainId: chainId
            },
        ]
    })

    const protocolName: string = data?.[0]?.result as any
    const subgraphQueryURI: string = data?.[1]?.result as any
    const posBal: string = data?.[2]?.result as any
    let poolBalance: any = data?.[3]?.result as any
    subgraphData.protocolName = protocolName as any
    subgraphData.subgraphQueryURI = subgraphQueryURI as any
    if (poolBalance) {
        poolBalance = (poolBalance.toString())
    }

    if (isLoading) {
        return (
            <div onClick={() => { return subgraphSetter(address) }} className="SubgraphListEntry" style={{ display: "flex", "justifyContent": "space-evenly" }}>
                <span>{address}</span>
                <CircularProgress size={40} />
            </div>);
    }
    let line1 = "N/A"
    if (!!(subgraphData?.protocolName as `0x${string}`)) {
        line1 = hexToString(subgraphData?.protocolName as `0x${string}`)
    }
    let line2 = "N/A"
    if (!!(subgraphData?.subgraphQueryURI as `0x${string}`)) {
        line2 = hexToString(subgraphData?.subgraphQueryURI as `0x${string}`)
    }

    return (
        <div onClick={() => { return subgraphSetter(address) }} className="SubgraphListEntry" style={{ display: "flex", "justifyContent": "space-evenly" }}>
            <span>{line1}</span>
            <span> -- {line2}</span>
            <span> -- {address.slice(0, 20)}</span>
        </div>
    );
}

export default SubgraphListEntry;
