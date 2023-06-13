'use client'

import { useEffect, useState } from 'react'
import { useContractWrite } from 'wagmi'
import ERC20ABI from "../ERC20.json";

export function TokenApprove({ tokenAddress, balance, addressToApprove }: any) {
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;

    const { write } = useContractWrite({
        abi: ERC20ABI,
        address: tokenAddress,
        functionName: 'approve',
        chainId: Number(chainId)
    })

    useEffect(() => {
        write({ args: [addressToApprove, balance > 0 ? balance : 1] });
    }, [])

    return null
}