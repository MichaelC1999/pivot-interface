'use client'

import React, { useEffect, useState } from "react";
import ProtocolReserveABI from "../../ProtocolReserveManager.json";
import TestTokenABI from "../../TestTokenABI.json";

import SubgraphListEntry from "../../contractFetchComponents/SubgraphListEntry";
import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount, useConnect } from 'wagmi'
import { stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { Header } from "../../components/Header";
import { TokenApprove } from "../../fetchComponents/TokenApprove";
import { useNetwork, useBalance } from 'wagmi'


function DeployPool() {
    const router = useRouter()
    const { chain, chains } = useNetwork()
    const { connector: activeConnector, isConnected, address: userAddress } = useAccount()
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

    const { data: balance } = useBalance({
        address: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    })
    console.log(activeConnector, isConnected, balance, error)

    const tokenAddress: Address = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as Address; // Replace with the ERC20 token contract address
    const reserveAddr: Address = process.env.NEXT_PUBLIC_RESERVE_CONTRACT_ADDRESS as Address;
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;

    const [isLoadingPoolDeployment, isLoadingPoolDeploymentSetter] = useState(false);
    const [spendApproved, spendApprovedSetter] = useState(false);

    const [tokenOnPool, tokenOnPoolSetter] = useState(tokenAddress)

    const [initialSubgraph, initialSubgraphSetter] = useState("")
    const [initialDepositAmount, initialDepositAmountSetter] = useState(0)
    const [poolTitle, poolTitleSetter] = useState("")

    const [permitSpend, permitSpendSetter] = useState(false);

    const { data } = useContractRead({
        abi: ProtocolReserveABI,
        address: reserveAddr,
        functionName: 'displaySubgraphList',
        args: [],
        enabled: true,
        chainId: Number(chainId)
    })

    const { write: writePool, data: dataPool } = useContractWrite({
        abi: ProtocolReserveABI,
        address: reserveAddr,
        functionName: 'deployPoolContract',
        chainId: Number(chainId)
    })

    const {
        data: receiptPool,
        isLoading: isPendingPool,
        isSuccess: isSuccessPool,
    } = useWaitForTransaction({ hash: dataPool?.hash })

    useEffect(() => {
        console.log(isSuccessPool, 'isSuccessPool')
        if (isSuccessPool) {
            const txData: any = receiptPool
            router.push('/pool/' + txData.logs[0].address)
        }
    }, [isSuccessPool])

    const submitPoolCreation = async () => {
        const title = stringToHex(poolTitle, { size: 32 })
        const poolId = stringToHex("123", { size: 32 })
        writePool({
            args: [tokenOnPool, title, (initialDepositAmount), initialSubgraph, poolId]
        })
    }

    const subgraphList: string[] = []
    if (Array.isArray(data)) {
        (data)?.filter(x => {
            subgraphList.push(x)
        })
    }

    let subgraphListElements = null
    if (subgraphList.length > 0) {
        subgraphListElements = []
        subgraphListElements.push(<h3>Subgraph List - Select one to initialize the pool</h3>)
        subgraphList.forEach((addr) => {
            subgraphListElements.push(
                <SubgraphListEntry key={addr} address={addr} subgraphSetter={initialSubgraphSetter} userAddress={userAddress} />
            )
        })
    }

    let approvalElement = null;
    let poolTitleElement = null;
    let tokenAddressElement = null;
    let submitPoolCreationButton = null;
    if (initialSubgraph) {
        tokenAddressElement = <div><span>Pool Deposit Token Address: </span><input type="string" value={tokenOnPool} onChange={(x: any) => tokenOnPoolSetter(x.target.value)} /></div>
        approvalElement = <div><span>Pool Initial Deposit Amount (18 decimal): </span><input type="number" onChange={(x: any) => initialDepositAmountSetter(x.target.value * (10 ** 18))} /></div>
        poolTitleElement = <div><span>Pool Name: </span><input type="text" onChange={(x) => poolTitleSetter(x.target.value)} /></div>
        submitPoolCreationButton = (<div><span onClick={() => {
            isLoadingPoolDeploymentSetter(true)
            permitSpendSetter(true)
        }}>Create Pool</span></div>)
    }

    useEffect(() => {
        if (spendApproved) {
            submitPoolCreation()
        }
    }, [spendApproved])

    let permitFetch = null
    if (permitSpend) {
        permitFetch = <TokenApprove tokenAddress={tokenAddress} balance={initialDepositAmount} addressToApprove={reserveAddr} approvalLoadingSetter={() => null} permitSuccessSetter={(x: boolean) => {
            permitSpendSetter(false)
            spendApprovedSetter(x)
        }} />
    }

    return (<>
        <Header />
        <div className="DeployPool">
            <h3>DeployPool Page</h3>
            <div style={{ width: "100%" }}>
                {subgraphListElements}
                {tokenAddressElement}
                {approvalElement}
                {permitFetch}
                {poolTitleElement}
                {submitPoolCreationButton}
            </div>
        </div>
    </>
    );
}

export default DeployPool;
