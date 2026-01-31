'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Stethoscope } from 'lucide-react'
import Link from 'next/link'

export function SocialProof() {
    return (
        <section id="social-proof" className="pt-24 pb-12 md:pt-36 md:pb-16 px-4 bg-white overflow-hidden">
            <div className="container mx-auto">
                {/* Headline */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#003366] leading-tight">
                        Muchos <span className="text-[#00A896]">aliados</span> ya gestionan
                        <br className="hidden md:block" /> sus agendas con OnTurn.
                    </h2>
                </motion.div>

                {/* Infinite Logo Marquee */}
                <div className="relative mb-0 overflow-hidden">
                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    {/* Marquee Container */}
                    <div className="group flex overflow-hidden">
                        <motion.div
                            className="flex gap-12 items-center py-8"
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: 'loop',
                                    duration: 30,
                                    ease: 'linear'
                                }
                            }}
                            whileHover={{ animationPlayState: 'paused' }}
                            style={{ animationPlayState: 'running' }}
                        >
                            {/* First set of logos */}
                            {[
                                'Clínica San Borja',
                                'Consultorio Dental Kids',
                                'Cardiología Avanzada',
                                'Centro Médico Esperanza',
                                'Pediatría Integral',
                                'Dermatología Estética',
                                'Oftalmología Visión Plus',
                                'Traumatología Deportiva',
                                'Ginecología Premium',
                                'Neurología Especializada'
                            ].map((name, index) => (
                                <div
                                    key={`logo-1-${index}`}
                                    className="flex-shrink-0 px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[220px] text-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group/logo"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#003366]/10 flex items-center justify-center group-hover/logo:bg-[#003366]/20 transition-colors">
                                            <Stethoscope className="h-5 w-5 text-[#003366]/60 group-hover/logo:text-[#003366] transition-colors" />
                                        </div>
                                        <span className="font-semibold text-slate-500 group-hover/logo:text-[#003366] transition-colors whitespace-nowrap">
                                            {name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {/* Duplicate set for seamless loop */}
                            {[
                                'Clínica San Borja',
                                'Consultorio Dental Kids',
                                'Cardiología Avanzada',
                                'Centro Médico Esperanza',
                                'Pediatría Integral',
                                'Dermatología Estética',
                                'Oftalmología Visión Plus',
                                'Traumatología Deportiva',
                                'Ginecología Premium',
                                'Neurología Especializada'
                            ].map((name, index) => (
                                <div
                                    key={`logo-2-${index}`}
                                    className="flex-shrink-0 px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[220px] text-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group/logo"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#003366]/10 flex items-center justify-center group-hover/logo:bg-[#003366]/20 transition-colors">
                                            <Stethoscope className="h-5 w-5 text-[#003366]/60 group-hover/logo:text-[#003366] transition-colors" />
                                        </div>
                                        <span className="font-semibold text-slate-500 group-hover/logo:text-[#003366] transition-colors whitespace-nowrap">
                                            {name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
