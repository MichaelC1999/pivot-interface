'use client'

import { useEffect, useState } from 'react'
import { Address, useContractRead, useContractReads, useContractWrite, useWaitForTransaction } from 'wagmi'
import PoolManagerABI from "../PoolManager.json";
import { TokenBalance } from '../fetchComponents/TokenBalance';
import { TokenApprove } from '../fetchComponents/TokenApprove';

export function MakeDeposit({ userAddress, poolAddress, refreshReadData }: any) {

    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;
    // const tokenAddress: Address = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as Address; // Replace with the ERC20 token contract address
    const reserveAddr: Address = process.env.NEXT_PUBLIC_RESERVE_CONTRACT_ADDRESS as Address;

    const [getApproval, getApprovalSetter] = useState(false)
    const [showDeposit, showDepositSetter] = useState(false)
    const [depositAmount, depositAmountSetter] = useState(0)

    const { data } = useContractReads({
        contracts: [
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'currentTargetSubgraphAddress',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: PoolManagerABI,
                address: poolAddress,
                functionName: 'depositTokenAddress',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            }
        ]
    })

    const { write: deposit, data: txData, error: txError } = useContractWrite({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'userDeposit',
        chainId: Number(chainId)
    })

    const {
        isSuccess: isSuccessDeposit,
        isError
    } = useWaitForTransaction({ hash: txData?.hash })

    useEffect(() => {
        refreshReadData()
    }, [isSuccessDeposit])

    const userDeposit = () => {
        console.log(depositAmount)
        deposit({
            args: [depositAmount.toString()],
        })
    }

    const targetAddress = data?.[0]?.result as any
    const tokenAddress = data?.[1]?.result as any

    let approvalFetch = null;
    if (targetAddress && tokenAddress && showDeposit && getApproval) {
        approvalFetch = <TokenApprove tokenAddress={tokenAddress} balance={depositAmount} addressToApprove={targetAddress} approvalLoadingSetter={(x: any) => null} permitSuccessSetter={(x: any) => getApprovalSetter(false)} />
    }

    let depositSection = <div onClick={() => showDepositSetter(true)} style={{ border: "black 1px solid" }}><span>Deposit</span></div>;
    if (showDeposit) {
        depositSection = (
            <div>
                <span>Deposit Amount: </span><input type="number" onChange={(x: any) => depositAmountSetter(x.target.value * (10 ** 18))} />
                <div onClick={() => getApprovalSetter(true)}><span>Approval</span></div>
                <div onClick={() => userDeposit()}><span>Deposit</span></div>
                <div onClick={() => showDepositSetter(false)} style={{ backgroundColor: "red" }}><span>CLOSE</span></div>
            </div>
        )
    }

    return (
        <div style={{ border: "lime 2px solid" }}>
            {approvalFetch}
            {depositSection}
        </div>
    )
}