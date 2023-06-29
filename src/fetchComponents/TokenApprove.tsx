'use client'

import { useEffect, useState } from 'react'
import { Address, useAccount, useContractRead, useContractReads, useContractWrite, useSignTypedData, useWaitForTransaction } from 'wagmi'
import ERC20ABI from "../ERC20.json";
import TestTokenABI from "../TestTokenABI.json";

import ERC20PermitABI from "../ERC20Permit.json";
import types from "../PermitTypes.json";
import { hexToNumber, verifyTypedData, stringToHex, recoverTypedDataAddress, numberToHex, recoverMessageAddress } from 'viem';
import { secp256k1 } from '@noble/curves/secp256k1'
import { ethers } from 'ethers'

export function TokenApprove({ tokenAddress, balance, addressToApprove, approvalLoadingSetter, permitSuccessSetter }: any) {
    const chainId: string = process.env.NEXT_PUBLIC_CHAIN_ID as string;
    const { address: userAddress }: any = useAccount()
    const [signSuccess, signSuccessSetter] = useState<any>(null)
    const ts = Math.floor((new Date().getTime()) / 1000) + 4200;

    const [deadline] = useState<number>(ts)

    const { data: tokenData, isSuccess: isSuccessTokenDataRead } = useContractReads({
        contracts: [
            {
                abi: ERC20PermitABI,
                address: tokenAddress,
                functionName: 'nonces',
                args: [userAddress],
                enabled: true,
                chainId: Number(chainId)
            },
            {
                abi: ERC20ABI,
                address: tokenAddress,
                functionName: 'name',
                args: [],
                enabled: true,
                chainId: Number(chainId)
            },
        ]
    })

    const nonces = tokenData?.[0]?.result as any;

    const tokenDomain = {
        name: tokenData?.[1]?.result as any,
        version: "1",
        chainId: Number(chainId),
        verifyingContract: tokenAddress
    };

    const values = {
        owner: userAddress,
        spender: addressToApprove,
        value: balance.toString(),
        nonce: Number(nonces),
        deadline: deadline,
    };

    const { write: permit, data: txPermit } = useContractWrite({
        abi: ERC20PermitABI,
        address: tokenAddress,
        functionName: 'permit',
        chainId: Number(chainId)
    })

    const {
        isSuccess: isSuccessPermit,
    } = useWaitForTransaction({ hash: txPermit?.hash })

    const { data: signature, signTypedData, isSuccess: signatureMade } = useSignTypedData({
        domain: tokenDomain as any,
        types: types,
        primaryType: "Permit",
        message: values
    })

    useEffect(() => {
        console.log(deadline)
    }, [deadline])

    useEffect(() => {
        if (signature) {
            verification({
                address: userAddress,
                domain: tokenDomain,
                types,
                primaryType: 'Permit',
                message: values,
                signature: signature as `0x${string}`,
            })
        }
    }, [signatureMade])


    useEffect(() => {
        if (isSuccessTokenDataRead) {
            approvalLoadingSetter(true)
            signTypedData()
        }
    }, [isSuccessTokenDataRead, deadline])


    useEffect(() => {
        console.log(signSuccess)
        if (signSuccess == true && signature) {
            signingAddr()
            const sig = ethers.Signature.from(signature)
            permit({
                args: [
                    values.owner,
                    values.spender,
                    BigInt(values.value),
                    values.deadline,
                    sig.v,
                    sig.r,
                    sig.s,
                ]
            })
        }
    }, [signSuccess])

    useEffect(() => {
        console.log(isSuccessPermit, txPermit)
        if (isSuccessPermit == true) {
            permitSuccessSetter(true)
        }
    }, [isSuccessPermit])

    const verification = async (dataObj: any) => {
        const res = await verifyTypedData(dataObj)
        signSuccessSetter(res)
        return res
    }


    const signingAddr = async () => {
        console.log(signature)
        if (signature) {
            const addr = await recoverTypedDataAddress({
                domain: tokenDomain,
                types,
                primaryType: 'Permit',
                message: values,
                signature,
            })
            console.log(addr, "<<<<< addr right?", values)
        }
    }

    return null
}