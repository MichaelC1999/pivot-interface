'use client'

import { useEffect, useState } from 'react'
import { useContractRead, useContractWrite } from 'wagmi'
import PoolManagerABI from "../PoolManager.json";
import SubgraphManagerABI from "../SubgraphManager.json";


export function CalculatePTokenBurn({ amount, poolAddress, pTokenAmountSetter }: any) {

    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;
    const { data: tokensToBurn, error } = useContractRead({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'calculatePTokenBurn',
        args: [amount],
        enabled: true,
        chainId: Number(chainId)
    })

    const { data: revd, error: errorzin } = useContractRead({
        abi: SubgraphManagerABI,
        address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
        functionName: 'getUpdatedRevenueData',
        args: [poolAddress],
        enabled: true,
        chainId: Number(chainId)
    })

    useEffect(() => {
        console.log(tokensToBurn, "<<<<<< PTOKENS", revd, errorzin, amount)
        pTokenAmountSetter(tokensToBurn)
    }, [tokensToBurn])

    useEffect(() => {
        console.log(error, 'err')
    }, [error])

    return null
}