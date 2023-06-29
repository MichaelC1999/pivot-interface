'use client'

import { useEffect, useState } from 'react'
import { Address, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import PoolManagerABI from "../PoolManager.json";
import { TokenBalance } from '../fetchComponents/TokenBalance';
import { TokenApprove } from '../fetchComponents/TokenApprove';
import { CalculatePTokenBurn } from '../fetchComponents/CalculatePTokenBurn';

export function Deposited({ userAddress, poolAddress, userBalance, refetchBalance }: any) {

    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;
    const tokenAddress: Address = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as Address; // Replace with the ERC20 token contract address
    const reserveAddr: Address = process.env.NEXT_PUBLIC_RESERVE_CONTRACT_ADDRESS as Address;

    const [getPToken, getPTokenSetter] = useState(false)
    const [PTokenApprovalAmount, PTokenApprovalAmountSetter] = useState(0)

    const [approvalTxLoading, approvalTxLoadingSetter] = useState(false)
    const [showWithdraw, showWithdrawSetter] = useState(false)
    const [withdrawAmount, withdrawAmountSetter] = useState(0)

    const { data: pTokenAddress } = useContractRead({
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

    const {
        isSuccess: isSuccessDeposit,
    } = useWaitForTransaction({ hash: txData?.hash })

    useEffect(() => {
        refetchBalance()
    }, [isSuccessDeposit])

    const userWithdraw = () => {
        PTokenApprovalAmountSetter(0)
        withdraw({
            args: [withdrawAmount],
        })
    }

    const setPTokenAmounts = (amt: number) => {
        // TokenBalance should point to other state thats just for max
        //Should have new number input for user to select how much to withdraw, then makes read call to pool to get ptokenstoburn 
        if (!!amt) {
            const x = Number(amt.toString())
            PTokenApprovalAmountSetter(x)
            getPTokenSetter(false)
        }
    }

    let pTokenElement = null
    if (getPToken == true && PTokenApprovalAmount == 0) {
        pTokenElement = <CalculatePTokenBurn amount={Number(withdrawAmount)} poolAddress={poolAddress} pTokenAmountSetter={(x: number) => setPTokenAmounts(x)} />
    } else if (PTokenApprovalAmount > 0) {
        pTokenElement = <TokenApprove tokenAddress={pTokenAddress} balance={PTokenApprovalAmount} addressToApprove={poolAddress} approvalLoadingSetter={(x: any) => approvalTxLoadingSetter(x)} permitSuccessSetter={() => null} />
    }

    let withdrawSection = <div onClick={() => showWithdrawSetter(true)} style={{ border: "black 1px solid" }}><span>Withdraw</span></div>;
    let withdrawButton = <div onClick={() => userWithdraw()}><span>Withdraw</span></div>
    if (approvalTxLoading) {
        withdrawButton = <div><span>LOADING...</span></div>
    }
    if (showWithdraw) {
        withdrawSection = (
            <div>
                {pTokenElement}
                <span>Withdraw Amount: </span><input type="number" onChange={(x: any) => withdrawAmountSetter(x.target.value * (10 ** 18))} />
                <div onClick={() => getPTokenSetter(true)} style={{ border: "red 2px solid" }}><span>Approve Tokens</span></div>
                {withdrawButton}
                <div onClick={() => showWithdrawSetter(false)} style={{ backgroundColor: "red" }}><span>CLOSE WITHDRAW</span></div>
            </div>
        )
    }

    return (
        <div style={{ border: "lime 2px solid" }}>
            <h4>Balance of {userAddress}: {userBalance}</h4>
            {withdrawSection}
        </div>
    )
}