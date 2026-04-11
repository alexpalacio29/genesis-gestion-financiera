import React, { useState } from 'react';
import { 
  CheckCircle, 
  BarChart3, 
  FileText, 
  BookOpen, 
  Users, 
  Package, 
  Lock, 
  CreditCard, 
  Wallet, 
  History, 
  FileImage, 
  Download,
  Play,
  Mail,
  Phone,
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  Shield,
  LayoutDashboard,
  Send,
  Bot,
  User,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils'; // Assuming cn utility is here, or I can define it

interface LandingPageProps {
  onLogin: () => void;
  isLoggedIn: boolean;
  onGoToDashboard: () => void;
}

export default function LandingPage({ onLogin, isLoggedIn, onGoToDashboard }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const benefits = [
    { icon: <BarChart3 className="w-6 h-6" />, text: "Estado financiero en un solo vistazo, con información clara y organizada." },
    { icon: <FileText className="w-6 h-6" />, text: "Documentación para cotizaciones y compras con solo unos clics." },
    { icon: <BookOpen className="w-6 h-6" />, text: "Permite presupuestar y planificar a partir del POA." },
    { icon: <History className="w-6 h-6" />, text: "Libro de caja y registro de movimientos bancarios." },
    { icon: <Users className="w-6 h-6" />, text: "Lista de suplidores con historial completo de compras." },
    { icon: <Package className="w-6 h-6" />, text: "Inventario inteligente con códigos oficiales de compra del MINERD." },
    { icon: <Lock className="w-6 h-6" />, text: "Documentación almacenada de forma segura para consulta y edición." },
    { icon: <CreditCard className="w-6 h-6" />, text: "Creación y control de cheques y manejo de chequera." },
    { icon: <Wallet className="w-6 h-6" />, text: "Gestión de caja chica con historial y balance actualizado." },
    { icon: <Shield className="w-6 h-6" />, text: "Simplifica la conciliación bancaria mensual." },
    { icon: <FileImage className="w-6 h-6" />, text: "Generación de comprobantes (NCF) automatizada." },
    { icon: <Download className="w-6 h-6" />, text: "Reportes en Excel y PDF listos para entregar o archivar." }
  ];

  const plans = [
    { 
      name: "Básico", 
      desc: "Ideal para centros públicos sin juntas descentralizadas", 
      price: "RD$ 699.99 /mes",
      priceYearly: "RD$ 7,999.99 /año",
      link: "#contacto",
      features: [
        "1 Centro educativo", "Generador de Cotizaciones", "Ordenes de Compra y Requisiciones", 
        "Acceso a Suplidores", "Presupuesto", "Libro de Caja", "Soporte Limitado"
      ] 
    },
    { 
      name: "Profesional", 
      desc: "Ideal para centros públicos con juntas descentralizadas", 
      price: "RD$ 1,199.99 /mes",
      priceYearly: "RD$ 13,999.99 /año",
      link: "#contacto",
      features: [
        "1 Centro educativo Full Access", "Certificaciones de Retención", 
        "Solicitudes, Cheques y más", "Gestión de Suplidores", "Presupuesto", 
        "Libro de Caja y Banco", "Inventario", "Estado Bancario", 
        "Gestión de Caja Chica", "Conciliación Bancaria", "Comprobantes NCF", 
        "Generador de reportes", "Soporte Tecnico Avanzado (< 24h)"
      ] 
    },
    { 
      name: "Multicentro", 
      desc: "Ideal para Distritos Educativos", 
      price: "Pedir cotización",
      priceYearly: "",
      link: "#contacto",
      features: [
        "Multicentros Ilimitados Full Access", "Certificaciones de Retención", 
        "Solicitudes, Cheques y más", "Gestión de Suplidores", "Presupuesto", 
        "Libro de Caja y Banco", "Inventario", "Estado Bancario", 
        "Gestión de Caja Chica", "Conciliación Bancaria", "Comprobantes NCF", 
        "Generador de reportes", "Soporte Tecnico Especializado (< 12h)"
      ] 
    }
  ];

  const slides = ["/hero-image.png", "/dashboard-preview.png", "/ai-processor.png", "/minerd-compliance.png"];
  const [currentSlide, setCurrentSlide] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
               <img src="/logo-gestify.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <span className="text-2xl font-black tracking-tight text-slate-900">GestiFy <span className="text-emerald-600">RD</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Inicio', 'Funciones', 'Reportes', 'Tutorial', 'Planes', 'Contacto'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button 
                onClick={onGoToDashboard}
                className="hidden md:flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <LayoutDashboard className="w-4 h-4" />
                Mi Panel
              </button>
            ) : (
              <button 
                onClick={onLogin}
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                <Lock className="w-4 h-4" />
                Iniciar Sesión
              </button>
            )}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top duration-300">
           <nav className="flex flex-col gap-6">
              {['Inicio', 'Funciones', 'Reportes', 'Tutorial', 'Planes', 'Contacto'].map(item => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-black text-slate-900"
                >
                  {item}
                </a>
              ))}
              <hr className="border-slate-100" />
              {isLoggedIn ? (
                <button onClick={onGoToDashboard} className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-bold">Ir a mi Panel</button>
              ) : (
                <button onClick={onLogin} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">Iniciar Sesión</button>
              )}
           </nav>
        </div>
      )}

      {/* Hero Section */}
      <section id="inicio" className="pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              La plataforma inteligente de <span className="text-emerald-600">gestión financiera</span> para centros públicos
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              GestiFy RD es una plataforma moderna y especializada, diseñada para optimizar la gestión financiera de los centros educativos públicos y distritos educativos que administran fondos descentralizados en República Dominicana.
            </p>
            <p className="text-sm text-slate-400 font-medium leading-relaxed italic border-l-2 border-emerald-200 pl-4">
              Desarrollada para responder de manera precisa a las necesidades reales de los gestores financieros, permitiendo automatizar los procesos exigidos por el MINERD de forma rápida y segura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contacto" className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 text-lg">
                ✅ Solicitar Demo
              </a>
              <a href="#funciones" className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all text-lg shadow-sm">
                🧾 Ver Funciones
              </a>
              {!isLoggedIn && (
                <button onClick={onLogin} className="sm:hidden flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold">
                  🔐 Iniciar Sesión
                </button>
              )}
            </div>
          </motion.div>

          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white aspect-video"
            >
              <motion.img 
                key={currentSlide}
                src={slides[currentSlide]} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                alt="App Preview" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentSlide === i ? "bg-emerald-600 w-6" : "bg-white/50 hover:bg-white"
                    )}
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Decostyle elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="funciones" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Beneficios y Funciones</h2>
            <h3 className="text-4xl font-black text-slate-900">Todo lo que necesitas para tu <span className="text-emerald-600">gestión oficial</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {benefit.icon}
                </div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  <CheckCircle className="w-4 h-4 inline-block mr-2 text-emerald-500 shrink-0" />
                  {benefit.text}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <p className="text-xl font-black text-slate-900 tracking-tight">
               📌 Menos estrés. Menos errores. Más control. Más eficiencia.
             </p>
          </div>
        </div>
      </section>

      {/* Tutorial Section */}
      <section id="tutorial" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1 relative">
              <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group relative">
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 group-hover:bg-slate-900/20 transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                       <Play className="fill-emerald-600 text-emerald-600 w-8 h-8 ml-1" />
                    </div>
                 </div>
                 {/* Placeholder for iframe */}
                 <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 font-mono text-sm uppercase tracking-widest text-center px-8">
                    Video Tutorial Placeholder<br/>(Espacio reservado para YouTube)
                 </div>
              </div>
           </div>
           <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl font-black text-slate-900 leading-tight">
                🎥 Tutorial: Aprende a usar <span className="text-emerald-600">GestiFy RD</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium font-serif leading-relaxed">
                Descubre cómo nuestra plataforma puede transformar tu jornada laboral. En este tutorial paso a paso, te mostramos desde la carga de documentos hasta la generación de reportes automáticos.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { t: 'Paso 1', d: 'Carga de Cotización (Excel, Pdf, JPG o Manual)' },
                   { t: 'Paso 2', d: 'Procesamiento IA' },
                   { t: 'Paso 3', d: 'Descarga los archivos generados' },
                   { t: 'Paso 4', d: 'Revisa todos los registros ya actualizados' }
                 ].map((s,i) => (
                   <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">{s.t}</p>
                      <p className="text-xs font-bold text-slate-900">{s.d}</p>
                   </div>
                 ))}
              </div>

           </div>
        </div>
      </section>

      {/* Reports Section */}
      <section id="reportes" className="py-24 bg-emerald-900 text-white relative overflow-hidden">
        {/* Background decos */}
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-emerald-800/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <h2 className="text-4xl font-black leading-tight">Generación de Reportes y Documentación <span className="text-emerald-400 font-serif italic">Oficial MINERD</span></h2>
               <p className="text-lg text-emerald-100 font-medium">Olvídate de las hojas de cálculo manuales. GestiFy RD genera automáticamente todos los formatos exigidos por los lineamientos de descentralización.</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   'Cotización', 'Requisición', 'Orden de compra', 
                   'Solicitud de cheque', 'Solicitud de mano de obra', 
                   'Registro de caja chica', 'Registro bancario', 
                   'Inventario', 'Comprobantes NCF', 'Reportes en Excel y PDF'
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 bg-emerald-800/40 p-3 rounded-xl border border-emerald-700/50">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                         <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white">{item}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <img src="/report-view-1.png" className="rounded-3xl shadow-2xl translate-y-8 border-4 border-white/10" alt="Vista Monitor" />
               <img src="/report-view-2.png" className="rounded-3xl shadow-2xl -translate-y-8 border-4 border-white/10" alt="Vista Laptop" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planes" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">Planes y Licencias</h2>
            <h3 className="text-4xl font-black text-slate-900">Encuentra la solución ideal para tu centro</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-10 rounded-[2.5rem] shadow-sm border transition-all flex flex-col hover:shadow-2xl hover:scale-105 duration-300",
                  i === 1 ? "bg-white border-emerald-500/30 ring-4 ring-emerald-500/5" : "bg-white border-slate-200"
                )}
              >
                {i === 1 && <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full self-start mb-6 tracking-widest">Recomendado</span>}
                <h4 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h4>
                <p className="text-sm font-medium text-slate-400 mb-8">{plan.desc}</p>
                <div className="space-y-1 mb-8">
                  <div className={cn("font-black text-slate-900", plan.price === "Pedir cotización" ? "text-2xl" : "text-3xl")}>
                    {plan.price}
                  </div>
                  {plan.priceYearly && (
                    <div className="text-sm font-bold text-emerald-600 italic">
                      o {plan.priceYearly}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mb-10 flex-1">
                   {plan.features.map((f, j) => (
                     <div key={j} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm font-bold text-slate-600">{f}</span>
                     </div>
                   ))}
                </div>

                <a 
                  href={plan.link}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold transition-all shadow-lg text-center",
                    plan.name === "Profesional" ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100" : "bg-slate-900 text-white hover:bg-slate-800"
                  )}
                >
                  {plan.price === "Pedir cotización" ? "Contactar Ventas" : "Solicitar licencia"}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
           <div className="lg:w-1/2 space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl font-black text-slate-900 leading-tight">¿Háblanos de tu <span className="text-emerald-600">centro educativo</span>?</h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">Estamos listos para ayudarte a transformar tu gestión económica. Completa el formulario y responderemos en menos de 24 horas.</p>
              </div>

              <div className="space-y-4">
                 <button className="flex items-center gap-4 bg-emerald-50 text-emerald-700 w-full p-6 rounded-3xl border border-emerald-100 hover:bg-emerald-100 transition-all font-bold group">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black uppercase tracking-widest opacity-60">WhatsApp Directo</p>
                       <p className="text-lg">Contactar por WhatsApp</p>
                    </div>
                 </button>

                 <button className="flex items-center gap-4 bg-blue-50 text-blue-700 w-full p-6 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-all font-bold group">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Mail className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black uppercase tracking-widest opacity-60">Correo Electrónico</p>
                       <p className="text-lg">info@gestifyrd.com</p>
                    </div>
                 </button>
              </div>
           </div>

           <div className="lg:w-1/2 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative">
              <form className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" placeholder="Ej: Juan Pérez" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teléfono</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" placeholder="809-000-0000" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Centro Educativo</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" placeholder="Ej: Escuela México" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distrito</label>
                       <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" placeholder="Ej: 15-02" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Institucional</label>
                    <input type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" placeholder="ejemplo@minerd.gob.do" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">¿En qué podemos ayudarte?</label>
                    <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
                 </div>
                 <button className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 text-lg">
                    Enviar solicitud <ArrowRight className="w-5 h-5" />
                 </button>
              </form>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
         <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-16 text-center text-white space-y-8 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
               <h2 className="text-4xl md:text-5xl font-black">¿Listo para modernizar tu centro?</h2>
               <p className="text-lg text-slate-400 font-medium">Únete a los cientos de gestores que ya confían en GestiFy RD.</p>
               <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="#contacto" className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-emerald-700 transition-all text-xl shadow-2xl shadow-emerald-900/40">Solicitar Demo Ahora</a>
                  <button onClick={onLogin} className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black hover:bg-slate-100 transition-all text-xl">Acceder a mi Cuenta</button>
               </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="space-y-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                 <img src="/logo-gestify.png" alt="Logo" className="w-full h-full object-contain" />
               </div>
               <span className="text-xl font-black text-slate-900">GestiFy RD</span>
             </div>
             <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-tighter">Gestión financiera inteligente para la descentralización educativa dominicana.</p>
           </div>
           <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Plataforma</h4>
              <ul className="space-y-4">
                 {['Funciones', 'Reportes', 'Seguridad', 'Planes'].map(l => <li key={l}><a href="#" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">{l}</a></li>)}
              </ul>
           </div>
           <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Compañía</h4>
              <ul className="space-y-4">
                 {['Sobre Nosotros', 'Contacto', 'Ayuda', 'Términos'].map(l => <li key={l}><a href="#" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">{l}</a></li>)}
              </ul>
           </div>
           <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Social</h4>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><Phone className="w-5 h-5" /></div>
                 <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><Mail className="w-5 h-5" /></div>
                 <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><MessageCircle className="w-5 h-5" /></div>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 GestiFy RD. Todos los derechos reservados.</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Potenciando la educación con transparencia</p>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{role: 'user' | 'bot', content: string}[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/landing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] })
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'bot', content: data.text }]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, hubo un error de conexión. Por favor, intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const initialGreeting = () => {
    if (messages.length === 0) {
      setMessages([{ role: 'bot', content: 'Hola, ¿cómo puedo ayudarte? Pregúntame lo que desees saber.' }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[90vw] sm:w-[380px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Soporte en línea</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 rx-2 bg-emerald-300 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">En línea</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
            >
              <div className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mb-4">
                Chat impulsado por IA
              </div>
              
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    m.role === 'user' ? "bg-slate-200 text-slate-500" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none"
                  )}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form 
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-lg shadow-emerald-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) initialGreeting();
        }}
        className={cn(
          "w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-500",
          isOpen ? "bg-slate-900 text-white rotate-90" : "bg-emerald-600 text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <div className="relative"><MessageCircle className="w-7 h-7" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-emerald-600 shadow-sm" /></div>}
      </motion.button>
    </div>
  );
};
