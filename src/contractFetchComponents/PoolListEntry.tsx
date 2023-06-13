import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import PoolManagerABI from "../PoolManager.json";
import { useContractRead } from "wagmi";
import { useRouter } from "next/navigation";


function PoolListEntry({ address, userAddress }: any) {
    const router = useRouter();
    const chainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID as string);

    const { data: pools, error, isLoading, isSuccess } = useContractRead({
        abi: PoolManagerABI,
        address: address,
        functionName: 'poolMetaData',
        args: [],
        enabled: true,
        chainId: chainId
    })

    const poolsData: any = pools

    if (isLoading && !isSuccess) {
        return (
            <div className="PoolListEntry" style={{ display: "flex", "justifyContent": "space-evenly" }}>
                <span>{address}</span>
                <CircularProgress size={40} />
            </div>);
    }

    return (
        <div className="PoolListEntry" onClick={() => router.push('/pool/' + address)} style={{ display: "flex", "justifyContent": "space-evenly" }} >

            <span>{address.slice(0, 10)}</span>
            <span>{poolsData[0].slice(0, 10)}</span>
            <span>{poolsData[1].slice(0, 10)}</span>
            <span>{poolsData[2].slice(0, 10)}</span>
            <span>{poolsData[3].toString().slice(0, 10)}</span>
            <span>{poolsData[4].toString().slice(0, 10)}</span>
        </div>
    );
}

export default PoolListEntry;
