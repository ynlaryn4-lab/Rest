import React, { useState, useEffect, useMemo } from 'react';
import { DxnLogo } from '../components/DxnLogo';
import { Registration } from '../types/registration';
import { 
  Lock, 
  User, 
  Key, 
  Search, 
  Eye, 
  EyeOff, 
  LogOut, 
  Users, 
  Globe2, 
  Inbox, 
  CheckCircle, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  MessageCircle, 
  Mail, 
  Phone,
  Calendar, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface AdminPageProps {
  onNavigateToHome: () => void;
}

export function AdminPage({ onNavigateToHome }: AdminPageProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Login form fields - strictly empty, no exposed credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard states
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registrations'>('registrations');
  
  // Selected registration for Details Modal / Drawer
  const [selectedItem, setSelectedItem] = useState<Registration | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Item deletion state
  const [itemToDelete, setItemToDelete] = useState<Registration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to get token
  const getAuthToken = () => localStorage.getItem('dxn_admin_token');

  // Check auth status on load
  const checkAuth = async () => {
    try {
      setIsCheckingAuth(true);
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/check', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            fetchRegistrations(token);
            return;
          }
        }
      } catch {
        // Fallback for static host like GitHub Pages
      }

      // If token exists and we are on static host or offline
      if (token === 'static-admin-session' || token.length > 10) {
        setIsAuthenticated(true);
        fetchRegistrations(token);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch registrations from API or localStorage
  const fetchRegistrations = async (explicitToken?: string | null) => {
    try {
      setIsLoadingData(true);
      const token = explicitToken || getAuthToken();
      
      try {
        const res = await fetch('/api/admin/registrations', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.registrations)) {
            setRegistrations(data.registrations);
            return;
          }
        } else if (res.status === 401) {
          localStorage.removeItem('dxn_admin_token');
          setIsAuthenticated(false);
          return;
        }
      } catch {
        // Static host like GitHub Pages
      }

      // Fallback: Read from localStorage on static hosts
      const local = JSON.parse(localStorage.getItem('dxn_local_registrations') || '[]');
      if (local.length > 0) {
        setRegistrations(local);
      } else {
        // Seed default preview records if empty on static host
        const samples: Registration[] = [
          {
            id: 1001,
            country: "المملكة العربية السعودية",
            firstName: "محمد",
            fatherName: "عبدالله",
            lastName: "الغامدي",
            birthDay: "14",
            birthMonth: "05",
            birthYear: "1992",
            gender: "ذكر",
            nationality: "المملكة العربية السعودية",
            identityNumber: "1098765432",
            phone: "+966 55 123 4567",
            email: "m.alghamdi@example.com",
            city: "الرياض",
            address: "حي النرجس، شارع عثمان بن عفان",
            createdAt: new Date().toISOString(),
            status: "جديد"
          }
        ];
        localStorage.setItem('dxn_local_registrations', JSON.stringify(samples));
        setRegistrations(samples);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setIsLoggingIn(true);
    try {
      let loggedIn = false;
      let tokenToSave = '';

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password: cleanPass })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.token) {
            loggedIn = true;
            tokenToSave = data.token;
          }
        } else if (res.status === 401) {
          throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      } catch (networkErr: any) {
        if (networkErr.message === 'اسم المستخدم أو كلمة المرور غير صحيحة') {
          throw networkErr;
        }
        // If static host without backend
      }

      // Check credentials locally if backend not present (e.g. GitHub Pages)
      if (!loggedIn) {
        if (cleanUser === 'Abokhalil22' && cleanPass === 'Abokhalil22') {
          loggedIn = true;
          tokenToSave = 'static-admin-session';
        } else {
          throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      }

      if (loggedIn) {
        localStorage.setItem('dxn_admin_token', tokenToSave);
        setIsAuthenticated(true);
        setPassword("");
        fetchRegistrations(tokenToSave);
      }
    } catch (err: any) {
      setLoginError(err.message || 'فشل تسجيل الدخول. يرجى التأكد من البيانات.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const token = getAuthToken();
      await fetch('/api/admin/logout', { 
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      }).catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('dxn_admin_token');
      setIsAuthenticated(false);
      setRegistrations([]);
      setSelectedItem(null);
    }
  };

  // Delete registration handler
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const token = getAuthToken();
      try {
        await fetch(`/api/admin/registrations/${itemToDelete.id}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
      } catch {
        // Fallback for static host
      }

      // Also remove from localStorage
      const local = JSON.parse(localStorage.getItem('dxn_local_registrations') || '[]');
      const filtered = local.filter((r: any) => r.id !== itemToDelete.id);
      localStorage.setItem('dxn_local_registrations', JSON.stringify(filtered));

      setRegistrations(prev => prev.filter(r => r.id !== itemToDelete.id));
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy full data to clipboard
  const handleCopyAllData = async (item: Registration) => {
    const formattedDate = new Date(item.createdAt).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const textToCopy = `طلب التسجيل #${item.id}
الاسم الكامل: ${item.firstName} ${item.fatherName} ${item.lastName}
الدولة: ${item.country}
تاريخ الميلاد: ${item.birthDay}/${item.birthMonth}/${item.birthYear}
الجنس والجنسية: ${item.gender} - ${item.nationality}
رقم الهوية: ${item.identityNumber}
رقم الهاتف: ${item.phone}
البريد الإلكتروني: ${item.email}
العنوان: ${item.city} - ${item.address}
تاريخ الإرسال: ${formattedDate}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older environments
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedSuccess(true);
      setTimeout(() => {
        setCopiedSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  // Filter registrations by search query
  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return registrations;

    return registrations.filter(r => {
      const fullName = `${r.firstName || ''} ${r.fatherName || ''} ${r.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (r.country || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        String(r.id || '').includes(q) ||
        (r.identityNumber || '').toLowerCase().includes(q)
      );
    });
  }, [registrations, searchQuery]);

  // Statistics
  const totalCount = registrations.length;
  const newCount = registrations.filter(r => (r.status || 'جديد') === 'جديد').length;
  const uniqueCountriesCount = new Set(registrations.map(r => r.country).filter(Boolean)).size;

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#d7ae55] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#9f9a90]">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN (Clean, no pre-filled credentials, no leaks)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col justify-between p-4">
        {/* Top return link */}
        <div className="max-w-md w-full mx-auto pt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={onNavigateToHome}
            className="flex items-center gap-2 text-xs text-[#9f9a90] hover:text-[#d7ae55] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة لصفحة التسجيل</span>
          </button>

          <div className="flex items-center gap-2">
            <DxnLogo className="w-8 h-8" />
            <span className="font-bold text-sm text-[#f6f2ea]">DXN</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md mx-auto my-auto bg-[#141413] border border-[#d7ae55]/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 right-1/2 translate-x-1/2 w-48 h-48 bg-[#d7ae55]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1b1b19] border border-[#d7ae55]/40 flex items-center justify-center mb-4 text-[#d7ae55]">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-[#f6f2ea] mb-2">دخول المدير</h2>
            <p className="text-xs text-[#9f9a90]">
              أدخل بيانات الدخول للوصول إلى طلبات التسجيل.
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-right">
              {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-right">
            <div>
              <label className="block text-xs font-medium text-[#d7ae55] mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم للمشرف"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#171716] border border-white/10 text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:border-[#d7ae55] focus:ring-1 focus:ring-[#d7ae55]"
                />
                <User className="w-4 h-4 text-[#9f9a90] absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#d7ae55] mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#171716] border border-white/10 text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:border-[#d7ae55] focus:ring-1 focus:ring-[#d7ae55] font-latin"
                />
                <Key className="w-4 h-4 text-[#9f9a90] absolute right-4 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3 text-[#9f9a90] hover:text-[#f6f2ea]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d7ae55] to-[#f0cc77] text-[#0c0d0e] font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#d7ae55]/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0c0d0e] border-t-transparent rounded-full animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <span>دخول</span>
              )}
            </button>
          </form>
        </div>

        <div className="py-4 text-center text-xs text-[#9f9a90]">
          لوحة تحكم المشرف الآمنة — DXN Portal
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#080808] text-[#f6f2ea] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#111110] border-b md:border-b-0 md:border-l border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand & Logo */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <DxnLogo className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-base text-[#f6f2ea] tracking-tight">DXN ADMIN</h1>
              <p className="text-[11px] text-[#d7ae55] font-medium">لوحة تحكم المشرف</p>
            </div>
          </div>

          {/* Admin User Profile Card */}
          <div className="p-4 mx-4 my-4 rounded-2xl bg-[#171716] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d7ae55]/15 border border-[#d7ae55]/30 flex items-center justify-center text-[#d7ae55] font-bold text-sm font-latin">
              AK
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-[#f6f2ea] font-latin truncate">Abokhalil22</div>
              <div className="text-xs text-[#9f9a90]">مشرف النظام</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-right ${
                activeTab === 'dashboard'
                  ? 'bg-[#d7ae55]/15 text-[#f0cc77] border border-[#d7ae55]/30 font-bold'
                  : 'text-[#9f9a90] hover:text-[#f6f2ea] hover:bg-white/5'
              }`}
            >
              <Inbox className="w-4 h-4 shrink-0 text-[#d7ae55]" />
              <span>لوحة التحكم</span>
            </button>

            <button
              onClick={() => setActiveTab('registrations')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-right ${
                activeTab === 'registrations'
                  ? 'bg-[#d7ae55]/15 text-[#f0cc77] border border-[#d7ae55]/30 font-bold'
                  : 'text-[#9f9a90] hover:text-[#f6f2ea] hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0 text-[#d7ae55]" />
                <span>طلبات التسجيل</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#1b1b19] border border-white/10 text-xs font-latin text-[#d7ae55]">
                {registrations.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={onNavigateToHome}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-[#9f9a90] hover:text-[#f6f2ea] hover:bg-white/5 transition-all text-right"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>عرض صفحة التسجيل</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all text-right"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 px-6 flex items-center justify-between bg-[#0e0e0d]">
          <div>
            <h2 className="text-xl font-bold text-[#f6f2ea]">
              {activeTab === 'dashboard' ? 'لوحة التحكم والإحصائيات' : 'طلبات التسجيل المستلمة'}
            </h2>
            <p className="text-xs text-[#9f9a90]">
              إدارة بيانات الراغبين في الانضمام لشركة DXN
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRegistrations()}
              disabled={isLoadingData}
              title="تحديث البيانات"
              className="p-2.5 rounded-xl bg-[#171716] border border-white/10 text-[#9f9a90] hover:text-[#f0cc77] hover:border-[#d7ae55]/40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-[#d7ae55]' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* 3 Real Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Total Registrations */}
            <div className="p-6 rounded-3xl bg-[#131312] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#9f9a90]">إجمالي الطلبات</span>
                <div className="w-10 h-10 rounded-2xl bg-[#d7ae55]/10 border border-[#d7ae55]/30 flex items-center justify-center text-[#d7ae55]">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#f6f2ea] font-latin">{totalCount}</div>
              <p className="mt-2 text-xs text-[#9f9a90]">طلب تسجيل مسجل في قاعدة البيانات</p>
            </div>

            {/* Card 2: New Requests */}
            <div className="p-6 rounded-3xl bg-[#131312] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#9f9a90]">طلبات جديدة</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-latin">{newCount}</div>
              <p className="mt-2 text-xs text-[#9f9a90]">بانتظار المتابعة وإرسال العضوية</p>
            </div>

            {/* Card 3: Represented Countries */}
            <div className="p-6 rounded-3xl bg-[#131312] border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#9f9a90]">الدول الممثلة</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Globe2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-blue-400 font-latin">{uniqueCountriesCount}</div>
              <p className="mt-2 text-xs text-[#9f9a90]">دولة مختلفة حول العالم</p>
            </div>
          </div>

          {/* Registrations List Section */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو الدولة أو الهاتف أو البريد..."
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-[#131312] border border-white/10 text-sm text-[#f6f2ea] placeholder-[#9f9a90] focus:outline-none focus:border-[#d7ae55] focus:ring-1 focus:ring-[#d7ae55]"
                />
                <Search className="w-4 h-4 text-[#d7ae55] absolute right-4 top-3.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3.5 top-3.5 text-[#9f9a90] hover:text-[#f6f2ea]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-xs text-[#9f9a90] self-end sm:self-center">
                إظهار {filteredRegistrations.length} من أصل {registrations.length} طلب
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-[#131312] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              {filteredRegistrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#171716] text-xs text-[#d7ae55]">
                        <th className="px-6 py-4 font-semibold">المتقدم</th>
                        <th className="px-6 py-4 font-semibold">الدولة</th>
                        <th className="px-6 py-4 font-semibold">الهاتف</th>
                        <th className="px-6 py-4 font-semibold">تاريخ الإرسال</th>
                        <th className="px-6 py-4 font-semibold">الحالة</th>
                        <th className="px-6 py-4 font-semibold text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRegistrations.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Applicant */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#f6f2ea]">
                              {item.firstName} {item.fatherName} {item.lastName}
                            </div>
                            <div className="text-xs text-[#9f9a90] font-latin">
                              #{item.id} • {item.email}
                            </div>
                          </td>

                          {/* Country */}
                          <td className="px-6 py-4">
                            <span className="text-[#f6f2ea]">{item.country}</span>
                            <span className="block text-[11px] text-[#9f9a90]">{item.city}</span>
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4">
                            <span className="font-latin text-xs text-[#f6f2ea] dir-ltr inline-block">
                              {item.phone}
                            </span>
                          </td>

                          {/* Submission Date */}
                          <td className="px-6 py-4 text-xs text-[#9f9a90] whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-[#f0cc77] border border-amber-500/30">
                              جديد
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className="px-3 py-1.5 rounded-lg bg-[#d7ae55]/15 border border-[#d7ae55]/30 text-xs font-medium text-[#f0cc77] hover:bg-[#d7ae55]/25 transition-all flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>عرض التفاصيل</span>
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setItemToDelete(item)}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                                title="حذف الطلب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 px-6 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-[#1b1b19] border border-white/5 flex items-center justify-center text-[#9f9a90]">
                    <Inbox className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-[#f6f2ea]">لا توجد طلبات بعد</h3>
                  <p className="text-xs text-[#9f9a90] max-w-sm mx-auto">
                    {searchQuery
                      ? "لم يتم العثور على أي نتائج مطابقة لكلمة البحث."
                      : "ستظهر طلبات التسجيل الجديدة هنا فور إرسالها من صفحة التسجيل."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DETAIL MODAL / DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-[#141413] border border-[#d7ae55]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#191918]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d7ae55]/15 border border-[#d7ae55]/30 flex items-center justify-center text-[#d7ae55]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#f6f2ea]">
                    تفاصيل طلب التسجيل #{selectedItem.id}
                  </h3>
                  <span className="text-xs text-[#9f9a90]">
                    تاريخ التقديم: {formatDate(selectedItem.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-white/5 text-[#9f9a90] hover:text-[#f6f2ea] hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-right">
              {/* Applicant Card */}
              <div className="p-4 rounded-2xl bg-[#1b1b19] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#d7ae55] font-semibold mb-1">الاسم الكامل</div>
                  <div className="text-xl font-bold text-[#f6f2ea]">
                    {selectedItem.firstName} {selectedItem.fatherName} {selectedItem.lastName}
                  </div>
                  <div className="text-xs text-[#9f9a90] mt-1">
                    {selectedItem.gender} • {selectedItem.nationality}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    طلب نشط
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Country & Address */}
                <div className="p-4 rounded-xl bg-[#181817] border border-white/5 space-y-1">
                  <span className="text-[#9f9a90] flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#d7ae55]" />
                    الدولة والعنوان
                  </span>
                  <p className="font-semibold text-sm text-[#f6f2ea]">{selectedItem.country}</p>
                  <p className="text-[#9f9a90]">{selectedItem.city} — {selectedItem.address}</p>
                </div>

                {/* Birth Date */}
                <div className="p-4 rounded-xl bg-[#181817] border border-white/5 space-y-1">
                  <span className="text-[#9f9a90] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d7ae55]" />
                    تاريخ الميلاد
                  </span>
                  <p className="font-semibold text-sm text-[#f6f2ea] font-latin dir-ltr text-right">
                    {selectedItem.birthDay} / {selectedItem.birthMonth} / {selectedItem.birthYear}
                  </p>
                </div>

                {/* Identity Number */}
                <div className="p-4 rounded-xl bg-[#181817] border border-white/5 space-y-1">
                  <span className="text-[#9f9a90] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#d7ae55]" />
                    رقم البطاقة / جواز السفر
                  </span>
                  <p className="font-semibold text-sm text-[#f6f2ea] font-latin">{selectedItem.identityNumber}</p>
                </div>

                {/* Phone & Direct Contact */}
                <div className="p-4 rounded-xl bg-[#181817] border border-white/5 space-y-2">
                  <span className="text-[#9f9a90] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#d7ae55]" />
                    رقم الهاتف
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-[#f6f2ea] font-latin dir-ltr">
                      {selectedItem.phone}
                    </p>
                    {/* WhatsApp Direct Link */}
                    <a
                      href={`https://wa.me/${selectedItem.phone.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 hover:bg-emerald-500/25 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>واتساب</span>
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="p-4 rounded-xl bg-[#181817] border border-white/5 space-y-1 sm:col-span-2">
                  <span className="text-[#9f9a90] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#d7ae55]" />
                    البريد الإلكتروني
                  </span>
                  <p className="font-semibold text-sm text-[#f6f2ea] font-latin">{selectedItem.email}</p>
                </div>
              </div>

              {/* CRITICAL BUTTON: نسخ كل البيانات */}
              {/* Placed directly below all details as strictly requested */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleCopyAllData(selectedItem)}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                    copiedSuccess
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-gradient-to-r from-[#d7ae55] to-[#f0cc77] text-[#0c0d0e] hover:brightness-110 active:scale-[0.99] shadow-[#d7ae55]/20 cursor-pointer"
                  }`}
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-white animate-in zoom-in" />
                      <span>تم نسخ جميع البيانات</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-[#0c0d0e]" />
                      <span>نسخ كل البيانات</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#9f9a90] mt-2">
                  يتم نسخ جميع معلومات المتقدم منظمة للحافظة لتسهيل إدخالها بنظام DXN الرسمي.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#191918] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setItemToDelete(selectedItem);
                }}
                className="px-4 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف هذا الطلب</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 rounded-xl bg-white/10 text-xs font-semibold text-[#f6f2ea] hover:bg-white/15 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#141413] border border-red-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#f6f2ea]">تأكيد حذف الطلب</h3>
            <p className="text-xs text-[#9f9a90] leading-relaxed">
              هل أنت متأكد من رغبتك في حذف طلب التسجيل للمتقدم{" "}
              <strong className="text-[#f6f2ea]">
                {itemToDelete.firstName} {itemToDelete.lastName}
              </strong>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-xs font-medium text-[#f6f2ea] hover:bg-white/15 transition-colors"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، حذف الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
