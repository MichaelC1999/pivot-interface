'use client'

import React, { useEffect, useState } from "react";
import ProtocolReserveABI from "../../ProtocolReserveManager.json";
import TestTokenABI from "../../TestTokenABI.json";

import SubgraphListEntry from "../../contractFetchComponents/SubgraphListEntry";
import { type Address, useContractRead, useContractWrite, useWaitForTransaction, useAccount } from 'wagmi'
import { stringToHex } from "viem";
import { useRouter } from 'next/navigation'
import { Header } from "../../components/Header";

function DeployPool() {
    const router = useRouter()
    const { address: userAddress } = useAccount()

    const [isLoadingPoolDeployment, isLoadingPoolDeploymentSetter] = useState(false);
    const [spendApproved, spendApprovedSetter] = useState(true);

    const [initialSubgraph, initialSubgraphSetter] = useState("")
    const [initialDepositAmount, initialDepositAmountSetter] = useState(0)
    const [poolTitle, poolTitleSetter] = useState("")

    const tokenAddress: Address = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as Address; // Replace with the ERC20 token contract address
    const reserveAddr: Address = process.env.NEXT_PUBLIC_RESERVE_CONTRACT_ADDRESS as Address;
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;

    const { write, data: dataApproval } = useContractWrite({
        abi: TestTokenABI,
        address: tokenAddress,
        functionName: 'approve',
        chainId: Number(chainId)
    })

    const {
        isSuccess: isSuccessApproval,
    } = useWaitForTransaction({ hash: dataApproval?.hash })

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

    const approveReserveSpend = async () => {
        write({
            args: [reserveAddr, 1],
        })
    }

    useEffect(() => {
        if (isSuccessPool) {
            const txData: any = receiptPool
            router.push('/pool/' + txData.logs[0].address)
        }
    }, [isSuccessPool])

    const submitPoolCreation = async () => {
        const title = stringToHex(poolTitle, { size: 32 })
        const poolId = stringToHex("123", { size: 32 })
        writePool({
            args: [tokenAddress, title, (initialDepositAmount), initialSubgraph, poolId]
        })
    }

    const { data } = useContractRead({
        abi: ProtocolReserveABI,
        address: reserveAddr,
        functionName: 'displaySubgraphList',
        args: [],
        enabled: true,
        chainId: Number(chainId)
    })

    useEffect(() => {
        submitPoolCreation()
    }, [isSuccessApproval])

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
    let submitPoolCreationButton = null;
    if (initialSubgraph) {
        approvalElement = <div><span>Pool Initial Deposit Amount: </span><input type="number" onChange={(x: any) => initialDepositAmountSetter(x.target.value)} /></div>
        poolTitleElement = <div><span>Pool Name: </span><input type="text" onChange={(x) => poolTitleSetter(x.target.value)} /></div>
        submitPoolCreationButton = (<div><span onClick={() => {
            isLoadingPoolDeploymentSetter(true)
            approveReserveSpend()
        }}>Create Pool</span></div>)
    }

    useEffect(() => {
        submitPoolCreation()
    }, [spendApproved])

    return (<>
        <Header />
        <div className="DeployPool">
            <h3>DeployPool Page</h3>
            <div style={{ width: "100%" }}>
                {subgraphListElements}
                {approvalElement}
                {poolTitleElement}
                {submitPoolCreationButton}
            </div>
        </div>
    </>
    );
}

export default DeployPool;
