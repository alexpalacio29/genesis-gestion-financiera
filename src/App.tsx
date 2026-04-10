import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Trash2,
  ShoppingCart,
  Hammer,
  CreditCard,
  Landmark,
  Wallet,
  PieChart,
  ChevronRight,
  Plus,
  Search,
  Download,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileSpreadsheet,
  Save,
  CheckCircle2,
  Info,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  AlertCircle,
  Calendar,
  LogOut,
  Building2,
  Settings,
  Image as ImageIcon,
  Edit,
  FileImage,
  Upload,
  Shield,
  Lock,
  RefreshCw,
} from 'lucide-react';
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateYYYYMMDD,
  generateQuotePDF,
  generateCheckPDF,
  generateRetentionCertPDF,
  generateITBISRetentionCertPDF,
  generateCheckRequestLetterPDF,
  generateRequisitionPDF,
  generatePurchaseOrderPDF,
  generateLaborReceiptPDF,
  generateCheckCalculationSheetPDF,
  generateServiceRequestPDF,
  generateCashBookReportPDF,
  generateBankBookReportPDF,
  generatePettyCashReportPDF,
  generateInventoryReportPDF,
  exportCashBookToExcel,
  generateGeneralReportPDF,
  exportOfficialMinerdReport,
  generateBankReconciliationPDF
} from './lib/utils';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void, key?: string | number }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
      active
        ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400")} />
    <span>{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
  </button>
);

const StatCard = ({ label, value, icon: Icon, trend, color }: { label: string, value: string | number, icon: any, trend?: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
    <p className="text-xs lg:text-sm font-bold text-slate-900 break-words" title={String(value)}>{value}</p>
  </div>
);

// --- Auth Components ---

const Auth = ({ onLogin }: { onLogin: (user: any, centers: any[]) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en la autenticación');

      if (isRegister) {
        setIsRegister(false);
        alert('Registro exitoso. Por favor inicia sesión.');
      } else {
        onLogin(data.user, data.centers);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-sm border border-slate-100">
            <img src="/favicon.png" alt="Edugestion Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegister ? 'Crear Cuenta' : 'Bienvenido de Nuevo'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isRegister ? 'Regístrate para gestionar tus centros' : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
            <input
              type="email"
              required
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CenterSelector = ({ user, centers, onSelect, onAdd, onLogout }: { user: any, centers: any[], onSelect: (center: any) => void, onAdd: () => void, onLogout?: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      {onLogout && (
        <button
          onClick={onLogout}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2 px-4 py-2 bg-white text-rose-600 rounded-xl font-bold shadow-sm border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      )}
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2 mt-12 sm:mt-0">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tus Centros Educativos</h1>
          <p className="text-slate-500 font-medium">Selecciona el centro que deseas gestionar hoy</p>
          {user?.email?.toLowerCase() === 'alexpalacio29@gmail.com' && (
            <div className="pt-4">
              <button
                onClick={() => onSelect({ id: 0, name: 'ADMINISTRACIÓN GLOBAL SAAS', rnc: 'SaaS-Global' })}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                <Lock className="w-4 h-4" />
                Ir al Panel SaaS Global
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.map(center => (
            <button
              key={center.id}
              onClick={() => onSelect(center)}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <Building2 className="w-6 h-6 text-slate-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{center.name}</h3>
                  <p className="text-xs text-slate-400">RNC: {center.rnc}</p>
                </div>
              </div>
            </button>
          ))}

          <button
            onClick={onAdd}
            className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-white transition-all text-center group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-colors shadow-sm">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
              </div>
              <span className="font-bold text-slate-500 group-hover:text-slate-900">Agregar Nuevo Centro</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const CenterForm = ({ userId, onCancel, onSuccess }: { userId: number, onCancel: () => void, onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [rnc, setRnc] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [juntaName, setJuntaName] = useState('');
  const [codigoNo, setCodigoNo] = useState('');
  const [codigoDep, setCodigoDep] = useState('');
  const [cuentaNo, setCuentaNo] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, rnc, address, phone, email, userId, registrationCode,
          junta_name: juntaName,
          codigo_no: codigoNo,
          codigo_dependencia: codigoDep,
          cuenta_no: cuentaNo
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear centro');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Error al crear el centro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-2xl w-full rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-slate-900">Configurar Centro</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre del Centro</label>
              <input type="text" required className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre de la Junta</label>
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={juntaName} onChange={e => setJuntaName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Código No.</label>
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={codigoNo} onChange={e => setCodigoNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Código Dependencia</label>
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={codigoDep} onChange={e => setCodigoDep(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cuenta No.</label>
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={cuentaNo} onChange={e => setCuentaNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RNC</label>
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={rnc} onChange={e => setRnc(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono</label>
              <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correo (Opcional)</label>
              <input type="email" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 font-bold">Código de Gestor (Requerido)</label>
            <input
              type="text"
              required
              placeholder="Ingresa el código proporcionado por el administrador"
              className="w-full p-3 bg-emerald-50 border-2 border-emerald-100 rounded-xl outline-none focus:border-emerald-500 transition-colors font-mono uppercase"
              value={registrationCode}
              onChange={e => setRegistrationCode(e.target.value)}
            />
            <p className="text-[9px] text-slate-400">Este código es único y le permite crear su institución en la plataforma.</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dirección</label>
            <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 p-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
              {loading ? 'Guardando...' : 'Crear Centro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Views ---
const BankReconciliation = ({ apiFetch, currentCenter }: { apiFetch: any, currentCenter: any }) => {
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    period_date: '',
    bank_balance: '',
    book_balance: '',
    deposits_in_transit: '0',
    checks_in_transit: '0',
    deposits_month: '0',
    notes_credit: '0',
    notes_debit: '0',
    bank_commissions: '0',
    prepared_by: '',
    reviewed_by: '',
    authorized_by: ''
  });

  const fetchReconciliations = useCallback(async () => {
    const res = await apiFetch('/api/bank/reconciliations');
    if (res && res.ok) setReconciliations(await res.json());
  }, [apiFetch]);

  useEffect(() => {
    fetchReconciliations();
  }, [fetchReconciliations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/bank/reconciliations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        fetchReconciliations();
        alert('Conciliación guardada correctamente');
      }
    } catch (e) {
      alert('Error al guardar la conciliación');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = (rec: any) => {
    generateBankReconciliationPDF(rec, currentCenter);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Conciliación Bancaria</h2>
          <p className="text-slate-500">Gestión de estados bancarios y conciliación trimestral</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Nueva Conciliación
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95">
          <h3 className="text-lg font-bold">Registrar Estado del Mes / Trimestre</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periodo (Ej: Marzo 2026)</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={formData.period_date} onChange={e => setFormData({...formData, period_date: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance según Banco</label>
                <input required type="number" step="0.01" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={formData.bank_balance} onChange={e => setFormData({...formData, bank_balance: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance según Libros</label>
                <input required type="number" step="0.01" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" value={formData.book_balance} onChange={e => setFormData({...formData, book_balance: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">Ajustes de Banco</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Depósitos en Tránsito (+)</label>
                  <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none" value={formData.deposits_in_transit} onChange={e => setFormData({...formData, deposits_in_transit: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cheques en Tránsito (-)</label>
                  <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none" value={formData.checks_in_transit} onChange={e => setFormData({...formData, checks_in_transit: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">Ajustes de Libros</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notas de Crédito (+)</label>
                    <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none" value={formData.notes_credit} onChange={e => setFormData({...formData, notes_credit: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notas de Débito (-)</label>
                    <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none" value={formData.notes_debit} onChange={e => setFormData({...formData, notes_debit: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comisiones Bancarias (-)</label>
                  <input type="number" step="0.01" className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none" value={formData.bank_commissions} onChange={e => setFormData({...formData, bank_commissions: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <input placeholder="Preparado por" className="p-2 border rounded-lg text-[11px] font-medium" value={formData.prepared_by} onChange={e => setFormData({...formData, prepared_by: e.target.value})} />
              <input placeholder="Revisado por" className="p-2 border rounded-lg text-[11px] font-medium" value={formData.reviewed_by} onChange={e => setFormData({...formData, reviewed_by: e.target.value})} />
              <input placeholder="Autorizado por" className="p-2 border rounded-lg text-[11px] font-medium" value={formData.authorized_by} onChange={e => setFormData({...formData, authorized_by: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-900 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                {loading ? 'Guardando...' : 'Guardar y Finalizar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periodo</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance Banco</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance Libros</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Registro</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reconciliations.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 italic font-medium">No hay conciliaciones registradas.</td>
              </tr>
            ) : reconciliations.map(rec => (
              <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-900">{rec.period_date}</td>
                <td className="p-4 text-slate-600 font-medium">{formatCurrency(rec.bank_balance)}</td>
                <td className="p-4 text-slate-600 font-medium">{formatCurrency(rec.book_balance)}</td>
                <td className="p-4 text-[10px] text-slate-400 font-mono tracking-tighter">{new Date(rec.created_at).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleGeneratePDF(rec)}
                    className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight hover:bg-emerald-100 inline-flex items-center gap-2 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Generar Reporte
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const Dashboard = ({ onNavigate, apiFetch, currentCenter }: { onNavigate: (tab: string) => void, apiFetch: any, currentCenter: any }) => {
  const [execution, setExecution] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    // Fetch Budget Execution
    apiFetch(`/api/budget-execution?year=${currentYear}`)
      .then((res: any) => res.json())
      .then((data: any) => setExecution(data));

    // Fetch Dashboard Stats
    apiFetch('/api/stats')
      .then((res: any) => res.json())
      .then((data: any) => setStats(data));
  }, [apiFetch, currentYear]);


  const data = stats?.cashFlow || [];

  const COLORS = ['#0f172a', '#334155', '#475569', '#64748b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Resumen Financiero</h1>
          <p className="text-slate-500">Vista general del estado de la Junta Descentralizada</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              if (confirm('¿Deseas descargar una copia de seguridad completa con todos los datos de este centro educativo?')) {
                try {
                  const res = await apiFetch('/api/export-center-data');
                  const data = await res.json();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Respaldo_${currentCenter?.name || 'Centro'}_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } catch (e) {
                  alert('Error al exportar datos');
                }
              }
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            Copia de Seguridad (JSON)
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {execution && execution.total_budgeted > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900">Ejecución Presupuestaria {currentYear}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-900" />
                  <span className="text-xs text-slate-500">Presupuestado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-500">Ejecutado</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {execution.allocations.map((a: any) => (
                <div key={a.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{a.category}</span>
                    <span className="text-slate-500">{formatCurrency(a.executed)} / {formatCurrency(a.budgeted)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-1000",
                        a.percent > 100 ? "bg-rose-500" : a.percent > 80 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(a.percent, 100)}%` }}
                    />
                  </div>
                  {a.percent > 100 && (
                    <p className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Presupuesto excedido
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-1">Total Ejecutado</h3>
              <p className="text-lg sm:text-xl font-black text-white break-words">{formatCurrency(execution.total_executed)}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                <span className="text-white text-xs font-bold">{execution.total_budgeted > 0 ? ((execution.total_executed / execution.total_budgeted) * 100).toFixed(1) : 0}% del total</span>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10">
              <div className="flex justify-between items-center text-white/60 text-xs mb-4">
                <span>Presupuesto Total</span>
                <span>{formatCurrency(execution.total_budgeted)}</span>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Gestionar Presupuesto
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Balance Actual (Banco)" value={formatCurrency(stats?.balance || 0)} icon={Landmark} color="bg-slate-900" />
        <StatCard label="Balance Caja Chica" value={formatCurrency(stats?.pettyCashBalance || 0)} icon={Wallet} color="bg-indigo-600" />
        <StatCard label="Ingresos Totales" value={formatCurrency(stats?.income || 0)} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard label="Egresos Totales" value={formatCurrency(stats?.expense || 0)} icon={TrendingDown} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Flujo de Caja</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ingresos" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="egresos" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6">Inversión por Área</h3>
          <div className="h-[250px] flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats?.categorySpending || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="category"
                >
                  {(stats?.categorySpending || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-2">
            {(stats?.categorySpending || []).length > 0 ? (
              stats.categorySpending.map((entry: any, i: number) => (
                <div key={entry.category} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 truncate max-w-[120px]">{entry.category}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(entry.total)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-xs py-4 italic">No hay gastos registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Suppliers = ({ apiFetch }: { apiFetch: any }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', rnc: '', type: 'formal', phone: '', address: '' });

  const fetchSuppliers = useCallback(() => {
    apiFetch('/api/suppliers')
      .then((res: any) => res.json())
      .then((data: any) => {
        setSuppliers(data);
        setLoading(false);
      });
  }, [apiFetch]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(newSupplier)
    });
    setShowForm(false);
    fetchSuppliers();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Suplidores</h2>
          <p className="text-slate-500">Gestión de proveedores formales e informales</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Nuevo Suplidor
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl animate-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold mb-4">Registrar Nuevo Suplidor</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre / Empresa"
              className="p-2 border rounded-lg"
              required
              value={newSupplier.name}
              onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
            />
            <input
              placeholder="RNC / Cédula"
              className="p-2 border rounded-lg"
              value={newSupplier.rnc}
              onChange={e => setNewSupplier({ ...newSupplier, rnc: e.target.value })}
            />
            <select
              className="p-2 border rounded-lg"
              value={newSupplier.type}
              onChange={e => setNewSupplier({ ...newSupplier, type: e.target.value })}
            >
              <option value="formal">Formal (Con RNC)</option>
              <option value="informal">Informal (Persona Física)</option>
            </select>
            <input
              placeholder="Teléfono"
              className="p-2 border rounded-lg"
              value={newSupplier.phone}
              onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
            />
            <div className="md:col-span-2">
              <textarea
                placeholder="Dirección"
                className="w-full p-2 border rounded-lg"
                value={newSupplier.address}
                onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg">Guardar Suplidor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar suplidor por nombre o RNC..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="data-grid-header">Nombre / Empresa</th>
                <th className="data-grid-header">Tipo</th>
                <th className="data-grid-header">RNC</th>
                <th className="data-grid-header">Teléfono</th>
                <th className="data-grid-header text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s: any) => (
                <tr key={s.id} className="data-grid-row">
                  <td className="data-grid-cell font-medium">{s.name}</td>
                  <td className="data-grid-cell">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      s.type === 'formal' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                    )}>
                      {s.type}
                    </span>
                  </td>
                  <td className="data-grid-cell font-mono text-xs">{s.rnc}</td>
                  <td className="data-grid-cell">{s.phone}</td>
                  <td className="data-grid-cell text-right">
                    <button className="text-slate-400 hover:text-slate-900 p-1">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Inventory = ({ apiFetch, minerdCodes }: { apiFetch: any, minerdCodes: any[] }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'code' | 'status'>('date');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ minerd_code: '', quantity: 0, unit_price: 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );

  useEffect(() => {
    apiFetch('/api/inventory')
      .then((res: any) => {
        if (!res.ok) throw new Error('Error al cargar inventario');
        return res.json();
      })
      .then((data: any) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error('Invalid inventory data:', data);
          setItems([]);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setItems([]);
        setLoading(false);
      });
  }, [apiFetch]);

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setEditForm({ minerd_code: item.minerd_code || '', quantity: item.quantity || 0, unit_price: item.unit_price || 0 });
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const res = await apiFetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Error al actualizar inventario');

      setItems(items.map(item => item.id === id ? { ...item, ...editForm } : item));
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar los cambios del inventario.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este producto del inventario? Esta acción no se puede deshacer.')) return;

    try {
      const res = await apiFetch(`/api/inventory/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar producto');

      setItems(items.filter(item => item.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar el producto.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Está seguro de que desea eliminar ${selectedIds.length} productos del inventario? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await apiFetch(`/api/inventory`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) throw new Error('Error al eliminar productos');

      setItems(items.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar los productos.');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredItems = items.filter(item => {
    if (!startDate || !endDate) return true;
    const itemDate = new Date(item.created_at || new Date()).toISOString().split('T')[0];
    return itemDate >= startDate && itemDate <= endDate;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'code') {
      return (a.minerd_code || '').localeCompare(b.minerd_code || '');
    }
    if (sortBy === 'status') {
      const aStatus = a.quantity <= a.min_quantity ? 1 : 0;
      const bStatus = b.quantity <= b.min_quantity ? 1 : 0;
      return bStatus - aStatus;
    }
    // Default sort by date (created_at)
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">INVENTARIO</h2>
          <p className="text-slate-500">Control de activos y clasificación MINERD</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Ordenar por:</span>
            <select
              className="text-xs font-bold bg-transparent outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">Fecha</option>
              <option value="code">Código MINERD</option>
              <option value="status">Estado</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Desde:</span>
            <input
              type="date"
              className="text-xs font-bold bg-transparent outline-none text-slate-700 cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Hasta:</span>
            <input
              type="date"
              className="text-xs font-bold bg-transparent outline-none text-slate-700 cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => generateInventoryReportPDF(sortedItems, startDate, endDate)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Seleccionados ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Productos</h4>
          <p className="text-3xl font-black text-slate-900">{items.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Stock Bajo</h4>
          <p className="text-3xl font-black text-rose-600">{items.filter(i => i.quantity <= i.min_quantity).length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Categorías MINERD</h4>
          <p className="text-3xl font-black text-slate-900">{new Set(items.map(i => i.minerd_code)).size}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                    checked={sortedItems.length > 0 && selectedIds.length === sortedItems.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Código MINERD</th>
                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Producto</th>
                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Categoría</th>
                <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Precio Unit.</th>
                <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Stock</th>
                <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Valor Total</th>
                <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Estado</th>
                <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-400">Cargando inventario...</td></tr>
              ) : sortedItems.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-400">No hay productos en inventario.</td></tr>
              ) : sortedItems.map((i) => (
                <tr key={i.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(i.id) ? 'bg-slate-50' : ''}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      checked={selectedIds.includes(i.id)}
                      onChange={() => handleSelectRow(i.id)}
                    />
                  </td>
                  <td className="p-4">
                    {editingId === i.id ? (
                      <select
                        className="w-full text-xs font-mono font-bold border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500 bg-white"
                        value={editForm.minerd_code}
                        onChange={(e) => setEditForm({ ...editForm, minerd_code: e.target.value })}
                      >
                        <option value="">Seleccionar...</option>
                        {(minerdCodes || []).map(c => (
                           <option key={c.code} value={c.code}>{c.code} - {c.description}</option>
                         ))}

                      </select>
                    ) : (
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                        {i.minerd_code || 'SIN CÓDIGO'}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{i.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {i.category}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-slate-900">
                    {editingId === i.id ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 text-right font-black text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500"
                        value={editForm.unit_price}
                        onChange={(e) => setEditForm({ ...editForm, unit_price: Number(e.target.value) })}
                      />
                    ) : (
                      formatCurrency(i.unit_price || 0)
                    )}
                  </td>
                  <td className="p-4 text-right font-black text-slate-900">
                    {editingId === i.id ? (
                      <input
                        type="number"
                        className="w-20 text-right font-black text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                      />
                    ) : (
                      i.quantity
                    )}
                  </td>
                  <td className="p-4 text-right font-black text-slate-900">
                    {formatCurrency((i.unit_price || 0) * (i.quantity || 0))}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${i.quantity <= i.min_quantity ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {i.quantity <= i.min_quantity ? 'Stock Bajo' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {editingId === i.id ? (
                      <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1">Cancelar</button>
                        <button onClick={() => handleSaveEdit(i.id)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-lg font-bold transition-colors">Guardar</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(i)} className="text-blue-500 hover:text-blue-700 text-xs font-bold transition-colors underline underline-offset-4">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(i.id)} className="p-1 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Eliminar Producto">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Quotes = ({ apiFetch, currentCenter, onNavigate, onEditQuote }: any) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEvidences, setShowEvidences] = useState<number | null>(null);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const fetchEvidences = async (id: number) => {
    try {
      const res = await apiFetch(`/api/quotes/${id}/evidence`);
      const data = await res.json();
      setEvidences(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEvidences = (id: number) => {
    setShowEvidences(id);
    setEvidences([]);
    fetchEvidences(id);
  };

  const handleUploadEvidence = async (e: any) => {
    if (!showEvidences || !e.target.files?.[0]) return;
    setUploadingEvidence(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch(`/api/quotes/${showEvidences}/evidence`, {
        method: 'POST',
        headers: { 'x-center-id': currentCenter?.id?.toString() || '' },
        body: formData
      });
      if (res.ok) fetchEvidences(showEvidences);
    } catch (err) {
      console.error(err);
      alert('Error subiendo evidencia');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const fetchQuotes = useCallback(() => {
    apiFetch('/api/quotes')
      .then((res: any) => res.json())
      .then((data: any) => {
        setQuotes(data);
        setLoading(false);
      });
  }, [apiFetch]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const fetchFullQuote = async (id: number) => {
    try {
      const res = await apiFetch(`/api/quotes/${id}`);
      if (!res.ok) throw new Error('Error al cargar detalles de cotización');
      const data = await res.json();

      // Map description to name for items as expected by PDF generators
      if (data.items && Array.isArray(data.items)) {
        data.items = data.items.map((item: any) => ({
          ...item,
          name: item.name || item.description || 'Producto/Servicio'
        }));
      }

      return data;
    } catch (error) {
      console.error(error);
      alert('Error al cargar datos completos para el PDF');
      return null;
    }
  };

  const handleDeleteQuote = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar permanentemente esta cotización y sus documentos asocicados? Esta acción no se puede deshacer.')) return;
    try {
      const res = await apiFetch(`/api/quotes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar cotización');
      fetchQuotes();
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar la cotización.');
    }
  };

  const handleGeneratePDF = async (quote: any) => {
    const fullData = await fetchFullQuote(quote.id);
    if (!fullData) return;
    generateQuotePDF(fullData.quote, { name: fullData.quote.supplier_name, rnc: fullData.quote.rnc || '000-00000-0', phone: fullData.quote.phone }, fullData.items, currentCenter);
  };

  const getCheckFormatFromQuote = (quote: any) => {
    const amount = quote.total_amount;
    let isr = amount * 0.05;
    let itbis = quote.supplier_type === 'informal' ? (amount / 1.18) * 0.18 : ((amount / 1.18) * 0.18) * 0.30;

    return {
      check_number: `CHQ-${quote.id}`,
      date: quote.created_at,
      amount_gross: amount,
      retention_isr: isr,
      retention_itbis: itbis,
      amount_net: amount - isr - itbis,
      beneficiary: quote.supplier_name,
      description: quote.description || `PAGO DE BIENES Y SERVICIOS` // Usar la descripción real de la cotización
    };
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Cotizaciones</h2>
          <p className="text-slate-500">Gestión de propuestas de materiales y mano de obra</p>
        </div>
        <button
          onClick={() => onNavigate('auto-processor')}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Cotización
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="data-grid-header">Fecha</th>
              <th className="data-grid-header">N. Cotización</th>
              <th className="data-grid-header">Suplidor</th>
              <th className="data-grid-header">Tipo</th>
              <th className="data-grid-header">Monto Total</th>
              <th className="data-grid-header">Estado</th>
              <th className="data-grid-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q: any) => (
              <tr key={q.id} className="data-grid-row">
                <td className="data-grid-cell text-xs font-medium text-slate-500">{formatDate(q.created_at)}</td>
                <td className="data-grid-cell text-xs font-mono font-bold text-indigo-600">{q.quote_number || `#${q.id}`}</td>
                <td className="data-grid-cell font-medium">{q.supplier_name}</td>
                <td className="data-grid-cell">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    q.type === 'labor' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {q.type === 'labor' ? 'Mano de Obra' : 'Materiales'}
                  </span>
                </td>
                <td className="data-grid-cell font-mono">{formatCurrency(q.total_amount)}</td>
                <td className="data-grid-cell">
                  <span className="text-xs text-amber-600 font-medium">{q.status}</span>
                </td>
                <td className="data-grid-cell text-right flex justify-end gap-2 relative">
                  <button
                    onClick={async () => {
                      const newDate = prompt("Ingrese la nueva fecha (AAAA-MM-DD):", q.created_at.split(' ')[0]);
                      if (newDate) {
                        try {
                          const res = await apiFetch(`/api/quotes/${q.id}/date`, {
                            method: 'PATCH',
                            body: JSON.stringify({ date: newDate })
                          });
                          if (!res.ok) throw new Error('Error al actualizar fecha');
                          fetchQuotes();
                        } catch (error) {
                          console.error(error);
                          alert('Hubo un error al actualizar la fecha.');
                        }
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative group"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-indigo-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Cambiar Fecha
                    </span>
                  </button>
                  <button
                    onClick={() => onEditQuote && onEditQuote(q.id)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors relative group"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-amber-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Editar
                    </span>
                  </button>
                  <button
                    onClick={() => handleOpenEvidences(q.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative group"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-blue-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Evidencias
                    </span>
                  </button>
                  <button
                    onClick={() => handleGeneratePDF(q)}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative group"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Cotización
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      const fullData = await fetchFullQuote(q.id);
                      if (!fullData) return;
                      generateRequisitionPDF(fullData.requisition, fullData.quote, fullData.items, currentCenter);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative group"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-blue-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Requisición
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      const fullData = await fetchFullQuote(q.id);
                      if (!fullData) return;
                      generatePurchaseOrderPDF(fullData.purchase_order, {
                        name: fullData.quote.supplier_name,
                        rnc: fullData.quote.rnc || '000-00000-0',
                        type: fullData.quote.supplier_type,
                        address: fullData.quote.address,
                        phone: fullData.quote.phone
                      }, fullData.items, currentCenter);
                    }}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors relative group"
                  >
                    <Package className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-emerald-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Orden de Compra
                    </span>
                  </button>
                  <button
                    onClick={() => generateCheckPDF(getCheckFormatFromQuote(q), currentCenter?.logo_url)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative group"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-indigo-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Imprimir Cheque
                    </span>
                  </button>
                  <button
                    onClick={() => generateRetentionCertPDF(getCheckFormatFromQuote(q), { name: q.supplier_name, rnc: q.rnc || '000-00000-0' }, currentCenter?.logo_url)}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors relative group"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-teal-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Certificación Retención
                    </span>
                  </button>
                  <button
                    onClick={() => generateCheckRequestLetterPDF(getCheckFormatFromQuote(q), { name: q.supplier_name, rnc: q.rnc || '000-00000-0' }, currentCenter?.logo_url)}
                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors relative group"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-sky-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Carta Solicitud Cheque
                    </span>
                  </button>
                  <button
                    onClick={() => generateLaborReceiptPDF(getCheckFormatFromQuote(q), { name: q.supplier_name, rnc: q.rnc || '000-00000-0' }, currentCenter?.logo_url)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors relative group"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-amber-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Recibo de Pago
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteQuote(q.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors relative group"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-rose-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      Eliminar Cotización
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEvidences && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">Evidencias Fotográficas</h2>
                  <p className="text-xs text-slate-500">Cotización #{showEvidences}</p>
                </div>
              </div>
              <button onClick={() => setShowEvidences(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {evidences.map((ev, i) => (
                  <a key={i} href={`/${ev.file_path}`} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 block">
                    <img src={`/${ev.file_path}`} alt="Evidencia" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-3 pt-8 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] space-x-1 truncate text-white block">{ev.file_name}</p>
                    </div>
                  </a>
                ))}
              </div>

              {evidences.length === 0 && (
                <div className="text-center py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl mb-6">
                  <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-500">No hay evidencias adjuntas</p>
                  <p className="text-xs text-slate-400 mt-1">Sube fotos JPG/PNG de los productos o facturas asociadas a esta cotización.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <label className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white p-4 rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-colors shadow-lg">
                <Upload className="w-5 h-5" />
                {uploadingEvidence ? 'Subiendo...' : 'Subir Nueva Evidencia'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadEvidence} disabled={uploadingEvidence} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Checks = ({ apiFetch }: { apiFetch: any }) => {
  const [checks, setChecks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [newCheck, setNewCheck] = useState({
    check_number: '',
    date: new Date().toISOString().split('T')[0],
    amount_gross: 0,
    supplier_id: '',
    beneficiary: '',
    description: ''
  });

  useEffect(() => {
    apiFetch('/api/checks').then((res: any) => res.json()).then(setChecks);
    apiFetch('/api/suppliers').then((res: any) => res.json()).then(setSuppliers);
  }, [apiFetch]);

  const calculateRetentions = (amount: number, supplierId: string) => {
    const supplier = suppliers.find((s: any) => s.id === parseInt(supplierId)) as any;
    if (!supplier) return { isr: 0, itbis: 0, net: amount };

    let isr = amount * 0.05; // Standard 5% ISR
    let itbis = 0;

    if (supplier.type === 'informal') {
      // 100% ITBIS retention for informal suppliers (assuming 18% ITBIS included in gross or calculated)
      // For simplicity, let's assume gross is the base and ITBIS is added/extracted
      itbis = (amount / 1.18) * 0.18;
    } else {
      // 30% of 18% ITBIS for formal services
      itbis = ((amount / 1.18) * 0.18) * 0.30;
    }

    return { isr, itbis, net: amount - isr - itbis };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isr, itbis, net } = calculateRetentions(newCheck.amount_gross, newCheck.supplier_id);
    const supplier = suppliers.find((s: any) => s.id === parseInt(newCheck.supplier_id)) as any;

    await apiFetch('/api/checks', {
      method: 'POST',
      body: JSON.stringify({
        ...newCheck,
        retention_isr: isr,
        retention_itbis: itbis,
        amount_net: net,
        beneficiary: supplier?.name || newCheck.beneficiary
      })
    });

    setShowForm(false);
    apiFetch('/api/checks').then((res: any) => res.json()).then(setChecks);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Historial de Cheques Procesados</h2>
          <p className="text-slate-500">Registro histórico de cheques emitidos y anulación</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Emitir Cheque
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <h3 className="text-lg font-bold mb-4">Nuevo Cheque</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Número de Cheque"
              className="p-2 border rounded-lg"
              required
              value={newCheck.check_number}
              onChange={e => setNewCheck({ ...newCheck, check_number: e.target.value })}
            />
            <input
              type="date"
              className="p-2 border rounded-lg"
              required
              value={newCheck.date}
              onChange={e => setNewCheck({ ...newCheck, date: e.target.value })}
            />
            <select
              className="p-2 border rounded-lg"
              required
              value={newCheck.supplier_id}
              onChange={e => setNewCheck({ ...newCheck, supplier_id: e.target.value })}
            >
              <option value="">Seleccionar Suplidor</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Monto Bruto (RD$)"
              className="p-2 border rounded-lg"
              required
              value={newCheck.amount_gross || ''}
              onChange={e => setNewCheck({ ...newCheck, amount_gross: parseFloat(e.target.value) })}
            />
            <input
              placeholder="Concepto / Descripción"
              className="p-2 border rounded-lg md:col-span-2"
              required
              value={newCheck.description}
              onChange={e => setNewCheck({ ...newCheck, description: e.target.value })}
            />
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg">Generar Cheque</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="data-grid-header">No. Cheque</th>
              <th className="data-grid-header">Beneficiario</th>
              <th className="data-grid-header">Monto Bruto</th>
              <th className="data-grid-header">Ret. ISR (5%)</th>
              <th className="data-grid-header">Ret. ITBIS</th>
              <th className="data-grid-header">Monto Neto</th>
              <th className="data-grid-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c: any) => (
              <tr key={c.id} className="data-grid-row">
                <td className="data-grid-cell font-mono font-bold">{c.check_number}</td>
                <td className="data-grid-cell">{c.beneficiary}</td>
                <td className="data-grid-cell text-slate-500">{formatCurrency(c.amount_gross)}</td>
                <td className="data-grid-cell text-rose-600">-{formatCurrency(c.retention_isr)}</td>
                <td className="data-grid-cell text-rose-600">-{formatCurrency(c.retention_itbis)}</td>
                <td className="data-grid-cell font-bold">{formatCurrency(c.amount_net)}</td>
                <td className="data-grid-cell text-right flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      if (confirm('¿Está seguro de que desea anular este cheque? Esta acción no se puede deshacer.')) {
                        try {
                          const res = await apiFetch(`/api/checks/${c.id}`, { method: 'DELETE' });
                          if (res.ok) {
                            apiFetch('/api/checks').then((res: any) => res.json()).then(setChecks);
                          } else {
                            alert('Error al anular cheque');
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Anular Cheque"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BankBook = ({ apiFetch }: { apiFetch: any }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [apiFetch]);

  const fetchEntries = () => {
    apiFetch('/api/cash-book')
      .then((res: any) => res.json())
      .then((data: any) => {
        setEntries(data);
        setLoading(false);
      });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este movimiento bancario? Esto recalculará los balances del Dashboard inmediatamente.')) return;

    try {
      const res = await apiFetch(`/api/cash-book/${id}`, { method: 'DELETE' });
      const data = await res?.json();
      if (data.success) {
        fetchEntries();
      } else {
        alert('Error al eliminar: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error en la conexión.');
    }
  };

  const currentBalance = entries.length > 0 ? entries[0].balance : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">ESTADO BANCARIO EN LÍNEA</h2>
          <p className="text-slate-500">Sincronización directa con el libro de ingresos y egresos.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Conectado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden">
          <div className="relative z-10 w-full pr-12">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Balance Disponible</p>
            <h3 className="text-2xl font-black break-words">{formatCurrency(currentBalance)}</h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Fondos Actualizados</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Landmark className="w-32 h-32" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Ingresos</p>
            <h3 className="text-xl font-black text-emerald-600 break-words">
              {formatCurrency(entries.reduce((acc, e) => acc + e.income, 0))}
            </h3>
          </div>
          <div className="mt-4 h-1 bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Egresos</p>
            <h3 className="text-xl font-black text-rose-600 break-words">
              {formatCurrency(entries.reduce((acc, e) => acc + e.expense, 0))}
            </h3>
          </div>
          <div className="mt-4 h-1 bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 w-full" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Movimientos Recientes</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referencia</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">Consultando banco...</td></tr>
              ) : entries.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500">{formatDate(t.date)}</td>
                  <td className="p-4 font-mono text-xs font-bold">{t.reference_no || 'TRANSF'}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{t.beneficiary}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{t.concept}</p>
                  </td>
                  <td className={`p-4 text-right font-black ${t.income > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.income > 0 ? `+${formatCurrency(t.income)}` : `-${formatCurrency(t.expense)}`}
                  </td>
                  <td className="p-4 text-right font-mono text-xs font-bold text-slate-400">
                    {formatCurrency(t.balance)}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Eliminar Transacción">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AutoProcessor = ({ apiFetch, currentCenter, user, onNavigate, quoteToEdit, setQuoteToEdit, minerdCodes }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>({
    supplierType: 'formal',
    quoteType: 'materials',
    date: new Date().toISOString().split('T')[0],
    poaYear: 2026,
    ncf: '',
    checkNumber: '',
    concept: '',
    inputMode: 'excel' // 'manual', 'excel', 'pdf'
  });
  const [processing, setProcessing] = useState(false);
  const [suggestingCodes, setSuggestingCodes] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [manualItems, setManualItems] = useState<any[]>([{ name: '', quantity: 1, unit_price: 0, minerd_code: '' }]);
  const [manualSupplier, setManualSupplier] = useState<any>({ name: '', rnc: '', address: '', phone: '' });
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    'quote', 'requisition', 'po', 'check', 'calc', 'retention', 'letter'
  ]);

  const availableDocs = [
    { id: 'quote', label: 'Cotización' },
    { id: 'requisition', label: 'Requisición' },
    { id: 'po', label: 'Orden de Compra' },
    { id: 'check', label: 'Cheque' },
    { id: 'calc', label: 'Planilla de Cálculos' },
    { id: 'retention', label: 'Cert. de Retención (ISR / Conjunta)' },
    { id: 'retention_itbis', label: 'Cert. Retención 100% ITBIS', onlyInformal: true },
    { id: 'letter', label: 'Carta de Solicitud' },
    { id: 'service', label: 'Solicitud de Servicio', onlyLabor: true },
    { id: 'receipt', label: 'Recibo de Pago', onlyLabor: true },
  ];

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (quoteToEdit) {
      setProcessing(true);
      apiFetch(`/api/quotes/${quoteToEdit}`)
        .then((res: any) => res.json())
        .then((data: any) => {
          if (!data || data.error) throw new Error(data?.error || 'No encontrado');
          setMetadata((prev: any) => ({
            ...prev,
            supplierType: data.quote.supplier_type,
            quoteType: data.quote.type,
            date: data.check ? data.check.date : data.quote.created_at.split(' ')[0],
            poaYear: data.requisition ? data.requisition.poa_year : 2026,
            ncf: data.purchase_order ? data.purchase_order.ncf : '',
            checkNumber: data.check ? data.check.check_number : '',
            quote_number: data.quote.quote_number || '',
            concept: data.check ? data.check.description : data.quote.description,
            inputMode: 'manual'
          }));

          setManualSupplier({
            name: data.quote.supplier_name,
            rnc: data.quote.rnc || '',
            address: data.quote.address || '',
            phone: data.quote.phone || ''
          });

          if (data.items && data.items.length) {
            setManualItems(data.items.map((i: any) => ({
              name: i.description,
              quantity: i.quantity,
              unit_price: i.unit_price,
              minerd_code: i.minerd_code || ''
            })));
          }

          setPreviewData({
            supplier: { name: data.quote.supplier_name, rnc: data.quote.rnc, phone: data.quote.phone, address: data.quote.address, type: data.quote.supplier_type },
            quote: { type: data.quote.type, total_amount: data.quote.total_amount, subtotal: data.quote.subtotal, itbis: data.quote.itbis, description: data.quote.description || (data.check && data.check.description), quote_number: data.quote.id },
            items: data.items.map((i: any) => ({ name: i.description, quantity: i.quantity, unit_price: i.unit_price, total: i.total, minerd_code: i.minerd_code || '' }))
          });
          setProcessing(false);
        })
        .catch((err: any) => {
          console.error(err);
          setProcessing(false);
          alert('Error cargando la cotización para editar');
          if (setQuoteToEdit) setQuoteToEdit(null);
        });
    }
  }, [quoteToEdit, apiFetch]);



  const suggestMinerdCodes = async (items: any[]) => {
    try {
      const response = await apiFetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      const suggestedCodes = await response?.json() || [];
      return items.map((item, index) => ({
        ...item,
        minerd_code: item.minerd_code || suggestedCodes[index] || ''
      }));
    } catch (error) {
      console.error("Error suggesting MINERD codes:", error);
      return items.map(item => ({ ...item, minerd_code: item.minerd_code || '' }));
    }
  };

  const handleAutoSuggestCodes = async () => {
    if (manualItems.length === 0 || manualItems.every(i => !i.name.trim())) return;
    setSuggestingCodes(true);
    try {
      const itemsWithCodes = await suggestMinerdCodes(manualItems);
      setManualItems(itemsWithCodes);
    } catch (error) {
      console.error(error);
      alert('Error al sugerir códigos con IA.');
    } finally {
      setSuggestingCodes(false);
    }
  };

  const handleManualSubmit = async () => {
    setResult(null);
    const subtotal = manualItems.reduce((acc, curr) => acc + (curr.unit_price * curr.quantity), 0);
    const itbis = subtotal * 0.18;
    const total = subtotal + itbis;
    const description = metadata.concept || (manualItems.length > 0 ? manualItems[0].name : 'Adquisición de materiales');

    const itemsWithCodes = await suggestMinerdCodes(manualItems);

    setPreviewData({
      supplier: { ...manualSupplier, type: metadata.supplierType },
      quote: { type: metadata.quoteType, total_amount: total, subtotal, itbis, description, quote_number: Math.floor(Math.random() * 10000).toString() },
      items: itemsWithCodes
    });
  };

  const handleImageProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiFetch('/api/quotes/parse-image', {
        method: 'POST',
        headers: {
          // fetch automatically sets multipart/form-data with the correct boundary when passing FormData
        },
        body: formData
      });

      let data;
      if (response?.ok) {
        data = await response.json();
      } else {
        const errText = await response?.text();
        let errMsg = "Error al procesar la imagen en el servidor.";
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }
      
      const items = data.items || [];
      const description = metadata.concept || (items.length > 0 ? items[0].description : 'Adquisición de materiales');


      // Calculate totals since AI might not return them perfectly
      const subtotal = items.reduce((acc: number, item: any) => acc + (item.total || 0), 0);
      const itbis = subtotal * 0.18;
      const total = subtotal + itbis;


      setPreviewData({
        supplier: { 
          name: data.supplier_name || 'Desconocido', 
          rnc: data.supplier_rnc || '', 
          address: data.supplier_address || '', 
          phone: data.supplier_phone || '', 
          type: metadata.supplierType 
        },
        quote: {
          type: metadata.quoteType,
          total_amount: total,
          subtotal: subtotal,
          itbis: itbis,
          description,
          quote_number: Math.floor(Math.random() * 10000).toString()
        },
        items: items.map((i: any) => ({
          name: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total: i.total || (i.quantity * i.unit_price),
          minerd_code: i.minerd_code || ''
        }))
      });
      setProcessing(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al procesar la imagen con IA.');
      setProcessing(false);
    }
  };

  const handlePDFProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        const response = await apiFetch('/api/ai/extract-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ base64Data })
        });

        let data;
        if (response?.ok) {
          data = await response.json();
        } else {
          throw new Error("Failed to process PDF on backend");
        }
        
        const items = data.items || [];
        const description = metadata.concept || (items.length > 0 ? items[0].name : 'Adquisición de materiales');

        const itemsWithCodes = await suggestMinerdCodes(items);


        setPreviewData({
          supplier: { ...data.supplier, type: metadata.supplierType },
          quote: {
            type: metadata.quoteType,
            total_amount: data.total || 0,
            subtotal: data.subtotal || 0,
            itbis: data.itbis || 0,
            description,
            quote_number: data.quote_number || ''
          },
          items: itemsWithCodes
        });
        setProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert('Error al procesar el PDF con IA.');
      setProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setPreviewData(null);
      setResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const findValue = (label: string) => {
          for (const row of allRows) {
            if (!row) continue;
            const rowStr = row.join(' ');
            if (rowStr.toLowerCase().includes(label.toLowerCase())) {
              // Case 1: Label and value in same cell with colon
              if (rowStr.includes(':')) {
                return rowStr.split(':')[1]?.trim() || '';
              }

              // Case 2: Label and value in different cells or same cell without colon
              const labelIndex = row.findIndex(cell => cell && cell.toString().toLowerCase().includes(label.toLowerCase()));
              if (labelIndex !== -1) {
                const cellContent = row[labelIndex].toString();
                // If cell contains more than just the label, extract the rest
                if (cellContent.toLowerCase().trim() !== label.toLowerCase().trim()) {
                  const regex = new RegExp(label, 'i');
                  return cellContent.replace(regex, '').replace(/^[:\s-]+/, '').trim();
                }
                // Otherwise check next cell
                if (row[labelIndex + 1]) {
                  return row[labelIndex + 1].toString().trim();
                }
              }
            }
          }
          return '';
        };

        const supplierName = findValue('Suplidor') || 'Suplidor Extraído';
        const rnc = findValue('RNC') || '000-00000-0';
        const address = findValue('Dirección') || 'N/A';
        const phone = findValue('Telefono') || 'N/A';
        const quoteNumber = findValue('N. Cotización') || findValue('Cotización No') || Math.floor(Math.random() * 10000).toString();

        let headerRowIndex = -1;
        let colIndices = { qty: 0, desc: 1, price: 2, total: 3 };

        for (let i = 0; i < allRows.length; i++) {
          const row = allRows[i];
          if (!row) continue;
          const rowStr = row.join(' ').toLowerCase();
          if ((rowStr.includes('cantidad') || rowStr.includes('cant.')) &&
            (rowStr.includes('descripción') || rowStr.includes('desc'))) {
            headerRowIndex = i;
            // Find exact indices based on headers
            const qIdx = row.findIndex(c => {
              const s = c?.toString().toLowerCase() || '';
              return s.includes('cantidad') || s.includes('cant');
            });
            const dIdx = row.findIndex(c => {
              const s = c?.toString().toLowerCase() || '';
              return s.includes('descripción') || s.includes('desc');
            });
            const pIdx = row.findIndex(c => {
              const s = c?.toString().toLowerCase() || '';
              return s.includes('precio') || s.includes('unit');
            });
            const tIdx = row.findIndex(c => {
              const s = c?.toString().toLowerCase() || '';
              return s.includes('total') || s.includes('importe');
            });

            if (qIdx !== -1) colIndices.qty = qIdx;
            if (dIdx !== -1) colIndices.desc = dIdx;
            if (pIdx !== -1) colIndices.price = pIdx;
            if (tIdx !== -1) colIndices.total = tIdx;
            break;
          }
        }

        let items: any[] = [];
        let subtotal = 0;
        let itbis = 0;
        let total = 0;

        if (headerRowIndex !== -1) {
          for (let i = headerRowIndex + 1; i < allRows.length; i++) {
            const row = allRows[i];
            if (!row || row.length === 0) continue;

            const rowStr = row.join(' ').toUpperCase();

            if (rowStr.includes('SUB TOTAL') || rowStr.includes('SUBTOTAL')) {
              const val = row.find((c, idx) => idx >= colIndices.price && !isNaN(parseFloat(c)));
              subtotal = parseFloat(val) || 0;
              continue;
            }
            if (rowStr.includes('ITBIS')) {
              const val = row.find((c, idx) => idx >= colIndices.price && !isNaN(parseFloat(c)));
              itbis = parseFloat(val) || 0;
              continue;
            }
            if (rowStr.includes('TOTAL') && !rowStr.includes('SUB TOTAL')) {
              const val = row.find((c, idx) => idx >= colIndices.price && !isNaN(parseFloat(c)));
              total = parseFloat(val) || 0;
              if (total > 0) break;
              continue;
            }

            // Try to extract item
            const qty = parseFloat(row[colIndices.qty]);
            const desc = row[colIndices.desc];

            if (!isNaN(qty) && desc && desc.toString().trim() !== '' && desc.toString().length > 2) {
              items.push({
                quantity: qty,
                name: desc.toString().trim(),
                unit_price: parseFloat(row[colIndices.price]) || 0,
                total: parseFloat(row[colIndices.total]) || 0
              });
            } else if (items.length > 0 && rowStr.trim() === '') {
              // Possible end of table if we already have items and hit an empty row
              // But we keep going to find totals
              continue;
            }
          }
        }

        // Fallback: If no items found via headers, try to find any row that looks like an item
        if (items.length === 0) {
          for (const row of allRows) {
            if (!row || row.length < 2) continue;
            // Look for a row where one cell is a number and another is a long string
            const numIdx = row.findIndex(c => !isNaN(parseFloat(c)) && parseFloat(c) > 0 && parseFloat(c) < 1000);
            const strIdx = row.findIndex(c => c && c.toString().length > 5 && isNaN(parseFloat(c)));

            if (numIdx !== -1 && strIdx !== -1 && numIdx !== strIdx) {
              // Avoid rows that are likely headers or totals
              const rowStr = row.join(' ').toUpperCase();
              if (rowStr.includes('TOTAL') || rowStr.includes('RNC') || rowStr.includes('TEL')) continue;

              items.push({
                quantity: parseFloat(row[numIdx]),
                name: row[strIdx].toString().trim(),
                unit_price: 0, // We don't know which one is price
                total: 0
              });
            }
          }
        }

        if (total === 0) {
          subtotal = items.reduce((acc, curr) => acc + (curr.unit_price * curr.quantity), 0);
          itbis = subtotal * 0.18;
          total = subtotal + itbis;
        }

        const description = metadata.concept || (items.length > 0 ? items[0].name : (metadata.quoteType === 'labor' ? 'Servicios de mantenimiento' : 'Adquisición de materiales'));

        const itemsWithCodes = await suggestMinerdCodes(items);

        setPreviewData({
          supplier: { name: supplierName, rnc, phone, address, type: metadata.supplierType },
          quote: { type: metadata.quoteType, total_amount: total, subtotal, itbis, description, quote_number: quoteNumber },
          items: itemsWithCodes
        });
        setProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      alert('Error al leer el archivo Excel.');
      setProcessing(false);
    }
  };

  const handleRegister = async () => {
    if (!previewData) return;
    setProcessing(true);

    try {
      const subtotal = previewData.quote.subtotal;
      const itbis = previewData.quote.itbis;
      const total = previewData.quote.total_amount;


      // Calculations based on subtotal for ISR
      const retention_isr = subtotal * 0.05;

      // Formal: No ITBIS retention. Informal: 100% ITBIS retention.
      const retention_itbis = metadata.supplierType === 'informal' ? itbis : 0;
      const finalDescription = metadata.concept || previewData.quote.description || (metadata.quoteType === 'labor' ? 'Servicios de mantenimiento' : 'Adquisición de materiales');

      const amount_net = total - retention_isr - retention_itbis;

      const sanitizedItems = (previewData.items || []).map((item: any) => ({
        ...item,
        name: item.name || item.description || 'Producto/Servicio'
      }));

      const payload = {
        supplier: previewData.supplier,
        items: sanitizedItems,
        metadata: {
          ...metadata,
          selectedDocs
        },

        quote: {
          ...previewData.quote,
          description: finalDescription,
          date: metadata.date,
          quote_number: metadata.quote_number
        },
        requisition: {
          code: metadata.quote_number ? 'REQ-' + metadata.quote_number : 'REQ-' + Math.floor(Math.random() * 10000).toString(),
          poa_year: metadata.poaYear
        },
        purchase_order: {
          total_amount: total,
          subtotal: subtotal,
          itbis: itbis,
          ncf: metadata.ncf,
          description: finalDescription
        },
        check: {
          check_number: metadata.checkNumber || 'CH-' + Math.floor(Math.random() * 10000),
          date: metadata.date,
          amount_gross: total,
          subtotal: subtotal,
          itbis_total: itbis,
          retention_isr: retention_isr,
          retention_itbis: retention_itbis,
          amount_net: amount_net,
          beneficiary: previewData.supplier.name,
          description: finalDescription
        },
        bank_transaction: {
          type: 'expense',
          amount: total,
          description: `${finalDescription} - ${previewData.supplier.name} (Chq: ${metadata.checkNumber || 'Pendiente'})`,
          date: metadata.date
        }
      };

      const url = quoteToEdit ? `/api/process-bulk/${quoteToEdit}` : '/api/process-bulk';
      const method = quoteToEdit ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      const resData = await response?.json();
      if (resData.success) {
        // Ensure all IDs are present in the result object
        const finalResult = {
          ...payload,
          ids: {
            quoteId: resData.quoteId,
            requisitionId: resData.requisitionId,
            poId: resData.poId,
            checkId: resData.checkId
          }
        };
        setResult(finalResult);
        // Scroll to top to show the success panel
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Error al registrar: ' + resData.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error en el proceso de registro.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadDocs = () => {
    if (!result) return;

    const supplier = result.supplier;
    const quote = { ...result.quote, id: result.ids.quoteId, created_at: metadata.date };
    const requisition = { ...result.requisition, id: result.ids.requisitionId, created_at: metadata.date };
    const po = { ...result.purchase_order, id: result.ids.poId, created_at: metadata.date };
    const check = { ...result.check, id: result.ids.checkId };
    const items = result.items;

    if (selectedDocs.includes('quote')) generateQuotePDF(quote, supplier, items, currentCenter);
    if (selectedDocs.includes('requisition')) generateRequisitionPDF(requisition, quote, items, currentCenter);
    if (selectedDocs.includes('po')) generatePurchaseOrderPDF(po, supplier, items, currentCenter);
    if (selectedDocs.includes('check')) generateCheckPDF(check, currentCenter);
    if (selectedDocs.includes('calc')) generateCheckCalculationSheetPDF(check, supplier, currentCenter);
    if (selectedDocs.includes('retention')) generateRetentionCertPDF(check, supplier, currentCenter);
    if (selectedDocs.includes('retention_itbis')) generateITBISRetentionCertPDF(check, supplier, currentCenter);
    if (selectedDocs.includes('letter')) generateCheckRequestLetterPDF(check, supplier, currentCenter);

    if (metadata.quoteType === 'labor') {
      if (selectedDocs.includes('service')) generateServiceRequestPDF(quote, supplier, currentCenter);
      if (selectedDocs.includes('receipt')) generateLaborReceiptPDF(check, supplier, currentCenter);
    }
  };

  const downloadSingleDoc = (id: string) => {
    if (!result) return;
    const supplier = result.supplier;
    const quote = { ...result.quote, id: result.ids.quoteId, created_at: metadata.date };
    const requisition = { ...result.requisition, id: result.ids.requisitionId, created_at: metadata.date };
    const po = { ...result.purchase_order, id: result.ids.poId, created_at: metadata.date };
    const check = { ...result.check, id: result.ids.checkId };
    const items = result.items;

    switch (id) {
      case 'quote': generateQuotePDF(quote, supplier, items, currentCenter); break;
      case 'requisition': generateRequisitionPDF(requisition, quote, items, currentCenter); break;
      case 'po': generatePurchaseOrderPDF(po, supplier, items, currentCenter); break;
      case 'check': generateCheckPDF(check, currentCenter); break;
      case 'calc': generateCheckCalculationSheetPDF(check, supplier, currentCenter); break;
      case 'retention': generateRetentionCertPDF(check, supplier, currentCenter); break;
      case 'retention_itbis': generateITBISRetentionCertPDF(check, supplier, currentCenter); break;
      case 'letter': generateCheckRequestLetterPDF(check, supplier, currentCenter); break;
      case 'service': generateServiceRequestPDF(quote, supplier, currentCenter); break;
      case 'receipt': generateLaborReceiptPDF(check, supplier, currentCenter); break;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Procesador Automático</h1>
          <p className="text-slate-500">Generación masiva de documentos a partir de Excel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">1. Método de Entrada</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
                { id: 'image', label: 'PDF / JPG (IA)', icon: FileText },
                { id: 'manual', label: 'Manual', icon: Plus },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setMetadata({ ...metadata, inputMode: mode.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    metadata.inputMode === mode.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                      : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                  )}
                >
                  <mode.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">{mode.label}</span>
                </button>
              ))}
            </div>

            {metadata.inputMode === 'manual' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Datos del Suplidor</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre del Suplidor"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manualSupplier.name}
                    onChange={e => setManualSupplier({ ...manualSupplier, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="RNC / Cédula"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={manualSupplier.rnc}
                    onChange={e => setManualSupplier({ ...manualSupplier, rnc: e.target.value })}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Artículos</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAutoSuggestCodes}
                      disabled={suggestingCodes || manualItems.length === 0 || manualItems.every(i => !i.name.trim())}
                      className="text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {suggestingCodes ? (
                        <>
                          <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          Pensando...
                        </>
                      ) : (
                        <>✨ Auto-asignar Códigos</>
                      )}
                    </button>
                    <button
                      onClick={() => setManualItems([...manualItems, { name: '', quantity: 1, unit_price: 0 }])}
                      className="text-xs bg-slate-100 p-1 rounded-md hover:bg-slate-200 transition-colors"
                      title="Agregar Línea"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {manualItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-2 relative group">
                      <button
                        onClick={() => setManualItems(manualItems.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2 h-2" />
                      </button>
                      <input
                        type="text"
                        placeholder="Descripción"
                        className="w-full p-2 border rounded-lg text-xs"
                        value={item.name}
                        onChange={e => {
                          const newItems = [...manualItems];
                          newItems[idx].name = e.target.value;
                          setManualItems(newItems);
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Cant."
                          className="w-full p-2 border rounded-lg text-xs"
                          value={item.quantity}
                          onChange={e => {
                            const newItems = [...manualItems];
                            newItems[idx].quantity = parseFloat(e.target.value) || 0;
                            setManualItems(newItems);
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Precio"
                          className="w-full p-2 border rounded-lg text-xs"
                          value={item.unit_price}
                          onChange={e => {
                            const newItems = [...manualItems];
                            newItems[idx].unit_price = parseFloat(e.target.value) || 0;
                            setManualItems(newItems);
                          }}
                        />
                        <select
                          className="w-full p-2 border rounded-lg text-xs bg-white text-blue-600 font-bold"
                          value={item.minerd_code}
                          onChange={e => {
                            const newItems = [...manualItems];
                            newItems[idx].minerd_code = e.target.value;
                            setManualItems(newItems);
                          }}
                        >
                          <option value="">Código MINERD...</option>
                          {(minerdCodes || []).map((c: any) => (
                            <option key={c.code} value={c.code}>{c.code} - {c.description}</option>
                          ))}
                        </select>
                      </div>


                    </div>
                  ))}
                </div>

                <button
                  onClick={handleManualSubmit}
                  className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  Generar Vista Previa
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-900 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept={metadata.inputMode === 'excel' ? ".xlsx, .xls" : (metadata.inputMode === 'image' ? ".pdf, image/jpeg, image/png, image/jpg" : ".pdf")}
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {metadata.inputMode === 'excel' ? (
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                ) : (
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                )}
                <p className="text-sm text-slate-500">
                  {file ? file.name : `Arrastra o haz clic para subir el ${metadata.inputMode.toUpperCase()}`}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">2. Detalles Adicionales</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Tipo de Suplidor</label>
                <select
                  className="w-full p-2 border rounded-lg mt-1"
                  value={metadata.supplierType}
                  onChange={e => setMetadata({ ...metadata, supplierType: e.target.value })}
                >
                  <option value="formal">Formal (Con RNC)</option>
                  <option value="informal">Informal (Persona Física)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Tipo de Cotización</label>
                <select
                  className="w-full p-2 border rounded-lg mt-1"
                  value={metadata.quoteType}
                  onChange={e => setMetadata({ ...metadata, quoteType: e.target.value })}
                >
                  <option value="materials">Materiales / Productos</option>
                  <option value="labor">Mano de Obra / Servicios</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Fecha del Registro</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg mt-1"
                  value={metadata.date}
                  onChange={e => setMetadata({ ...metadata, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">N. Cotización</label>
                <input
                  type="text"
                  placeholder="Ej: 123456"
                  className="w-full p-2 border rounded-lg mt-1"
                  value={metadata.quote_number}
                  onChange={e => setMetadata({ ...metadata, quote_number: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">NCF (Opcional)</label>
                <input
                  type="text"
                  placeholder="B01..."
                  className="w-full p-2 border rounded-lg mt-1"
                  value={metadata.ncf}
                  onChange={e => setMetadata({ ...metadata, ncf: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Número de Cheque</label>
                <input
                  type="text"
                  placeholder="0001"
                  className="w-full p-2 border rounded-lg mt-1"
                  value={metadata.checkNumber}
                  onChange={e => setMetadata({ ...metadata, checkNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Concepto del Pago</label>
                <textarea
                  placeholder="Ej: Adquisición de materiales didácticos..."
                  className="w-full p-2 border rounded-lg mt-1 h-20 resize-none"
                  value={metadata.concept}
                  onChange={e => setMetadata({ ...metadata, concept: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">Este concepto aparecerá en todos los documentos generados.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {result && (
            <div className="bg-emerald-600 text-white p-10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500 border-4 border-white/20">
              <div className="flex items-center gap-6 mb-8">
                <div className="p-4 bg-white text-emerald-600 rounded-2xl shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">¡REGISTRO COMPLETADO!</h3>
                  <p className="text-emerald-100 text-lg font-medium">La información se guardó correctamente en la base de datos.</p>
                </div>
              </div>

              <div className="bg-white/10 p-6 rounded-2xl mb-8 border border-white/10">
                <p className="text-sm text-emerald-50 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Si las descargas no inician automáticamente, haz clic en los botones de abajo.
                  Asegúrate de permitir "múltiples descargas" en la configuración de tu navegador.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={downloadDocs}
                    className="bg-white text-emerald-700 px-8 py-5 rounded-2xl font-black text-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-8 h-8" />
                    DESCARGAR TODO
                  </button>

                  <button
                    onClick={() => {
                      setResult(null);
                      setPreviewData(null);
                      setFile(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-emerald-900/40 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-emerald-900/60 transition-all flex items-center justify-center gap-4 border-2 border-white/20"
                  >
                    <Plus className="w-6 h-6" />
                    Nuevo Registro
                  </button>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/20">
                <h4 className="text-sm font-black uppercase text-emerald-200 mb-6 tracking-widest">DESCARGAS INDIVIDUALES</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableDocs.map(doc => {
                    if (doc.onlyLabor && metadata.quoteType !== 'labor') return null;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => downloadSingleDoc(doc.id)}
                        className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm transition-all group border border-white/10"
                      >
                        <span className="text-white font-bold">{doc.label}</span>
                        <Download className="w-5 h-5 text-emerald-200 group-hover:text-white group-hover:scale-110 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-2">Acciones Rápidas</h3>
            <p className="text-slate-400 mb-6">Una vez configurado, procesa la información para registrarla en el sistema y generar los documentos.</p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  if (metadata.inputMode === 'excel') handlePreview();
                  else if (metadata.inputMode === 'pdf') handlePDFProcess();
                  else if (metadata.inputMode === 'image') handleImageProcess();
                  else handleManualSubmit();
                }}
                disabled={(metadata.inputMode !== 'manual' && !file) || processing}
                className="flex-1 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? "Procesando..." : (metadata.inputMode === 'image' ? "✨ Extraer Datos con IA" : `1. Procesar ${metadata.inputMode.toUpperCase()}`)}
              </button>

              <button
                onClick={handleRegister}
                disabled={!previewData || processing}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                2. Registrar y Generar
              </button>
            </div>
          </div>

          {previewData && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Resumen y Edición</h3>
                  <p className="text-xs text-slate-500">Revisa y ajusta los datos antes del registro final.</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">Vista Previa</span>
              </div>

              <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Selección de Documentos a Generar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableDocs.map(doc => {
                    if (doc.onlyLabor && metadata.quoteType !== 'labor') return null;
                    return (
                      <label key={doc.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => toggleDoc(doc.id)}
                        />
                        <span className="text-sm text-slate-700 font-medium">{doc.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Datos del Suplidor</h4>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Nombre / Razón Social</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm"
                      value={previewData.supplier.name}
                      onChange={e => setPreviewData({
                        ...previewData,
                        supplier: { ...previewData.supplier, name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">RNC / Cédula</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm"
                      value={previewData.supplier.rnc}
                      onChange={e => setPreviewData({
                        ...previewData,
                        supplier: { ...previewData.supplier, rnc: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Concepto (Manual)</label>
                    <textarea
                      className="w-full p-2 border rounded-lg text-sm h-20 resize-none"
                      value={previewData.quote.description}
                      onChange={e => setPreviewData({
                        ...previewData,
                        quote: { ...previewData.quote, description: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Totales de Cotización</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Sub-Total</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg text-sm"
                        value={previewData.quote.subtotal}
                        onChange={e => {
                          const sub = parseFloat(e.target.value) || 0;
                          const itbis = sub * 0.18;
                          setPreviewData({
                            ...previewData,
                            quote: { ...previewData.quote, subtotal: sub, itbis, total_amount: sub + itbis }
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">ITBIS (18%)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg text-sm bg-white"
                        value={previewData.quote.itbis}
                        onChange={(e) => {
                          const newItbis = parseFloat(e.target.value) || 0;
                          setPreviewData({
                            ...previewData,
                            quote: {
                              ...previewData.quote,
                              itbis: newItbis,
                              total_amount: previewData.quote.subtotal + newItbis
                            }
                          });
                        }}
                      />

                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Total General</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-lg text-sm font-bold bg-slate-50"
                      value={previewData.quote.total_amount}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-4">Desglose de Artículos ({previewData.items.length})</h4>
                <div className="max-h-60 overflow-y-auto border rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left text-[10px] font-bold uppercase text-slate-400">Cant.</th>
                        <th className="p-2 text-left text-[10px] font-bold uppercase text-slate-400">Descripción</th>
                        <th className="p-2 text-left text-[10px] font-bold uppercase text-slate-400">Código MINERD</th>
                        <th className="p-2 text-right text-[10px] font-bold uppercase text-slate-400">Precio</th>
                        <th className="p-2 text-right text-[10px] font-bold uppercase text-slate-400">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2 font-medium">{item.name}</td>
                          <td className="p-2">
                            <select
                              className="w-full p-1 text-[10px] border rounded-lg bg-white font-bold text-blue-600"
                              value={item.minerd_code}
                              onChange={e => {
                                const newItems = [...previewData.items];
                                newItems[idx].minerd_code = e.target.value;
                                setPreviewData({ ...previewData, items: newItems });
                              }}
                            >
                              <option value="">Seleccionar Código...</option>
                              {(minerdCodes || []).map(c => (
                                <option key={c.code} value={c.code}>{c.code} - {c.description}</option>
                              ))}

                            </select>
                          </td>
                          <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="p-2 text-right font-bold">{formatCurrency(item.unit_price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Cash Book Component ---

const CashBook = ({ apiFetch, currentCenter }: { apiFetch: any, currentCenter: any }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    reference_no: '',
    beneficiary: '',
    concept: '',
    type: 'income',
    amount: 0,
    retention_isr: 0,
    retention_itbis: 0
  });
  
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const [amountInput, setAmountInput] = useState('0');
  const [amountError, setAmountError] = useState<string | null>(null);

  const handleAmountChange = (val: string) => {
    setAmountInput(val);
    // Remove commas (thousands separators) for parsing
    const sanitized = val.replace(/,/g, '');
    if (val.trim() === '' || isNaN(Number(sanitized))) {
      setAmountError('Monto inválido. Use punto para decimales (ej. 1250.50) y no incluya letras.');
    } else {
      setAmountError(null);
      setNewEntry(prev => ({ ...prev, amount: parseFloat(sanitized) || 0 }));
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/cash-book');
      const data = await res?.json();
      setEntries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [apiFetch]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountError) {
      alert(amountError);
      return;
    }

    try {
      const payload = {
        ...newEntry,
        income: newEntry.type === 'income' ? newEntry.amount : 0,
        expense: newEntry.type === 'expense' ? newEntry.amount : 0,
        retention_isr: newEntry.retention_isr,
        retention_itbis: newEntry.retention_itbis,
        related_type: editingId ? 'manual_edit' : 'manual'
      };

      const url = editingId ? `/api/cash-book/${editingId}` : '/api/cash-book';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res?.ok) {
        setShowAddModal(false);
        setEditingId(null);
        setNewEntry({
          date: new Date().toISOString().split('T')[0],
          reference_no: '',
          beneficiary: '',
          concept: '',
          type: 'income',
          amount: 0,
          retention_isr: 0,
          retention_itbis: 0
        });
        setAmountInput('0');
        setAmountError(null);
        fetchEntries();
      }
    } catch (error) {
      console.error(error);
      alert('Error al procesar la transacción.');
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setNewEntry({
      date: entry.date,
      reference_no: entry.reference_no || '',
      beneficiary: entry.beneficiary || '',
      concept: entry.concept || '',
      type: entry.income > 0 ? 'income' : 'expense',
      amount: entry.income > 0 ? entry.income : entry.expense,
      retention_isr: entry.retention_isr || 0,
      retention_itbis: entry.retention_itbis || 0
    });
    setAmountInput((entry.income > 0 ? entry.income : entry.expense).toString());
    setAmountError(null);
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro? Esto recalculará los balances posteriores.')) return;

    try {
      const res = await apiFetch(`/api/cash-book/${id}`, { method: 'DELETE' });
      const data = await res?.json();
      if (data.success) {
        fetchEntries();
      } else {
        alert('Error al eliminar: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error en la conexión.');
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.beneficiary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.reference_no?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedMonth) {
      return matchesSearch && e.date.startsWith(selectedMonth);
    }
    return matchesSearch;
  });

  const currentBalance = filteredEntries.reduce((acc, e) => acc + (parseFloat(e.income) || 0) - (parseFloat(e.expense) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">LIBRO DE INGRESOS, EGRESOS Y DISPONIBILIDAD</h2>
          <p className="text-slate-500">Historial completo de transacciones y balances bancarios.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Registrar Transacción
          </button>
          <button
            onClick={() => generateCashBookReportPDF(entries, entries[entries.length - 1]?.date || '', entries[0]?.date || '', currentCenter)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => exportCashBookToExcel(entries)}
            className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disponibilidad</p>
            <p className="text-sm sm:text-base font-black text-slate-900 break-words">{formatCurrency(currentBalance)}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos</p>
            <p className="text-sm sm:text-base font-black text-slate-900 break-words">
              {formatCurrency(filteredEntries.reduce((acc, e) => acc + (parseFloat(e.income) || 0), 0))}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Egresos</p>
            <p className="text-sm sm:text-base font-black text-slate-900 break-words">
              {formatCurrency(filteredEntries.reduce((acc, e) => acc + (parseFloat(e.expense) || 0), 0))}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ret. ISR</p>
            <p className="text-sm sm:text-base font-black text-slate-900 break-words">
              {formatCurrency(filteredEntries.reduce((acc, e) => acc + (parseFloat(e.retention_isr) || 0), 0))}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ret. ITBIS</p>
            <p className="text-sm sm:text-base font-black text-slate-900 break-words">
              {formatCurrency(filteredEntries.reduce((acc, e) => acc + (parseFloat(e.retention_itbis) || 0), 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por beneficiario, concepto o cheque..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
            {selectedMonth && (
              <button 
                onClick={() => setSelectedMonth('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Ver Todos
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Fecha</th>
                <th className="text-left p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Ref. / Cheque</th>
                <th className="text-left p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Beneficiario</th>
                <th className="text-left p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Concepto</th>
                <th className="text-right p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Ingresos</th>
                <th className="text-right p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Egresos</th>
                <th className="text-right p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Disponible</th>
                <th className="text-right p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Ret. ISR</th>
                <th className="text-right p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Ret. ITBIS</th>
                <th className="text-right p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">Cargando transacciones...</td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">No se encontraron transacciones.</td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-medium whitespace-nowrap font-mono text-slate-600">{formatDateYYYYMMDD(entry.date)}</td>
                    <td className="p-4 font-mono text-xs">{entry.reference_no || '-'}</td>
                    <td className="p-4 font-bold">{entry.beneficiary}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{entry.concept}</td>
                    <td className="p-4 text-right text-emerald-600 font-bold">
                      {entry.income > 0 ? formatCurrency(entry.income) : '-'}
                    </td>
                    <td className="p-4 text-right text-rose-600 font-bold">
                      {entry.expense > 0 ? formatCurrency(entry.expense) : '-'}
                    </td>
                    <td className="p-4 text-right font-black text-slate-900">
                      {formatCurrency(entry.balance)}
                    </td>
                    <td className="p-4 text-right text-slate-500 text-xs">
                      {entry.retention_isr > 0 ? formatCurrency(entry.retention_isr) : '-'}
                    </td>
                    <td className="p-4 text-right text-slate-500 text-xs">
                      {entry.retention_itbis > 0 ? formatCurrency(entry.retention_itbis) : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar registro"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar registro"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem]">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingId ? 'Editar Transacción' : 'Nueva Transacción'}</h3>
                <p className="text-slate-500 text-sm">Completa los detalles del movimiento financiero.</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                }}
                className="p-3 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-slate-200"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddEntry} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Fecha</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border rounded-xl text-sm"
                    value={newEntry.date}
                    onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Tipo</label>
                  <select
                    className="w-full p-2 border rounded-xl text-sm"
                    value={newEntry.type}
                    onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}
                  >
                    <option value="income">Ingreso (+)</option>
                    <option value="expense">Egreso (-)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Monto (RD$)</label>
                <input
                  type="text"
                  required
                  className={cn(
                    "w-full p-2 border rounded-xl text-sm font-bold",
                    amountError ? "border-rose-500 bg-rose-50" : "border-slate-200"
                  )}
                  placeholder="0.00"
                  value={amountInput}
                  onChange={e => handleAmountChange(e.target.value)}
                />
                {amountError && (
                  <p className="text-[10px] text-rose-600 mt-1 font-bold animate-pulse">{amountError}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Beneficiario / Origen</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-xl text-sm"
                  placeholder="Ej: MINERD, Suplidor..."
                  value={newEntry.beneficiary}
                  onChange={e => setNewEntry({ ...newEntry, beneficiary: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Concepto</label>
                <textarea
                  required
                  className="w-full p-2 border rounded-xl text-sm h-20 resize-none"
                  placeholder="Descripción de la transacción..."
                  value={newEntry.concept}
                  onChange={e => setNewEntry({ ...newEntry, concept: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Referencia / Cheque</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-xl text-sm"
                  placeholder="Opcional"
                  value={newEntry.reference_no}
                  onChange={e => setNewEntry({ ...newEntry, reference_no: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Retención ISR (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-2 border rounded-xl text-sm"
                    placeholder="0.00"
                    value={newEntry.retention_isr}
                    onChange={e => setNewEntry({ ...newEntry, retention_isr: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Retención ITBIS (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-2 border rounded-xl text-sm"
                    placeholder="0.00"
                    value={newEntry.retention_itbis}
                    onChange={e => setNewEntry({ ...newEntry, retention_itbis: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors mt-4"
              >
                Guardar Transacción
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PettyCash = ({ apiFetch }: { apiFetch: any }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'refill'>('expense');
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    beneficiary: '',
    receipt_no: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchPettyCash = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/petty-cash');
      const data = await res?.json();
      setEntries(data.entries);
      setBalance(data.balance);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPettyCash();
  }, [apiFetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'expense' && formData.amount > 1000) {
      alert('Regla de Educación: Ninguna compra de caja chica puede exceder los RD$1,000.');
      return;
    }

    if (modalType === 'expense' && formData.amount > balance) {
      alert('Fondos insuficientes en caja chica.');
      return;
    }

    try {
      const res = await apiFetch('/api/petty-cash', {
        method: 'POST',
        body: JSON.stringify({ ...formData, type: modalType })
      });

      if (res?.ok) {
        setShowModal(false);
        setFormData({
          amount: 0,
          description: '',
          beneficiary: '',
          receipt_no: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchPettyCash();
      } else {
        const error = await res?.json();
        alert(error.error || 'Error al registrar.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await apiFetch(`/api/petty-cash/${id}`, { method: 'DELETE' });
    fetchPettyCash();
  };

  const totalSpent = entries.filter(e => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const limit = 10000;
  const usagePercentage = (balance / limit) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CAJA CHICA</h2>
          <p className="text-slate-500">Control de gastos menores y reposición de fondos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setModalType('refill'); setShowModal(true); }}
            className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Reponer Fondos
          </button>
          <button
            onClick={() => { setModalType('expense'); setShowModal(true); }}
            className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            Registrar Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Balance Disponible</p>
          <h3 className="text-xl lg:text-2xl font-black text-slate-900 break-words">{formatCurrency(balance)}</h3>
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-bold mb-1">
              <span className="text-slate-400">FONDO TOTAL: {formatCurrency(limit)}</span>
              <span className={balance < 2000 ? 'text-rose-500' : 'text-emerald-500'}>
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${balance < 2000 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Gastado</p>
          <h3 className="text-xl lg:text-2xl font-black text-rose-600 break-words">{formatCurrency(totalSpent)}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Acumulado de todos los periodos</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-2xl border border-amber-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold leading-tight">
              Límite por compra: RD$1,000.00<br />
              <span className="text-[10px] opacity-80 font-medium">Normativa de Educación Vigente</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Historial de Movimientos</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Fecha</th>
                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Recibo #</th>
                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Beneficiario</th>
                <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Concepto</th>
                <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Monto</th>
                <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Cargando historial...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">No hay movimientos registrados.</td></tr>
              ) : entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 font-mono text-xs text-slate-500">{formatDate(e.date)}</td>
                  <td className="p-4 font-bold text-slate-900">{e.receipt_no || '-'}</td>
                  <td className="p-4 text-slate-600">{e.beneficiary || '-'}</td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">{e.description}</td>
                  <td className={`p-4 text-right font-black ${e.type === 'refill' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {e.type === 'refill' ? `+${formatCurrency(e.amount)}` : `-${formatCurrency(e.amount)}`}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem]">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {modalType === 'expense' ? 'Registrar Gasto' : 'Reponer Fondos'}
                </h3>
                <p className="text-slate-500 text-sm">Ingresa los detalles del movimiento.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-full transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Fecha</label>
                  <input
                    type="date"
                    required
                    className="w-full p-3 border rounded-2xl text-sm"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Monto (RD$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    max={modalType === 'expense' ? 1000 : undefined}
                    className="w-full p-3 border rounded-2xl text-sm font-bold"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                  {modalType === 'expense' && <p className="text-[9px] text-rose-500 mt-1 font-bold">Máx. RD$1,000</p>}
                </div>
              </div>
              {modalType === 'expense' && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Recibo / Factura #</label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border rounded-2xl text-sm"
                      placeholder="Ej: 001-2024"
                      value={formData.receipt_no}
                      onChange={e => setFormData({ ...formData, receipt_no: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Beneficiario</label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 border rounded-2xl text-sm"
                      placeholder="Nombre de la persona o comercio"
                      value={formData.beneficiary}
                      onChange={e => setFormData({ ...formData, beneficiary: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Concepto / Descripción</label>
                <textarea
                  required
                  className="w-full p-3 border rounded-2xl text-sm h-24 resize-none"
                  placeholder="¿En qué se gastó el dinero?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${modalType === 'expense' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  }`}
              >
                {modalType === 'expense' ? 'Confirmar Gasto' : 'Confirmar Reposición'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

const Budget = ({ apiFetch, currentCenter }: { apiFetch: any, currentCenter: any }) => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [allocations, setAllocations] = useState<any[]>([
    { category: 'Infraestructura', amount: 0 },
    { category: 'Material gastable', amount: 0 },
    { category: 'Equipos', amount: 0 },
    { category: 'Servicios', amount: 0 },
    { category: 'Actividades pedagógicas', amount: 0 },
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [execution, setExecution] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/budgets?year=${year}`);
      const data = await res.json();
      if (data && data.allocations && data.allocations.length > 0) {
        setAllocations(data.allocations.map((a: any) => ({
          category: a.category,
          amount: a.allocated_amount
        })));
      } else {
        setAllocations([
          { category: 'Infraestructura', amount: 0 },
          { category: 'Material gastable', amount: 0 },
          { category: 'Equipos', amount: 0 },
          { category: 'Servicios', amount: 0 },
          { category: 'Actividades pedagógicas', amount: 0 },
        ]);
      }

      const execRes = await apiFetch(`/api/budget-execution?year=${year}`);
      const execData = await execRes.json();
      if (execData && !execData.error && Array.isArray(execData.allocations)) {
        setExecution(execData);
      } else {
        setExecution(null);
      }
    } catch (error) {
      console.error(error);
      setExecution(null);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, year]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/budgets', {
        method: 'POST',
        body: JSON.stringify({ year, allocations })
      });
      fetchBudget();
    } catch (error) {
      alert('Error al guardar el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (allocations.some(a => a.category.toLowerCase() === newCategory.trim().toLowerCase())) {
      alert('Esta categoría ya existe.');
      return;
    }
    setAllocations([...allocations, { category: newCategory.trim(), amount: 0 }]);
    setNewCategory('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${catToRemove}"? Se perderá este renglón en el próximo guardado si no lo re-agregas.`)) return;
    setAllocations(allocations.filter(a => a.category !== catToRemove));
  };

  const totalBudgeted = allocations.reduce((acc, a) => acc + (parseFloat(a.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">PRESUPUESTO ANUAL</h2>
          <p className="text-slate-500">Planifica y controla la ejecución de fondos por año escolar.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900/5"
          >
            <option value="2024">Año Escolar 2024</option>
            <option value="2025">Año Escolar 2025</option>
            <option value="2026">Año Escolar 2026</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Distribución de Fondos</h3>
            <div className="space-y-4">
              {allocations.map((a, idx) => (
                <div key={a.category} className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{a.category}</label>
                    <button onClick={() => handleRemoveCategory(a.category)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all font-bold text-slate-900"
                      value={a.amount}
                      onChange={e => {
                        const newAllocations = [...allocations];
                        newAllocations[idx].amount = e.target.value;
                        setAllocations(newAllocations);
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-50 flex gap-2">
                <input
                  type="text"
                  placeholder="Nueva categoría..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/5"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
                <button onClick={handleAddCategory} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400 uppercase">Total Presupuestado</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(totalBudgeted)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
              <p className="font-bold uppercase tracking-widest text-[10px]">Cargando ejecución...</p>
            </div>
          ) : execution && execution.allocations && execution.allocations.length > 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-8">Estado de Ejecución Real</h3>
              <div className="space-y-8">
                {execution.allocations.map((a: any) => (
                  <div key={a.category} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold text-slate-900">{a.category}</h4>
                        <p className="text-xs text-slate-500">Ejecutado: {formatCurrency(a.executed)} de {formatCurrency(a.budgeted)}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-xs font-black px-2 py-1 rounded-lg",
                          a.percent > 100 ? "bg-rose-50 text-rose-600" : a.percent > 80 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {a.percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000",
                          a.percent > 100 ? "bg-rose-500" : a.percent > 80 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min(a.percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Disponible: {formatCurrency(a.remaining)}</span>
                      {a.percent > 100 && (
                        <span className="text-rose-600 flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          Excedido por {formatCurrency(Math.abs(a.remaining))}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <PieChart className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sin Presupuesto Configurado</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Ingresa los montos por categoría a la izquierda para comenzar el seguimiento.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Reports Component ---

const Reports = ({ apiFetch, currentCenter }: { apiFetch: any, currentCenter: any }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await res?.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al obtener los datos');
      }

      if (!data || !data.quotes || !data.cashBook || !data.pettyCash || !data.inventory || !data.quoteItems) {
        throw new Error('Datos incompletos recibidos del servidor');
      }

      setReportData(data);
    } catch (error: any) {
      console.error('Report Fetch Error:', error);
      alert(error.message || 'Error al generar el reporte.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;
    const wb = XLSX.utils.book_new();

    // Quotes sheet
    const quotesWs = XLSX.utils.json_to_sheet((reportData.quotes || []).map((q: any) => ({
      ID: q.id,
      Fecha: formatDate(q.created_at),
      Suplidor: q.supplier_name,
      Tipo: q.type,
      Subtotal: q.subtotal,
      ITBIS: q.itbis,
      Total: q.total_amount
    })));
    XLSX.utils.book_append_sheet(wb, quotesWs, "Cotizaciones");

    // Cash Book sheet
    const cashWs = XLSX.utils.json_to_sheet((reportData.cashBook || []).map((c: any) => ({
      Fecha: formatDate(c.date),
      Referencia: c.reference_no,
      Beneficiario: c.beneficiary,
      Concepto: c.concept,
      Ingreso: c.income,
      Egreso: c.expense,
      Balance: c.balance
    })));
    XLSX.utils.book_append_sheet(wb, cashWs, "Libro de Caja");

    // Petty Cash sheet
    const pettyWs = XLSX.utils.json_to_sheet((reportData.pettyCash || []).map((p: any) => ({
      Fecha: formatDate(p.date),
      Recibo: p.receipt_no,
      Beneficiario: p.beneficiary,
      Concepto: p.description,
      Monto: p.amount,
      Tipo: p.type
    })));
    XLSX.utils.book_append_sheet(wb, pettyWs, "Caja Chica");

    // Quote Items sheet
    const itemsWs = XLSX.utils.json_to_sheet((reportData.quoteItems || []).map((i: any) => ({
      Fecha: formatDate(i.quote_date),
      Suplidor: i.supplier_name,
      Codigo: i.minerd_code || 'N/A',
      Descripcion: i.description || 'N/A',
      Cantidad: i.quantity,
      Precio_Unitario: i.unit_price,
      Total: i.total
    })));
    XLSX.utils.book_append_sheet(wb, itemsWs, "Productos y Servicios");

    XLSX.writeFile(wb, `Reporte_General_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">REPORTES GENERALES</h2>
          <p className="text-slate-500">Genera informes detallados por rango de fecha.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3 bg-white p-3 rounded-2xl border border-slate-200">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Desde</label>
            <input
              type="date"
              className="text-sm font-bold bg-slate-50 text-slate-700 px-3 py-2 rounded-xl outline-none border border-slate-200 focus:border-emerald-500 transition-colors"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hasta</label>
            <input
              type="date"
              className="text-sm font-bold bg-slate-50 text-slate-700 px-3 py-2 rounded-xl outline-none border border-slate-200 focus:border-emerald-500 transition-colors"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50 h-[38px]"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar Data
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => generateGeneralReportPDF(reportData, startDate, endDate, currentCenter)}
          disabled={!reportData}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Reporte General"
        >
          <Download className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => generateCashBookReportPDF(reportData.cashBook, startDate, endDate, currentCenter)}
          disabled={!reportData}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          title="Libro de Caja"
        >
          <Wallet className="w-4 h-4" />
          Caja
        </button>
        <button
          onClick={() => generateBankBookReportPDF(reportData.cashBook, startDate, endDate, currentCenter)}
          disabled={!reportData}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          title="Estado Bancario"
        >
          <Landmark className="w-4 h-4" />
          Banco
        </button>
        <button
          onClick={() => generatePettyCashReportPDF(reportData.pettyCash, startDate, endDate, currentCenter)}
          disabled={!reportData}
          className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-700 transition-colors disabled:opacity-50"
          title="Caja Chica"
        >
          <DollarSign className="w-4 h-4" />
          Caja Chica
        </button>
        <button
          onClick={() => generateInventoryReportPDF(reportData.inventory, startDate, endDate, currentCenter)}
          disabled={!reportData}
          className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-700 transition-colors disabled:opacity-50"
          title="Inventario"
        >
          <Package className="w-4 h-4" />
          Inventario
        </button>
        <button
          onClick={() => exportOfficialMinerdReport(reportData, currentCenter, startDate, endDate)}
          disabled={!reportData}
          className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-lg shadow-blue-900/20"
          title="Formulario Oficial MINERD"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Oficial MINERD
        </button>
        <button
          onClick={exportToExcel}
          disabled={!reportData}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </button>
      </div>

      {
        reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Cotizaciones</h4>
              <p className="text-3xl font-black text-slate-900">{(reportData.quotes || []).length}</p>
              <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency((reportData.quotes || []).reduce((acc: any, q: any) => acc + (q.total_amount || 0), 0))}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Movimientos Caja</h4>
              <p className="text-3xl font-black text-slate-900">{(reportData.cashBook || []).length}</p>
              <div className="flex gap-4 mt-1">
                <span className="text-[10px] text-emerald-600 font-bold">+{formatCurrency((reportData.cashBook || []).reduce((acc: any, c: any) => acc + (c.income || 0), 0))}</span>
                <span className="text-[10px] text-rose-600 font-bold">-{formatCurrency((reportData.cashBook || []).reduce((acc: any, c: any) => acc + (c.expense || 0), 0))}</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Gastos Caja Chica</h4>
              <p className="text-3xl font-black text-rose-600">{(reportData.pettyCash || []).filter((p: any) => p.type === 'expense').length}</p>
              <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency((reportData.pettyCash || []).filter((p: any) => p.type === 'expense').reduce((acc: any, p: any) => acc + (p.amount || 0), 0))}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Nuevos Activos</h4>
              <p className="text-3xl font-black text-blue-600">{(reportData.inventory || []).length}</p>
              <p className="text-xs text-slate-500 mt-1">Registrados en el periodo</p>
            </div>
          </div>
        )
      }

      {
        reportData && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detalle de Cotizaciones</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Fecha</th>
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Suplidor</th>
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Tipo</th>
                      <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(reportData.quotes || []).map((q: any) => (
                      <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">{formatDate(q.created_at)}</td>
                        <td className="p-4 font-bold">{q.supplier_name || 'N/A'}</td>
                        <td className="p-4 uppercase text-[10px] font-bold">{q.type === 'materials' ? 'Materiales' : 'Mano de Obra'}</td>
                        <td className="p-4 text-right font-black">{formatCurrency(q.total_amount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detalle de Productos y Servicios</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Fecha</th>
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Código</th>
                      <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Descripción</th>
                      <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Cant.</th>
                      <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Precio</th>
                      <th className="p-4 text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(reportData.quoteItems || []).map((i: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">{formatDate(i.quote_date)}</td>
                        <td className="p-4 font-mono text-[10px]">{i.minerd_code || 'N/A'}</td>
                        <td className="p-4">
                          <p className="font-bold">{i.description || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400">{i.supplier_name}</p>
                        </td>
                        <td className="p-4 text-right">{i.quantity}</td>
                        <td className="p-4 text-right">{formatCurrency(i.unit_price || 0)}</td>
                        <td className="p-4 text-right font-black">{formatCurrency(i.total || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

const Configuration = ({ apiFetch, currentCenter, user }: { apiFetch: any, currentCenter: any, user: any }) => {
  const [activeTab, setActiveTab] = useState<'center' | 'user' | 'maintenance'>('center');
  const [loading, setLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  // Center form state
  const [centerForm, setCenterForm] = useState({
    name: currentCenter?.name || '',
    rnc: currentCenter?.rnc || '',
    address: currentCenter?.address || '',
    phone: currentCenter?.phone || '',
    email: currentCenter?.email || '',
    junta_name: currentCenter?.junta_name || '',
    codigo_no: currentCenter?.codigo_no || '',
    codigo_dependencia: currentCenter?.codigo_dependencia || '',
    cuenta_no: currentCenter?.cuenta_no || '',
    director_name: currentCenter?.director_name || '',
    secretary_name: currentCenter?.secretary_name || '',
    treasurer_name: currentCenter?.treasurer_name || '',
    district: currentCenter?.district || '',
    regional: currentCenter?.regional || ''
  });

  // User form state
  const [userForm, setUserForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  const handleCenterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch(`/api/centers/${currentCenter.id}`, {
        method: 'PUT',
        body: JSON.stringify(centerForm)
      });
      if (!res.ok) throw new Error('Error al actualizar centro');
      alert('Centro actualizado correctamente. Los cambios se reflejarán al recargar.');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar centro');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(userForm)
      });
      if (!res.ok) throw new Error('Error al actualizar usuario');
      alert('Usuario actualizado correctamente. Por favor inicie sesión nuevamente si cambió su contraseña.');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await apiFetch('/api/backup-db');
      if (!res.ok) throw new Error('Error al descargar respaldo');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo-genesis-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al descargar el respaldo');
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    if (!confirm('⚠️ ATENCIÓN: Restaurar una base de datos SOBREESCRIBIRÁ todos los datos actuales. El sistema se reiniciará. ¿Deseas continuar?')) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('backup', restoreFile);

    try {
      // Manual fetch because apiFetch handles JSON by default
      const res = await fetch('/api/restore-db', {
        method: 'POST',
        headers: {
          'x-center-id': currentCenter.id.toString(),
          'x-user-id': user.id.toString()
        },
        body: formData
      });

      if (!res.ok) throw new Error('Error al restaurar');
      alert('¡Base de datos restaurada con éxito! La aplicación se recargará.');
      window.location.reload();
    } catch (error) {
      alert('Error al restaurar la base de datos. Asegúrate de subir un archivo .db válido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">CONFIGURACIÓN</h2>
        <p className="text-slate-500">Gestiona los detalles del centro y la seguridad de tus datos</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('center')}
          className={cn("pb-2 font-bold text-sm transition-colors relative", activeTab === 'center' ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Centro Educativo
          {activeTab === 'center' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={cn("pb-2 font-bold text-sm transition-colors relative", activeTab === 'user' ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Perfil de Usuario
          {activeTab === 'user' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={cn("pb-2 font-bold text-sm transition-colors relative", activeTab === 'maintenance' ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Mantenimiento y Respaldo
          {activeTab === 'maintenance' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />}
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        {activeTab === 'center' ? (
          <form onSubmit={handleCenterSubmit} className="space-y-6">
            <h3 className="text-lg font-bold">Datos del Centro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre del Centro</label>
                <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.name} onChange={e => setCenterForm({ ...centerForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RNC</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.rnc} onChange={e => setCenterForm({ ...centerForm, rnc: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dirección</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.address} onChange={e => setCenterForm({ ...centerForm, address: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teléfono</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.phone} onChange={e => setCenterForm({ ...centerForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correo</label>
                <input type="email" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.email} onChange={e => setCenterForm({ ...centerForm, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre de la Junta</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.junta_name} onChange={e => setCenterForm({ ...centerForm, junta_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Código No.</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.codigo_no} onChange={e => setCenterForm({ ...centerForm, codigo_no: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Código Dependencia</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.codigo_dependencia} onChange={e => setCenterForm({ ...centerForm, codigo_dependencia: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cuenta No.</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.cuenta_no} onChange={e => setCenterForm({ ...centerForm, cuenta_no: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre Director(a)</label>
                <input type="text" placeholder="Ej: Enerolisa Mejía R." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.director_name} onChange={e => setCenterForm({ ...centerForm, director_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sec. de la Junta</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.secretary_name} onChange={e => setCenterForm({ ...centerForm, secretary_name: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tesorero de la Junta</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.treasurer_name} onChange={e => setCenterForm({ ...centerForm, treasurer_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Distrito Educativo</label>
                <input type="text" placeholder="Ej: 12-01 de Higüey" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.district} onChange={e => setCenterForm({ ...centerForm, district: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Regional</label>
                <input type="text" placeholder="Ej: 12 HIGÜEY" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={centerForm.regional} onChange={e => setCenterForm({ ...centerForm, regional: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              {loading ? 'Guardando...' : 'Guardar Cambios del Centro'}
            </button>
          </form>
        ) : activeTab === 'user' ? (
          <form onSubmit={handleUserSubmit} className="space-y-6">
            <h3 className="text-lg font-bold">Perfil de Usuario</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre</label>
                <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                <input type="email" required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              <div className="space-y-1 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nueva Contraseña (Opcional)</label>
                <input type="password" placeholder="Dejar en blanco para no cambiar" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              {loading ? 'Guardando...' : 'Actualizar Perfil'}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Respaldo de Seguridad</h3>
              <p className="text-slate-500 text-sm">Descarga una copia completa de tu base de datos para guardarla de forma segura. Puedes usar este archivo para restaurar tus datos en cualquier momento.</p>
              <button
                onClick={handleBackup}
                disabled={loading}
                className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <Download className="w-5 h-5" />
                Descargar Copia de Seguridad (.db)
              </button>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-rose-600">Restaurar Datos</h3>
              <p className="text-slate-500 text-sm">Selecciona un archivo de respaldo (.db) previamente descargado para restaurar el sistema. <span className="font-bold text-rose-600">Esta acción borrará los datos actuales.</span></p>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept=".db"
                    onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                    className="w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <button
                  onClick={handleRestore}
                  disabled={!restoreFile || loading}
                  className="bg-rose-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50"
                >
                  Restaurar Base de Datos
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
                <div className="flex items-center gap-3 text-blue-700">
                  <RefreshCw className="w-5 h-5" />
                  <h4 className="font-black uppercase text-sm tracking-tight">Mantenimiento: Sincronizar Dashboard</h4>
                </div>
                <p className="text-xs text-blue-600 font-medium">Esta acción alineará las estadísticas del Dashboard y la pestaña de Movimientos con lo que aparece actualmente en el <span className="font-bold underline">Libro de Caja</span>. Úsalo si ves datos viejos o discrepancias.</p>
                <button
                  onClick={async () => {
                    if (confirm('¿Deseas sincronizar el Dashboard con el Libro de Caja? Esto limpiará cualquier movimiento bancario que no esté registrado en tu libro para que los totales coincidan exactamente.')) {
                      setLoading(true);
                      try {
                        const res = await apiFetch('/api/sync-dashboard', { method: 'POST' });
                        if (res.ok) {
                          alert('¡Dashboard sincronizado con éxito! Ahora los totales reflejan exactamente lo que tienes en el Libro de Caja.');
                          window.location.reload();
                        }
                      } catch (e) {
                        console.error(e);
                        alert('Error al sincronizar datos.');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sincronizar Dashboard con el Libro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Application ---
// --- SaaS Admin Panel (Global Control for Alex) ---
const SaaSAdminPanel = ({ apiFetch }: { apiFetch: any }) => {
  const [centers, setCenters] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('centers');

  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/saas/centers');
      if (!response) {
        setError("No hay conexión con el servidor");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCenters(data);
          // Also fetch codes if centers load fine
          const codesRes = await apiFetch('/api/saas/codes');
          if (codesRes && codesRes.ok) setCodes(await codesRes.json());
          const usersRes = await apiFetch('/api/saas/users');
          if (usersRes && usersRes.ok) setUsers(await usersRes.json());
        } else {
          setError("Respuesta del servidor no es una lista válida");
        }
      } else {
        const text = await response.text();
        if (text.includes("<!doctype") || text.includes("<html")) {
          setError(`Error ${response.status}: El servidor devolvió una página HTML en lugar de datos. Esto suele indicar que la ruta API no existe (404) o hay un error de servidor.`);
        } else {
          try {
            const errData = JSON.parse(text);
            setError(`Error ${response.status}: ${errData.error || "Error desconocido"}`);
          } catch {
            setError(`Error ${response.status}: ${text.substring(0, 100)}`);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setError("Error de red o de código local: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      await apiFetch(`/api/saas/centers/${id}/toggle`, { method: 'POST' });
      fetchData();
    } catch (e) {
      alert('Error al cambiar estado');
    }
  };

  const handleGenerateCode = async () => {
    try {
      const res = await apiFetch('/api/saas/codes/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Código generado: ${data.code}`);
        fetchData();
      }
    } catch (e) {
      alert('Error al generar código');
    }
  };

  const handleResetPassword = async (userId: number, userName: string) => {
    const newPassword = prompt(`Introduce la nueva contraseña temporal para ${userName} (mínimo 6 caracteres):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    try {
      const res = await apiFetch(`/api/saas/users/${userId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert(`¡Contraseña de ${userName} restablecida con éxito!`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert("Error al restablecer contraseña");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">PANEL SAAS GLOBAL</h2>
          <p className="text-slate-500 font-medium tracking-wide">Control total de la plataforma Edugestion Financiera</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Refrescar datos"
          >
            <History className={cn("w-5 h-5 text-slate-500", loading && "animate-spin")} />
          </button>
          <button
            onClick={handleGenerateCode}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Generar Código
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('centers')}
          className={cn("pb-2 font-bold text-sm transition-colors relative", activeTab === 'centers' ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Centros Educativos ({centers.length})
        </button>
        <button
          onClick={() => setActiveTab('codes')}
          className={cn("pb-2 font-bold text-sm transition-colors relative", activeTab === 'codes' ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Códigos de Registro ({codes.filter(c => !c.is_used).length} Libres)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn("pb-2 font-bold text-sm transition-colors relative", activeTab === 'users' ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Usuarios ({users.length})
        </button>
      </div>

      {activeTab === 'centers' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Institución</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Administrador</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Usuarios</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {centers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic font-medium">
                    No se han cargado instituciones.
                  </td>
                </tr>
              ) : centers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs">{c.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400 font-mono tracking-tighter">{c.rnc}</p>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-600">{c.manager_email || 'N/A'}</td>
                  <td className="p-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black">{c.user_count}</span></td>
                  <td className="p-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      c.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {c.status === 'active' ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className={cn(
                        "text-[11px] font-bold px-4 py-2 rounded-xl transition-all",
                        c.status === 'active' ? "text-rose-600 bg-rose-50 hover:bg-rose-100" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      )}
                    >
                      {c.status === 'active' ? 'Suspender' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'codes' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Código</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Creado</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.map(c => (
                <tr key={c.id}>
                  <td className="p-4 font-mono font-bold text-slate-700">{c.code}</td>
                  <td className="p-4">
                    {c.is_used ? (
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-400">Utilizado</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 rounded-full text-[9px] font-black uppercase text-emerald-600">Disponible</span>
                    )}
                  </td>
                  <td className="p-4 text-[11px] text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {!c.is_used && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          alert('Código copiado al portapapeles');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold"
                      >
                        Copiar Código
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Registro</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs">{u.id}</td>
                  <td className="p-4 font-bold text-slate-900">{u.name || 'Sin Nombre'}</td>
                  <td className="p-4 text-xs font-medium text-slate-600">{u.email}</td>
                  <td className="p-4 text-[11px] text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleResetPassword(u.id, u.name || u.email)}
                      className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all"
                    >
                      Restablecer Contraseña
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [currentCenter, setCurrentCenter] = useState<any>(null);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [quoteToEdit, setQuoteToEdit] = useState<number | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [minerdCodes, setMinerdCodes] = useState<any[]>([]);

  // Global fetch wrapper with center context
  const apiFetch = useCallback(async (url: string, options: any = {}) => {
    if (!user) return null;

    // Allow SaaS routes even without a center
    const isSaasRoute = url.startsWith('/api/saas');
    if (!currentCenter && !isSaasRoute) return null;

    const headers: any = {
      ...options.headers,
      'x-user-id': user.id.toString()
    };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (currentCenter) {
      headers['x-center-id'] = currentCenter.id.toString();
    }
    return fetch(url, { ...options, headers }).then(res => {
      // Logic for suspension only if we have a center ID context
      if (res.status === 403 && headers['x-center-id']) {
        setIsSuspended(true);
      } else if (headers['x-center-id']) {
        setIsSuspended(false);
      }
      return res;
    });
  }, [currentCenter, user]);


  useEffect(() => {
    if (user) {
      apiFetch('/api/minerd-codes')
        .then((res: any) => res.json())
        .then((data: any) => setMinerdCodes(data))
        .catch((err: any) => console.error("Error fetching codes:", err));
    }
  }, [user, apiFetch]);



  const isSuperAdmin = user?.email?.toLowerCase() === 'alexpalacio29@gmail.com';


  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedCenter = localStorage.getItem('currentCenter');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Fetch centers for this user
      fetch('/api/centers', {
        headers: { 'x-user-id': parsedUser.id.toString() }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCenters(data);
            if (savedCenter) {
              const parsedCenter = JSON.parse(savedCenter);
              const centerExists = data.find((c: any) => c.id === parsedCenter.id);
              if (centerExists) setCurrentCenter(parsedCenter);
            }
          }
        });
    }
  }, []);

  const handleLogin = (userData: any, userCenters: any[]) => {
    setUser(userData);
    setCenters(userCenters);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userCenters.length === 1) {
      handleSelectCenter(userCenters[0]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCenters([]);
    setCurrentCenter(null);
    localStorage.removeItem('user');
    localStorage.removeItem('currentCenter');
  };

  const handleSelectCenter = (center: any) => {
    setCurrentCenter(center);
    localStorage.setItem('currentCenter', JSON.stringify(center));
  };

  const refreshCenters = async () => {
    if (!user) return;
    const res = await fetch('/api/centers', {
      headers: { 'x-user-id': user.id.toString() }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setCenters(data);
    }
    setShowCenterForm(false);
  };


  useEffect(() => {
    if (currentCenter?.rnc === 'SaaS-Global') {
      setActiveTab('saas-admin');
    }
  }, [currentCenter]);

  // If super admin and no center, we can still show the global panel
  const showSaaSPanel = isSuperAdmin && (!currentCenter || currentCenter.rnc === 'SaaS-Global');

  if (!user) return <Auth onLogin={handleLogin} />;

  if (!currentCenter && !showSaaSPanel) return (
    <>
      <CenterSelector
        user={user}
        centers={centers}
        onSelect={handleSelectCenter}
        onAdd={() => setShowCenterForm(true)}
        onLogout={handleLogout}
      />
      {showCenterForm && (
        <CenterForm
          userId={user.id}
          onCancel={() => setShowCenterForm(false)}
          onSuccess={refreshCenters}
        />
      )}
    </>
  );

  const menuItems = [
    ...(isSuperAdmin ? [{ id: 'saas-admin', label: 'Admin SaaS', icon: Lock }] : []),
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'auto-processor', label: 'Procesador Automático', icon: FileSpreadsheet },
    { id: 'budget', label: 'Presupuesto', icon: PieChart },
    { id: 'cash-book', label: 'Libro de Caja', icon: Landmark },
    { id: 'suppliers', label: 'Suplidores', icon: Users },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'checks', label: 'Cheques', icon: CreditCard },
    { id: 'bank', label: 'Estado Bancario', icon: Landmark },
    { id: 'petty-cash', label: 'Caja Chica', icon: Wallet },
    { id: 'bank-reconciliation', label: 'Conciliación Bancaria', icon: Landmark },
    { id: 'reports', label: 'Reportes', icon: PieChart },
    { id: 'configuration', label: 'Configuración', icon: Settings },
  ];



  const renderContent = () => {

    // Pass apiFetch to components that need it
    const props = { apiFetch, currentCenter, user, onNavigate: setActiveTab, minerdCodes };
    const onEditQuote = (id: number) => {
      setQuoteToEdit(id);
      setActiveTab('auto-processor');
    };

    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} apiFetch={apiFetch} currentCenter={currentCenter} />;
      case 'auto-processor': return <AutoProcessor {...props} quoteToEdit={quoteToEdit} setQuoteToEdit={setQuoteToEdit} />;
      case 'budget': return <Budget {...props} />;
      case 'suppliers': return <Suppliers {...props} />;
      case 'inventory': return <Inventory {...props} />;
      case 'quotes': return <Quotes {...props} onEditQuote={onEditQuote} />;
      case 'checks': return <Checks {...props} />;
      case 'cash-book': return <CashBook {...props} />;
      case 'bank': return <BankBook {...props} />;
      case 'bank-reconciliation': return <BankReconciliation {...props} />;
      case 'petty-cash': return <PettyCash {...props} />;
      case 'reports': return <Reports {...props} />;
      case 'configuration': return <Configuration {...props} />;
      case 'saas-admin': return <SaaSAdminPanel apiFetch={apiFetch} />;
      default: return <Dashboard onNavigate={setActiveTab} apiFetch={apiFetch} currentCenter={currentCenter} />;
    }
  };

  if (isSuspended && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-white max-w-md w-full rounded-3xl p-10 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">INSTITUCIÓN SUSPENDIDA</h2>
          <p className="text-slate-500 font-medium">El acceso a los datos de esta institución ha sido suspendido temporalmente por el administrador de la plataforma.</p>
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3 border-b border-slate-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
              <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-slate-900 leading-tight">Edugestion Financiera</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Multi-Centro</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-50 space-y-2">
            {isSuperAdmin && currentCenter && currentCenter.rnc !== 'SaaS-Global' && (
              <button
                onClick={() => {
                  setCurrentCenter(null);
                  setActiveTab('saas-admin');
                }}
                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                <Shield className="w-4 h-4" />
                Panel Global SaaS
              </button>
            )}
            <button
              onClick={() => setCurrentCenter(null)}
              className="w-full flex items-center gap-3 p-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Building2 className="w-4 h-4" />
              Cambiar Centro
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-900">
                {currentCenter ? currentCenter.name : (showSaaSPanel ? 'ADMINISTRACIÓN GLOBAL' : 'Edugestion Financiera')}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {currentCenter?.rnc === 'SaaS-Global' || showSaaSPanel ? 'Panel de Control SaaS' : (currentCenter ? `RNC: ${currentCenter.rnc}` : 'Gestión Financiera')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('saas-admin')}
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                <Lock className="w-3.5 h-3.5" />
                Panel SaaS
              </button>
            )}
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isSuperAdmin ? 'Super Administrador' : 'Usuario'}
              </p>
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden md:block" />
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
              {user.name?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
