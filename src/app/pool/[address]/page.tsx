'use client'

import React, { useEffect, useState } from "react";
import PoolManagerABI from "../../../PoolManager.json";
import SubgraphManagerABI from "../../../SubgraphManager.json";

import { type Address, useContractRead, useAccount, useContractReads, useContractWrite, useWaitForTransaction, erc20ABI } from 'wagmi'
import { getAddress, hexToString, zeroAddress } from "viem";
import { Deposited } from "../../../components/Deposited";
import { MakeDeposit } from "../../../components/MakeDeposit";
import { Header } from "../../../components/Header";
import { TokenBalance } from "../../../fetchComponents/TokenBalance";
import { SimulatePositionGain } from "../../../fetchComponents/SimulatePositionGain";



export default function Pool({ params }: any) {
    const { address: userAddress } = useAccount()

    const poolAddress: Address = getAddress(params.address)
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;

    const [simulate, simulateSetter] = useState<any>(false)

    const { data, isError, isLoading, isSuccess, refetch } = useContractReads({
        contracts: [
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'deposited',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'currentDepositHoldingAddress',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'userToDeposits',
                args: [userAddress],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'poolMetaData',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'poolStatistics',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'determinationContractAddress',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'pTokenAddress',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: SubgraphManagerABI,
                address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
                functionName: "currentPositionBalance",
                args: ["0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: SubgraphManagerABI,
                address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
                functionName: "depositsByPosition",
                args: ["0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: SubgraphManagerABI,
                address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
                functionName: "simulatedPositionGain",
                args: ["0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: SubgraphManagerABI,
                address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
                functionName: "depositsByPool",
                args: [poolAddress],
                enabled: true,
                chainId: Number(chainId)
            }
        ]
    })

    const { write: setDeterminationContract, data: writeTx } = useContractWrite({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'addDetermination',
        chainId: Number(chainId)
    })

    const { write: pivotDeposit, data: dataPool } = useContractWrite({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'pivotDeposit',
        chainId: Number(chainId)
    })

    const {
        isSuccess: isSuccessDeposit,
    } = useWaitForTransaction({ hash: writeTx?.hash })

    useEffect(() => {
        if (isSuccessDeposit) {
            refetch()
        }
    }, [isSuccessDeposit])


    if (isLoading) {
        return <h2>LOADING</h2>
    }
    console.log(data)
    const deposited = data?.[0]?.result as any

    const currentDepositHoldingAddress = data?.[1]?.result as any

    const userBalance = data?.[2]?.result as any

    const poolMetaData = data?.[3]?.result as any

    const poolStatisticsData = data?.[4]?.result as any

    const determinationContract = data?.[5]?.result as any

    const pTokenAddress = data?.[6]?.result as any

    const currentPosBal = data?.[7]?.result as any

    const poolMetaDataResult: any[] = poolMetaData as any
    console.log("POSBAL", currentPosBal, data)

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
        console.log(poolStatisticsDataResult)
        statisticsDataSection = (<React.Fragment >
            <h4>Current Depositors: {poolStatisticsDataResult[0].toString()}</h4>
            <h4>Lifetime interest on pool: {poolStatisticsDataResult[1].toString()}</h4>
            <h4>Interest per block: {poolStatisticsDataResult[2].toString()} / {poolStatisticsDataResult[3].toString()}</h4>
        </React.Fragment>)
    }


    let actionsSection = null
    if ((!determinationContract && isSuccess) || determinationContract == zeroAddress) {
        actionsSection = <div onClick={() => setDeterminationContract({ args: [("0xE655d159745E695fC96D538d267Fa49A83E8c08F" as any)] })}><span>Set Determination Contract as 0x...</span></div>
    } else if (Number(userBalance) > 0) {
        actionsSection = <Deposited userAddress={userAddress} userBalance={Number(userBalance)} poolAddress={poolAddress} refetchBalance={() => refetch()} />
    }

    let pivotDepositAction = null
    if (Number(deposited) > 0) {
        pivotDepositAction = <div onClick={() => pivotDeposit()}><span>Pivot Deposit</span></div>
    }

    let bal = null
    console.log(pTokenAddress)
    if (pTokenAddress) {
        bal = <TokenBalance tokenAddress={pTokenAddress} addressToCheck={userAddress} balanceSetter={(x: any) => console.log(x)} />
    }

    let sim = <div onClick={() => simulateSetter(true)}><span>SIMULATE 10 TOKEN GAIN</span></div>
    if (simulate) {
        sim = <SimulatePositionGain poolAddress={poolAddress} />
    }

    return (<>
        <Header />
        <div className="Pool" style={{ width: "100%" }}>
            <h3>Pool Page</h3>
            {pivotDepositAction}
            <div style={{ width: "100%", border: "black 2px solid", display: "block", margin: "2px" }}>
                {metaDataSection}
                {statisticsDataSection}
                {actionsSection}
                {bal}
                {sim}
                <MakeDeposit refreshReadData={() => refetch()} userAddress={userAddress} poolAddress={poolAddress} />
            </div>
        </div>
    </>
    );
}
