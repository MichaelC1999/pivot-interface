'use client'

import { useState } from 'react'
import { Address, useContractRead } from 'wagmi'
import { useAccount, useBalance } from 'wagmi'
import PoolManagerABI from "../PoolManager.json";

export function UserBalance({ userAddress, poolAddress }: any) {
  let userAddressToUse = userAddress;
  if (!userAddressToUse) {
    return null

  }

  const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;

  const { data } = useContractRead({
    abi: PoolManagerABI,
    address: poolAddress,
    functionName: 'userToDeposits',
    args: [userAddressToUse],
    enabled: true,
    chainId: Number(chainId)
  })

  return (
    <h4>Balance of {userAddressToUse}: {Number(data)}</h4>
  )
}

