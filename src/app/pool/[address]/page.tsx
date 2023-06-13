'use client'

import React, { useEffect, useState } from "react";
import PoolManagerABI from "../../../PoolManager.json";
import { type Address, useContractRead, useAccount } from 'wagmi'
import { getAddress, hexToString } from "viem";
import { Deposited } from "../../../components/Deposited";
import { MakeDeposit } from "../../../components/MakeDeposit";
import { Header } from "../../../components/Header";



export default function Pool({ params }: any) {
    const { address: userAddress } = useAccount()

    const poolAddress: Address = getAddress(params.address)
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;

    const { data: userBalance, refetch: refetchUserDepos } = useContractRead({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'userToDeposits',
        args: [userAddress],
        enabled: true,
        chainId: Number(chainId)
    })

    const { data: poolMetaData, refetch: refetchPoolMetaData, error } = useContractRead({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'poolMetaData',
        args: [],
        enabled: true,
        chainId: Number(chainId)
    })

    const { data: poolStatisticsData, refetch: refetchPoolStatistics } = useContractRead({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'poolStatistics',
        args: [],
        enabled: true,
        chainId: Number(chainId)
    })

    const refreshReadData = () => {
        console.log('GAZAG')
        refetchUserDepos()
        refetchPoolMetaData()
        refetchPoolStatistics()
    }

    const poolMetaDataResult: any[] = poolMetaData as any
    let metaDataSection = null
    if (poolMetaData) {
        metaDataSection = (
            <React.Fragment >
                <h4>Title: {hexToString(poolMetaDataResult[0])}</h4>
                <h4>Deposit Token: {poolMetaDataResult[2].toString()} - {poolMetaDataResult[1]}</h4>
                <h4>Deposited: {poolMetaDataResult[3].toString()}</h4>
                <h4>Deposited Value in USD: {poolMetaDataResult[4].toString()}</h4>
            </React.Fragment>
        )
    }

    const poolStatisticsDataResult: any[] = poolStatisticsData as any
    let statisticsDataSection = null
    if (poolStatisticsDataResult) {
        statisticsDataSection = (<React.Fragment >
            <h4>Current Depositors: {poolStatisticsDataResult[0].toString()}</h4>
            <h4>Lifetime interest on pool: {poolStatisticsDataResult[1].toString()}</h4>
            <h4>Interest per block: {poolStatisticsDataResult[2].toString()} / {poolStatisticsDataResult[3].toString()}</h4>
        </React.Fragment>)
    }

    let depositedSection = null;
    if (Number(userBalance) > 0) {
        depositedSection = <Deposited userAddress={userAddress} userBalance={userBalance} poolAddress={poolAddress} />
    }

    return (<>
        <Header />
        <div className="Pool" style={{ width: "100%" }}>
            <h3>Pool Page</h3>
            <div style={{ width: "100%", border: "black 2px solid", display: "block", margin: "2px" }}>
                {metaDataSection}
                {statisticsDataSection}
                <MakeDeposit refreshReadData={() => refreshReadData()} userAddress={userAddress} poolAddress={poolAddress} />
                {depositedSection}
            </div>
        </div>
    </>
    );
}
