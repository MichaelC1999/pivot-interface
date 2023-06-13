'use client'

import React, { useEffect, useState } from "react";
import ProtocolReserveABI from "../../ProtocolReserveManager.json";
import PoolListEntry from "../../contractFetchComponents/PoolListEntry";
import { type Address, useContractRead, useAccount } from 'wagmi'
import { useRouter } from "next/navigation";
import { Header } from "../../components/Header";


function Protocol() {
    const router = useRouter()
    const { address: userAddress } = useAccount()

    const reserveAddr: Address = process.env.NEXT_PUBLIC_RESERVE_CONTRACT_ADDRESS as Address;
    const chainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID as string);

    const { data: pools } = useContractRead({
        abi: ProtocolReserveABI,
        address: reserveAddr,
        functionName: 'displayPoolList',
        args: [],
        enabled: true,
        chainId: chainId
    })

    const pivotPoolsList: string[] = []
    if (Array.isArray(pools)) {
        (pools)?.filter(x => {
            pivotPoolsList.push(x)
        })
    }

    const pivotPoolsElements = pivotPoolsList.map(poolAddr => {
        return <PoolListEntry address={poolAddr} userAddress={userAddress} />
    })

    return (<>
        <Header />
        <div className="Protocol" style={{ width: "100%" }}>
            <h3>Protocol Page</h3>
            <div style={{ width: "100%" }}>
                {pivotPoolsElements}
            </div>
        </div>
    </>
    );
}

export default Protocol;
