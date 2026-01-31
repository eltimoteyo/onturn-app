'use client'

import React, { useState, useEffect } from 'react'
import { SplashLoading } from './SplashLoading'

export function ClientLoader({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(true)

    const handleFinish = () => {
        setShowSplash(false)
    }

    return (
        <>
            {showSplash && <SplashLoading onFinish={handleFinish} />}
            {children}
        </>
    )
}
