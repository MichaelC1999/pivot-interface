'use client'

import { useEffect } from 'react'
import { useContractRead } from 'wagmi'
import ERC20ABI from "../ERC20.json";
import SubgraphManagerABI from "../SubgraphManager.json";

export function TokenBalance({ tokenAddress, addressToCheck, balanceSetter }: any) {
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;

    const { data: balance } = useContractRead({
        abi: ERC20ABI,
        address: tokenAddress,
        functionName: 'balanceOf',
        args: [addressToCheck],
        enabled: true,
        chainId: Number(chainId)
    })

    useEffect(() => {
        if (balance) {
            balanceSetter(Number(balance));
        }
    }, [balance])

    return null
}