'use client'

import { useEffect, useState } from 'react'
import { Address, useAccount, useContractRead, useContractReads, useContractWrite, useSignTypedData, useWaitForTransaction } from 'wagmi'

import PoolManagerABI from "../PoolManager.json";

export function SimulatePositionGain({ poolAddress }: any) {
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;
    const { address: userAddress }: any = useAccount()

    const { write: permit, data: txPermit } = useContractWrite({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'simulateInterestGained',
        chainId: Number(chainId)
    })

    const {
        isSuccess: isSuccessPermit,
    } = useWaitForTransaction({ hash: txPermit?.hash })

    useEffect(() => {
        permit({
            args: [10 * (10 ** 18), 0]
        })
    }, [])


    return null
}