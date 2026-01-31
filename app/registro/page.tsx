'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

function RegistroForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/reservas'
    const supabase = createClient()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // 1. Crear usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No se pudo crear el usuario')

            // 2. Crear perfil en tabla profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    full_name: fullName,
                    role: 'customer', // Rol por defecto
                    email: email, // Guardamos email en profile tambien por conveniencia
                })

            if (profileError) {
                // Si falla el perfil, podríamos intentar borrar el usuario auth o ignorarlo si es duplicado
                console.error('Error creando perfil:', profileError)
                // No lanzamos error fatal si el usuario auth se creó, para no bloquear el login
            }

            // Login exitoso y redirección
            alert('Cuenta creada exitosamente. Bienvenido!')
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
