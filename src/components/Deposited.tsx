'use client'

import { useState } from 'react'
import { Address, useContractRead, useContractWrite } from 'wagmi'
import PoolManagerABI from "../PoolManager.json";
import { TokenBalance } from '../fetchComponents/TokenBalance';
import { TokenApprove } from '../fetchComponents/TokenApprove';

export function Deposited({ userAddress, userBalance, poolAddress }: any) {

    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;
    const tokenAddress: Address = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as Address; // Replace with the ERC20 token contract address
    const reserveAddr: Address = process.env.NEXT_PUBLIC_RESERVE_CONTRACT_ADDRESS as Address;

    const [getPToken, getPTokenSetter] = useState(false)
    const [PTokenApprovalAmount, PTokenApprovalAmountSetter] = useState(0)


    const [showWithdraw, showWithdrawSetter] = useState(false)
    const [withdrawAmount, withdrawAmountSetter] = useState(0)

    const { data: pTokenAddress, error, isLoading, isSuccess } = useContractRead({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'pTokenAddress',
        args: [],
        enabled: true,
        chainId: Number(chainId)
    })

    const { write: withdraw, data: txData, error: txError } = useContractWrite({
        abi: PoolManagerABI,
        address: poolAddress,
        functionName: 'userWithdraw',
        chainId: Number(chainId)
    })

    const userWithdraw = () => {
        withdraw({
            args: [withdrawAmount],
        })
    }

    const setPTokenAmounts = (amt: number) => {
        PTokenApprovalAmountSetter(amt)
        getPTokenSetter(false)
    }

    let pTokenElement = null
    if (getPToken == true && PTokenApprovalAmount == 0) {
        pTokenElement = <TokenBalance tokenAddress={pTokenAddress} addressToCheck={userAddress} balanceSetter={(x: number) => setPTokenAmounts(x)} />
    } else if (PTokenApprovalAmount > 0) {
        // make the Ptoken approval
        pTokenElement = <TokenApprove tokenAddress={pTokenAddress} balance={PTokenApprovalAmount} addressToApprove={poolAddress} />
    }

    let withdrawSection = <div onClick={() => showWithdrawSetter(true)} style={{ border: "black 1px solid" }}><span>Withdraw</span></div>;
    if (showWithdraw) {
        withdrawSection = (
            <div>
                {pTokenElement}
                <span>Withdraw Amount: </span><input type="number" onChange={(x: any) => withdrawAmountSetter(x.target.value)} />
                <div onClick={() => getPTokenSetter(true)} style={{ border: "red 2px solid" }}><span>Approve Tokens</span></div>
                <div onClick={() => userWithdraw()}><span>Withdraw</span></div>
                <div onClick={() => showWithdrawSetter(false)} style={{ backgroundColor: "red" }}><span>CLOSE WITHDRAW</span></div>
            </div>
        )
    }

    return (
        <div style={{ border: "lime 2px solid" }}>
            <h4>Balance of {userAddress}: {Number(userBalance)}</h4>
            {withdrawSection}
        </div>
    )
}