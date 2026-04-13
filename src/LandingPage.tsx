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
  Sparkles,
  Share2,
  Copy,
  Twitter,
  Facebook,
  Youtube,
  Instagram
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
      price: "RD$ 999.99 /mes",
      priceYearly: "RD$ 10,999.99 /año",
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

  const slides = ["/hero-image.png", "/dashboard-preview.png", "/ai-processor.png", "/minerd-official.png"];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareMessage = `Moderniza tu centro con GestiFy RD 🇩🇴 Una plataforma moderna para gestionar de forma fácil y organizada las finanzas de la Junta Descentralizada de tu centro educativo. Conócelo aquí: https://gestifyrd.com`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [submitted, setSubmitted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    center_name: '',
    district: '',
    email: '',
    message: ''
  });

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
      setFormData({ name: '', phone: '', center_name: '', district: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Hubo un error al enviar tu solicitud. Por favor inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-emerald-50 p-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    <img 
                      src="/alex-palacio.jpg" 
                      alt="Alexander Palacio" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Alexander+Palacio+Espiritusanto&background=059669&color=fff&size=200`;
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 leading-tight">Alexander Palacio Espiritusanto</h3>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Fundador</p>
                    <div className="flex gap-2 justify-center">
                       <span className="text-[10px] font-bold bg-white/50 px-2 py-1 rounded-md text-emerald-600 border border-emerald-100 uppercase tracking-widest">Educador</span>
                       <span className="text-[10px] font-bold bg-white/50 px-2 py-1 rounded-md text-emerald-600 border border-emerald-100 uppercase tracking-widest">Gestor Educativo</span>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                       <a 
                         href="https://wa.me/18294108036"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl text-xs font-bold text-slate-700 border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm group"
                       >
                          <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                          829-410-8036
                       </a>
                       <a 
                         href="mailto:alexpalacio29@gmail.com"
                         className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl text-xs font-bold text-slate-700 border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm group"
                       >
                          <Mail className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                          alexpalacio29@gmail.com
                       </a>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Trayectoria Profecional</h4>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">
                         Alexander Palacio Espiritusanto es un educador dominicano y gestor educativo, enfocado en el desarrollo de soluciones modernas que fortalecen la administración escolar y elevan la eficiencia institucional.
                       </p>
                    </div>

                    <div className="space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Formación Académica</h4>
                       <div className="space-y-3">
                         <div className="flex gap-3">
                           <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full" />
                           <p className="text-sm text-slate-700 font-bold">Máster en Educación (Gestión Educativa) <span className="text-slate-400 text-xs font-medium ml-1">2023</span></p>
                         </div>
                         <div className="flex gap-3">
                           <div className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full" />
                           <p className="text-sm text-slate-700 font-bold">Licenciado en Teología <span className="text-slate-400 text-xs font-medium ml-1">2012</span></p>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Experiencia y Visión</h4>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">
                         Con más de catorce años de experiencia en el área educativa, ha trabajado como docente y formador en distintos centros educativos. Actualmente desempeña el cargo de subdirector administrativo en el Centro Educativo Cristiano Génesis (Distrito 12-01).
                       </p>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium mt-3 italic">
                         "Mi propósito es mejorar la calidad educativa mediante herramientas prácticas y tecnológicas que aporten eficiencia y transparencia al sector."
                       </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                       <div className="flex gap-3">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alexander Palacio E.</span>
                       </div>
                       <img src="/logo-gestify.png" alt="GestiFy" className="h-6 opacity-30 grayscale" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black text-slate-900">Recomienda Gestify</h3>
                       <p className="text-sm font-medium text-slate-500">Haz que otros gestionen de forma moderna 🇩🇴</p>
                    </div>
                    <button onClick={() => setShowShareModal(false)} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative group">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                       {shareMessage}
                    </p>
                    <button 
                      onClick={copyToClipboard}
                      className="absolute bottom-4 right-4 bg-white shadow-lg border border-slate-100 p-2 rounded-xl text-slate-400 hover:text-emerald-600 transition-all"
                    >
                       {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {copied && <span className="absolute -top-10 right-0 bg-slate-900 text-white text-[10px] py-1 px-3 rounded-full animate-bounce">¡Copiado!</span>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-[#25D366]/10 text-[#25D366] p-4 rounded-2xl font-bold hover:bg-[#25D366]/20 transition-all group"
                    >
                       <div className="w-10 h-10 bg-[#25D366] text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#25D366]/20">
                          <MessageCircle className="w-5 h-5" />
                       </div>
                       WhatsApp
                    </a>
                    <a 
                      href={`mailto:?subject=Recomendación: GestiFy RD&body=${encodeURIComponent(shareMessage)}`}
                      className="flex items-center gap-3 bg-blue-50 text-blue-600 p-4 rounded-2xl font-bold hover:bg-blue-100 transition-all group"
                    >
                       <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                          <Mail className="w-5 h-5" />
                       </div>
                       Email
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-slate-50 text-slate-900 p-4 rounded-2xl font-bold hover:bg-slate-100 transition-all group"
                    >
                       <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-slate-200">
                          <Twitter className="w-5 h-5" />
                       </div>
                       Twitter
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://gestifyrd.com')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-[#1877F2]/10 text-[#1877F2] p-4 rounded-2xl font-bold hover:bg-[#1877F2]/20 transition-all group"
                    >
                       <div className="w-10 h-10 bg-[#1877F2] text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#1877F2]/20">
                          <Facebook className="w-5 h-5" />
                       </div>
                       Facebook
                    </a>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
               <img src="/logo-gestify.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <span className="text-2xl font-black tracking-tight text-slate-900">GestiFy <span className="text-emerald-600">RD</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            <nav className="flex items-center gap-6 lg:gap-8">
              {['Inicio', 'Funciones', 'Reportes', 'Tutorial', 'Planes', 'Contacto'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors whitespace-nowrap">{item}</a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <button 
                  onClick={onGoToDashboard}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100/50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Mi Panel</span>
                </button>
              ) : (
                <button 
                  onClick={onLogin}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  <Lock className="w-4 h-4" />
                  <span className="whitespace-nowrap">Iniciar Sesión</span>
                </button>
              )}
              
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center justify-center w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                title="Recomendar GestiFy RD"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
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
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-lg shadow-sm"
              >
                📢 Recomendar
              </button>
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
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/M9psBszGwMI?si=r7Wd6Z9-T6L-R9lY" 
                    title="GestiFy RD Tutorial" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
              </div>
           </div>
           <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl font-black text-slate-900 leading-tight">
                Conoce más de <span className="text-emerald-600">GestiFy RD</span>
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
           {/* Left Column: Text + Form */}
           <div className="lg:w-1/2 space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl font-black text-slate-900 leading-tight">¿Háblanos de tu <span className="text-emerald-600">centro educativo</span>?</h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">Estamos listos para ayudarte a transformar tu gestión económica. Completa el formulario y responderemos en menos de 24 horas.</p>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
                  >
                     <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900">¡Solicitud Enviada!</h3>
                     <p className="text-slate-500 font-medium max-w-xs">Gracias por tu interés. Nuestro equipo revisará tu mensaje y te contactará a la brevedad posible.</p>
                     <button 
                       onClick={() => setSubmitted(false)}
                       className="text-emerald-600 font-bold hover:underline"
                     >
                       Enviar otro mensaje
                     </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                           <input 
                             required
                             type="text" 
                             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" 
                             placeholder="Ej: Juan Pérez"
                             value={formData.name}
                             onChange={e => setFormData({ ...formData, name: e.target.value })}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teléfono</label>
                           <input 
                             required
                             type="text" 
                             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" 
                             placeholder="809-000-0000"
                             value={formData.phone}
                             onChange={e => setFormData({ ...formData, phone: e.target.value })}
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Centro Educativo</label>
                           <input 
                             required
                             type="text" 
                             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" 
                             placeholder="Ej: Escuela México"
                             value={formData.center_name}
                             onChange={e => setFormData({ ...formData, center_name: e.target.value })}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distrito</label>
                           <input 
                             required
                             type="text" 
                             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" 
                             placeholder="Ej: 15-02"
                             value={formData.district}
                             onChange={e => setFormData({ ...formData, district: e.target.value })}
                           />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Institucional</label>
                        <input 
                          required
                          type="email" 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm" 
                          placeholder="ejemplo@minerd.gob.do"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">¿En qué podemos ayudarte?</label>
                        <textarea 
                          required
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm resize-none" 
                          placeholder="Escribe tu mensaje aquí..."
                          value={formData.message}
                          onChange={e => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                     </div>
                     <button 
                       type="submit"
                       disabled={isSubmitting}
                       className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                     >
                       {isSubmitting ? 'Enviando...' : 'Enviar solicitud'} <ArrowRight className="w-5 h-5" />
                     </button>
                  </form>
                )}
              </div>
           </div>

           {/* Right Column: Profile + Contact Links */}
           <div className="lg:w-1/2 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
                 <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-emerald-50 shrink-0">
                       <img 
                         src="/alex-palacio.jpg" 
                         alt="Alexander Palacio" 
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Alexander+Palacio+Espiritusanto&background=059669&color=fff&size=200`;
                         }}
                       />
                    </div>
                 <div className="text-center sm:text-left space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Alexander Palacio Espiritusanto</h3>
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Fundador de GestiFy RD</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <p className="text-slate-500 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6">
                    "Educador y gestor dominicano con más de 14 años de trayectoria, enfocado en modernizar la administración escolar. Actualmente subdirector administrativo en el Centro Educativo Cristiano Génesis, dedicado a la transformación digital y eficiencia institucional del sector educativo."
                 </p>
                 
                 <div className="flex flex-wrap gap-x-6 gap-y-3 pl-6">
                    {[
                      'Lic. en Teología', 
                      'Máster en Gestión Educativa', 
                      'Especialista en Gestión de Proyectos'
                    ].map((titulo, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                         <span className="text-xs font-bold text-slate-700">{titulo}</span>
                      </div>
                    ))}
                 </div>
              </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    <a 
                      href="https://wa.me/18294108036"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all font-bold group"
                    >
                       <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200 shrink-0">
                          <MessageCircle className="w-4 h-4" />
                       </div>
                       <div className="text-left overflow-hidden">
                          <p className="text-[8px] font-black uppercase tracking-widest opacity-60 truncate">WhatsApp</p>
                          <p className="text-xs truncate">829-410-8036</p>
                       </div>
                    </a>

                    <a 
                      href="mailto:alexpalacio29@gmail.com"
                      className="flex items-center gap-3 bg-blue-50 text-blue-700 p-3 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all font-bold group"
                    >
                       <div className="w-8 h-8 bg-blue-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-200 shrink-0">
                          <Mail className="w-4 h-4" />
                       </div>
                       <div className="text-left overflow-hidden">
                          <p className="text-[8px] font-black uppercase tracking-widest opacity-60 truncate">Email</p>
                          <p className="text-xs truncate">alexpalacio29@gmail.com</p>
                       </div>
                    </a>
                 </div>
              </div>
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
                 <li><a href="#funciones" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Funciones</a></li><li><a href="#reportes" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Reportes</a></li><li><a href="#funciones" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Seguridad</a></li><li><a href="#planes" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Planes</a></li>
              </ul>
           </div>
           <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Compañía</h4>
              <ul className="space-y-4">
                 <li><button onClick={() => setShowProfile(true)} className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Sobre Nosotros</button></li><li><a href="#contacto" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Contacto</a></li><li><a href="#tutorial" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Tutorial</a></li><li><a href="#contacto" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">Ayuda</a></li>
              </ul>
           </div>
           <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Social</h4>
              <div className="flex gap-4">
                 <a href="tel:+18294108036" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><Phone className="w-5 h-5" /></a>
                 <a href="mailto:alexpalacio29@gmail.com" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><Mail className="w-5 h-5" /></a>
                 <a href="https://wa.me/18294108036" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"><MessageCircle className="w-5 h-5" /></a>
                  <a href="https://www.instagram.com/gestifyrd/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all cursor-pointer"><Instagram className="w-5 h-5" /></a>
                  <a href="https://www.facebook.com/profile.php?id=61574283226708" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer"><Facebook className="w-5 h-5" /></a>
                 <a href="https://www.youtube.com/playlist?list=PLT_0ZdzVRrXiICIwZXNX2BSPaizDJmTqA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"><Youtube className="w-5 h-5" /></a>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 GestiFy RD. Todos los derechos reservados.</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Potenciando la educación con transparencia</p>
        </div>
      </footer>
    </div>
  );
}
