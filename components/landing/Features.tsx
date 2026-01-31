'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { BellRing, CalendarClock, ShieldCheck } from 'lucide-react'

export function Features() {
    const features = [
        {
            icon: BellRing,
            title: 'Recordatorios que sí funcionan',
            description: 'Olvídate de las inasistencias. Enviamos confirmaciones automáticas por WhatsApp y correo amigables.',
            visual: (
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 max-w-[280px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center">
                            <BellRing className="h-5 w-5 text-[#00A896]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">¡Tu cita está lista!</p>
                            <p className="text-xs text-slate-500">Mañana a las 10:00 AM</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            icon: CalendarClock,
            title: 'Agenda abierta 24/7',
            description: 'Tu negocio nunca cierra. Permite que tus clientes reserven en el momento que mejor les convenga.',
            visual: (
                <div className="text-center">
                    <div className="text-5xl font-extrabold text-[#003366] tracking-tighter">24/7</div>
                    <p className="text-sm text-slate-500 mt-2 font-medium bg-slate-100 px-3 py-1 rounded-full inline-block">Siempre disponible</p>
                </div>
            )
        },
        {
            icon: ShieldCheck,
            title: 'Privacidad Total',
            description: 'Tus datos y los de tus clientes están blindados con la mejor tecnología de encriptación.',
            visual: (
                <div className="flex items-center justify-center">
                    <ShieldCheck className="h-20 w-20 text-[#00A896] drop-shadow-xl shadow-[#00A896]/20" />
                </div>
            )
        }
    ]

    return (
        <section id="features" className="py-20 md:py-32 px-4 bg-slate-50">
            <div className="container mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#003366] mb-4">
                        ¿Por qué elegir OnTurn?
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Tecnología de punta para una experiencia de salud sin fricciones
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                        >
                            <Card className="h-full border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden bg-white">
                                <CardContent className="p-8">
                                    <div className="h-32 flex items-center justify-center mb-6 bg-slate-50 rounded-2xl">
                                        {feature.visual}
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-[#003366]/10 flex items-center justify-center mb-4">
                                        <feature.icon className="h-6 w-6 text-[#003366]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-500">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
