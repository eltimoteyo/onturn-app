import React from 'react'

interface LogoProps {
    dark?: boolean
    size?: 'md' | 'lg'
}

export function Logo({ dark = false, size = "md" }: LogoProps) {
    const primaryColor = "#00A896"; // Turquesa para "On" (Icon + n)
    const secondaryColor = dark ? "#FFFFFF" : "#003366"; // Azul o Blanco para "Turn"

    const iconHeight = size === "lg" ? 40 : 28;
    const iconWidth = size === "lg" ? 64 : 44;
    const fontSize = size === "lg" ? "text-4xl" : "text-2xl";
    const strokeWidth = size === "lg" ? 3 : 2.5;

    return (
        <div className="flex items-center gap-0.5 select-none tracking-tighter">
            {/* Icono Switch (La "O") */}
            <div className="flex items-center justify-center mr-0.5">
                <svg width={iconWidth} height={iconHeight} viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="41" height="25" rx="12.5" stroke={primaryColor} strokeWidth={strokeWidth} fill="none" />
                    <circle cx="31" cy="14" r="7" fill={primaryColor} />
                </svg>
            </div>

            {/* Contenedor de Texto con Ajuste Óptico (pb-1 sube el texto ligeramente) */}
            <div className="flex items-center pb-1">
                {/* Texto "n" (Mismo color que el switch) */}
                <span className={`${fontSize} font-extrabold`} style={{ color: primaryColor, marginLeft: -2 }}>
                    n
                </span>

                {/* Texto "Turn" (Color secundario) */}
                <span className={`${fontSize} font-extrabold`} style={{ color: secondaryColor }}>
                    Turn
                </span>
            </div>
        </div>
    );
}
