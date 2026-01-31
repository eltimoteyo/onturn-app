import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white border-t border-slate-200 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                            <Logo dark={false} />
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            La plataforma líder para gestión de reservas y turnos online. Conectamos personas con servicios de calidad en tiempo real.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="text-slate-400 hover:text-[#003366] transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-[#003366] transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-[#003366] transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-[#003366] transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="font-bold text-[#003366] mb-4">Plataforma</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link href="/reservas" className="hover:text-[#00A896] transition-colors">Explorar Servicios</Link></li>
                            <li><Link href="/registro-negocio" className="hover:text-[#00A896] transition-colors">Para Negocios</Link></li>
                            <li><Link href="/precios" className="hover:text-[#00A896] transition-colors">Planes y Precios</Link></li>
                            <li><Link href="/login" className="hover:text-[#00A896] transition-colors">Iniciar Sesión</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="font-bold text-[#003366] mb-4">Soporte</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link href="/ayuda" className="hover:text-[#00A896] transition-colors">Centro de Ayuda</Link></li>
                            <li><Link href="/contacto" className="hover:text-[#00A896] transition-colors">Contáctanos</Link></li>
                            <li><Link href="/terminos" className="hover:text-[#00A896] transition-colors">Términos y Condiciones</Link></li>
                            <li><Link href="/privacidad" className="hover:text-[#00A896] transition-colors">Política de Privacidad</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="font-bold text-[#003366] mb-4">Contacto</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-[#00A896] shrink-0" />
                                <a href="mailto:hola@onturn.com" className="hover:text-[#003366]">hola@onturn.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-[18px] w-[18px] shrink-0 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-full h-full text-[#25D366] fill-current">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </div>
                                <a
                                    href="https://wa.me/51945111310?text=Hola,%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20plataforma%20OnTurn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#003366] transition-colors font-medium"
                                >
                                    +51 945 111 310
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>

            {/* Createam Ecosystem Strip */}
            <div className="border-t border-slate-100 mt-12 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">Impulsado por el equipo de</span>
                            <a
                                href="https://createam.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img src="/logo-createam.svg" alt="Createam" className="h-6 w-auto" />
                            </a>
                        </div>

                        <a
                            href="https://createam.cloud"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full hover:border-[#00A896]/30 hover:shadow-sm transition-all"
                        >
                            <span className="text-xs font-semibold text-slate-600 group-hover:text-[#00A896] transition-colors">
                                Explora más soluciones digitales en <span className="text-[#003366]">createam.cloud</span>
                            </span>
                            <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Legal Section */}
            <div className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-400 text-sm">
                            © {currentYear} OnTurn. Todos los derechos reservados.
                        </p>
                        <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                            <Link href="/privacidad" className="hover:text-[#003366]">Privacidad</Link>
                            <Link href="/cookies" className="hover:text-[#003366]">Cookies</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
