'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { registroSchema, type RegistroInput } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

function RegistroForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/reservas'
    const supabase = createClient()
    const { success, error: showError } = useToast()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validar con Zod
        const validation = registroSchema.safeParse({ fullName, email, password })
        
        if (!validation.success) {
            const firstError = validation.error.errors[0]
            setError(firstError.message)
            setLoading(false)
            return
        }

        try {
            // 1. Crear usuario en Auth con metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'customer', // El trigger usará este rol
                    },
                },
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No se pudo crear el usuario')

            // 2. El perfil se crea AUTOMÁTICAMENTE por el trigger on_auth_user_created
            // Esperar a que el trigger complete la creación del perfil
            await new Promise(resolve => setTimeout(resolve, 500))

            // Login exitoso y redirección
            success('Cuenta creada exitosamente. Bienvenido!')
            router.push(redirect)

        } catch (err: any) {
            setError(err.message || 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-[#003366]">Crear Cuenta</CardTitle>
                    <CardDescription className="text-center">
                        Regístrate para reservar tus turnos fácilmente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre Completo
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#00A896] hover:bg-[#008f80]"
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta...' : 'Registrarse'}
                        </Button>

                        <div className="text-center text-sm text-gray-600 mt-4">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href={`/login?redirect=${redirect}`} className="text-[#003366] hover:underline font-bold">
                                Inicia sesión aquí
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function RegistroPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><p>Cargando...</p></div>}>
            <RegistroForm />
        </Suspense>
    )
}
