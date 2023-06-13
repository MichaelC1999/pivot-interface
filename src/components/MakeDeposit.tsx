'use client'

import { useEffect, useState } from 'react'
import { Address, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
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

    const { write: deposit, data: txData, error: txError } = useContractWrite({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'userDeposit',
        chainId: Number(chainId)
    })

    const {
        isSuccess: isSuccessDeposit,
    } = useWaitForTransaction({ hash: txData?.hash })


    const userDeposit = () => {
        deposit({
            args: [depositAmount],
        })
    }

    useEffect(() => {
        refreshReadData()
    }, [isSuccessDeposit])


    // const { data: targetAddress } = useContractRead({
    //     abi: PoolManagerABI,
    //     address: poolAddress,
    //     functionName: 'currentTargetSubgraphAddress',
    //     args: [],
    //     enabled: true,
    //     chainId: Number(chainId)
    // })
    const targetAddress = "0x3721EE6eb6423494A1D64e3a5A82266De79b3EF9"

    const { data: tokenAddress } = useContractRead({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'depositTokenAddress',
        args: [],
        enabled: true,
        chainId: Number(chainId)
    })

    let approvalFetch = null;
    if (targetAddress && tokenAddress && showDeposit && getApproval) {
        approvalFetch = <TokenApprove tokenAddress={tokenAddress} balance={depositAmount} addressToApprove={targetAddress} />
    }

    let depositSection = <div onClick={() => showDepositSetter(true)} style={{ border: "black 1px solid" }}><span>Deposit</span></div>;
    if (showDeposit) {
        depositSection = (
            <div>
                <span>Deposit Amount: </span><input type="number" onChange={(x: any) => depositAmountSetter(x.target.value)} />
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