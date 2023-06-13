'use client'

import { useRouter } from "next/navigation"
import { Connect } from "./Connect"

export function Header() {
    const router = useRouter()

    return (
        <div style={{ width: "100%" }}>
            <Connect />
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                <h4 onClick={() => router.push('/protocol')}>Protocol</h4>
                <h4 onClick={() => router.push('/deploy')}>Deploy Pool</h4>
            </div>
        </div>
    )
}
