'use client'

import React, { useState, useEffect } from 'react'

interface SplashLoadingProps {
    onFinish?: () => void
    show?: boolean
}

export function SplashLoading({ onFinish }: SplashLoadingProps) {
    const [isOn, setIsOn] = useState(false)
    const [text, setText] = useState("")
    const targetText = "nTurn"

    useEffect(() => {
        // 1. Iniciar con el switch apagado (por defecto en estado inicial)

        // 2. Encender switch (animación de slide)
        const switchTimer = setTimeout(() => {
            setIsOn(true)
        }, 600) // Espera un poco antes de encender

        // 3. Empezar a escribir el texto una vez el switch esté "ON"
        const textTimer = setTimeout(() => {
            let currentIndex = 0
            const typeInterval = setInterval(() => {
                if (currentIndex <= targetText.length) {
                    setText(targetText.slice(0, currentIndex))
                    currentIndex++
                } else {
                    clearInterval(typeInterval)
                    // 4. Terminar splash
                    if (onFinish) {
                        setTimeout(onFinish, 1500) // Mantener logo final un momento
                    }
                }
            }, 150) // Velocidad de escritura
            return () => clearInterval(typeInterval)
        }, 1300) // Tiempo para que termine la animación del switch

        return () => {
            clearTimeout(switchTimer)
            clearTimeout(textTimer)
        }
    }, [onFinish])

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100] transition-opacity duration-700">
            <div className="flex items-center justify-center transform scale-125 md:scale-150 mb-2">

                {/* Switch Animado */}
                <div
                    className={`relative w-12 h-7 rounded-full border-[3px] transition-all duration-500 ease-in-out flex items-center shrink-0 z-10 ${isOn ? 'border-[#00A896]' : 'border-slate-300'
                        }`}
                >
                    <div
                        className={`absolute w-4 h-4 rounded-full shadow-sm transition-all duration-500 ease-in-out ${isOn
                                ? 'translate-x-[22px] bg-[#00A896]' // Derecha + Turquesa
                                : 'translate-x-[2px] bg-slate-300' // Izquierda + Gris
                            }`}
                    />
                </div>

                {/* Texto Animado */}
                {/* ml-0.5 para dar un espacio mínimo entre el switch y el texto */}
                <div className="flex items-center ml-0.5 z-0 pb-1.5">
                    {/* Letra 'n' en Turquesa */}
                    <span className="text-3xl font-extrabold text-[#00A896] leading-none">
                        {text.charAt(0)}
                    </span>
                    {/* Resto 'Turn' en Azul */}
                    <span className="text-3xl font-extrabold text-[#003366] leading-none">
                        {text.slice(1)}
                    </span>
                </div>

            </div>

            {/* Tagline con animación de entrada suave */}
            <p className={`text-slate-400 text-xs md:text-sm font-medium tracking-wide transition-opacity duration-1000 delay-1000 ${text.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                reserva tu turno en tu lugar favorito
            </p>
        </div>
    )
}
