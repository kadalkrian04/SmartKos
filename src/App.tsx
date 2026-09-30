import React, { useState, useEffect, Component } from 'react';
import { 
  Users, DoorOpen, CreditCard, Settings, LogOut, 
  CheckCircle, XCircle, Fingerprint, Activity, FileText, Plus, Edit, Trash2, RefreshCcw, 
  Save, ShieldCheck, History, Cpu, Wifi, TrendingUp, TrendingDown, AlertCircle, 
  Home, Calendar, UserCheck, Receipt, DollarSign, ChevronRight, Phone, Clock,
  BarChart3, Printer, Search, ArrowUpRight, ArrowDownRight, Wallet, FileSpreadsheet, Download,
  Smartphone, Banknote, User, Mail, MapPin, UserPlus, Lock, Unlock, X, Sparkles,
  MessageSquare, Send, Menu
} from 'lucide-react';
import axios from 'axios';

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'Terjadi kesalahan sistem' };
  }
  componentDidCatch(error: any, info: any) {
    console.error("SmartKos Crash Prevented:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Terjadi Gangguan Tampilan</h2>
            <p className="text-xs text-slate-500 mb-4 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left overflow-auto max-h-24">
              {this.state.error}
            </p>
            <button 
              onClick={() => {
                localStorage.removeItem('smartkos_view');
                window.location.reload();
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
            >
              Segarkan & Pulihkan Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const renderPaymentBadge = (methodRaw: string, onEditClick?: () => void) => {
  const method = (methodRaw || 'QRIS').trim();
  const mUpper = method.toUpperCase();

  let badgeContent = null;

  if (mUpper.includes('DANA')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-sky-50 text-sky-700 border border-sky-300 inline-flex items-center shadow-xs">
        <span className="w-2 h-2 rounded-full bg-sky-500 mr-1.5"></span>
        QRIS DANA
      </span>
    );
  } else if (mUpper.includes('GOPAY')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 inline-flex items-center shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
        QRIS GoPay
      </span>
    );
  } else if (mUpper.includes('BCA')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-300 inline-flex items-center shadow-xs">
        <Smartphone size={12} className="mr-1 text-blue-600" />
        QRIS BCA
      </span>
    );
  } else if (mUpper.includes('SHOPEE') || mUpper.includes('SPAY')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-orange-50 text-orange-700 border border-orange-300 inline-flex items-center shadow-xs">
        <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span>
        QRIS ShopeePay
      </span>
    );
  } else if (mUpper.includes('OVO')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-50 text-purple-700 border border-purple-300 inline-flex items-center shadow-xs">
        <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
        QRIS OVO
      </span>
    );
  } else if (mUpper.includes('MANDIRI') || mUpper.includes('LIVIN')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-300 inline-flex items-center shadow-xs">
        <Smartphone size={12} className="mr-1 text-indigo-600" />
        QRIS Mandiri
      </span>
    );
  } else if (mUpper.includes('BRI') || mUpper.includes('BRIMO')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-cyan-50 text-cyan-700 border border-cyan-300 inline-flex items-center shadow-xs">
        <Smartphone size={12} className="mr-1 text-cyan-600" />
        QRIS BRI
      </span>
    );
  } else if (mUpper.includes('TUNAI') || mUpper.includes('MANUAL')) {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-300 inline-flex items-center shadow-xs">
        <Banknote size={12} className="mr-1 text-amber-600" />
        Tunai / Manual
      </span>
    );
  } else {
    badgeContent = (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center">
        <Smartphone size={12} className="mr-1 text-slate-500" />
        {method.toUpperCase().startsWith('QRIS') ? method : `QRIS ${method}`}
      </span>
    );
  }

  if (onEditClick) {
    return (
      <button 
        type="button" 
        onClick={onEditClick}
        className="group inline-flex items-center gap-1.5 hover:opacity-85 transition cursor-pointer text-left"
        title="Klik untuk ubah channel pembayaran"
      >
        {badgeContent}
        <Edit size={12} className="text-slate-400 group-hover:text-blue-600 transition" />
      </button>
    );
  }

  return badgeContent;
};

const formatDateSafe = (dateVal: any) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return '-';
  }
};

const formatDueDate25 = (dateVal: any) => {
  if (!dateVal) {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `25/${m}/${now.getFullYear()}`;
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      const now = new Date();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      return `25/${m}/${now.getFullYear()}`;
    }
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `25/${m}/${d.getFullYear()}`;
  } catch (e) {
    return '25/-';
  }
};

const isResidentPaid = (resident: any, residentBills: any[]) => {
  if (!resident) return false;

  const hasLunasBill = residentBills.some(b => b.status === 'lunas');
  const pendingBills = residentBills.filter(b => b.status === 'pending');
  const hasPendingBill = pendingBills.length > 0;

  const isEverPaid = Boolean(
    hasLunasBill || 
    resident.is_fingerprint_active || 
    (resident.active_until && new Date(resident.active_until).getTime() > 0)
  );

  if (!isEverPaid) {
    return false;
  }

  if (!hasPendingBill) {
    return true;
  }

  const now = new Date();
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isOverdue = pendingBills.some(b => {
    let dueYear = now.getFullYear();
    let dueMonth = now.getMonth();
    let dueDay = 25;

    if (b.due_date) {
      const d = new Date(b.due_date);
      if (!isNaN(d.getTime())) {
        dueYear = d.getFullYear();
        dueMonth = d.getMonth();
        dueDay = 25;
      }
    }

    const dueDateOnly = new Date(dueYear, dueMonth, dueDay);
    return todayOnly.getTime() > dueDateOnly.getTime();
  });

  return !isOverdue;
};

function AppContent() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('smartkos_user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('smartkos_view');
    if (saved === 'admin_bills' || saved === 'admin_history') return 'admin_payments';
    return saved || 'login';
  }); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastRegUsername, setLastRegUsername] = useState('');
  
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settings, setSettings] = useState({ tokopay_merchant_id: '', tokopay_secret_key: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isScanningFP, setIsScanningFP] = useState(false);
  const [enrollCountdown, setEnrollCountdown] = useState(60);
  
  const [toast, setToast] = useState<{msg: string, type: string} | null>(null);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [qrisData, setQrisData] = useState<string | null>(null);
  const [roomModal, setRoomModal] = useState<any>(null);
  const [billModal, setBillModal] = useState<any>(null);
  const [expenseModal, setExpenseModal] = useState(false);
  const [enrollSuccessModal, setEnrollSuccessModal] = useState<any>(null);
  const [changeMethodModal, setChangeMethodModal] = useState<any>(null);
  const [floorFilter, setFloorFilter] = useState<'all' | 'lt2' | 'lt3'>('all');
  const [settingsTab, setSettingsTab] = useState<'tokopay' | 'devices' | 'fonnte'>('tokopay');
  const [paymentTab, setPaymentTab] = useState<'pending' | 'history'>('pending');
  const [residentFloorFilter, setResidentFloorFilter] = useState<'all' | 'lt2' | 'lt3'>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const [testWaPhone, setTestWaPhone] = useState('');

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterTab, setUserFilterTab] = useState<'all' | 'no_room' | 'has_room' | 'active'>('all');
  const [adminUserModal, setAdminUserModal] = useState<{ type: 'add' | 'edit', data?: any } | null>(null);
  const [deleteUserModal, setDeleteUserModal] = useState<any | null>(null);

  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [appliedStartDate, setAppliedStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [appliedEndDate, setAppliedEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const showToast = (msg: string, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smartkos_user', JSON.stringify(currentUser));
      localStorage.setItem('smartkos_view', view);
    } else {
      localStorage.removeItem('smartkos_user');
      localStorage.removeItem('smartkos_view');
    }
  }, [currentUser, view]);

  const fetchDashboardData = async (isManual = false, isBackground = false) => {
    if (!currentUser) return;
    if (!isBackground) setIsLoading(true);
    try {
      if (currentUser.role === 'admin') {
        const [resUsers, resRooms, resBills, resLogs, resSettings, resExpenses] = await Promise.all([
          axios.get('/api/users').catch(() => ({ data: [] })), 
          axios.get('/api/rooms').catch(() => ({ data: [] })), 
          axios.get('/api/bills').catch(() => ({ data: [] })), 
          axios.get('/api/logs').catch(() => ({ data: [] })), 
          axios.get('/api/settings').catch(() => ({ data: {} })),
          axios.get('/api/expenses').catch(() => ({ data: [] }))
        ]);
        setUsers(Array.isArray(resUsers.data) ? resUsers.data : []); 
        setRooms(Array.isArray(resRooms.data) ? resRooms.data : []); 
        setBills(Array.isArray(resBills.data) ? resBills.data : []); 
        setLogs(Array.isArray(resLogs.data) ? resLogs.data : []); 
        setSettings(resSettings.data || {});
        setExpenses(Array.isArray(resExpenses.data) ? resExpenses.data : []);
        if (isManual) showToast('Data dashboard berhasil diperbarui', 'success');
      } else {
        const [resRooms, resBills] = await Promise.all([
          axios.get('/api/rooms').catch(() => ({ data: [] })), 
          axios.get('/api/bills').catch(() => ({ data: [] }))
        ]);
        const rList = Array.isArray(resRooms.data) ? resRooms.data : [];
        const bList = Array.isArray(resBills.data) ? resBills.data : [];
        setRooms(rList); 
        setBills(bList); 
         
        const myBill = bList.find((b: any) => b.user_id === currentUser.id);
        if (!myBill && currentUser.active_until === null && currentUser.room_id) {
          const updatedUser = {...currentUser, room_id: null};
          setCurrentUser(updatedUser);
          showToast('Waktu pembayaran habis. Kamar dibatalkan otomatis.', 'error');
        } else if (isManual) {
          showToast('Data berhasil diperbarui', 'success');
        }
      }
    } catch (error) {
      if (!isBackground) showToast('Gagal memuat data dari server.', 'error');
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || view === 'login' || view === 'register') return;

    fetchDashboardData(false, false);

    const realTimeInterval = setInterval(() => {
      fetchDashboardData(false, true);
    }, 4000);

    return () => clearInterval(realTimeInterval);
  }, [currentUser, view]);

  useEffect(() => {
    let intervalId: any;

    if (paymentModal) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get('/api/bills');
          const bList = Array.isArray(response.data) ? response.data : [];
          const updatedBill = bList.find((b: any) => b.id === paymentModal.id);
          
          if (updatedBill && updatedBill.status === 'lunas') {
            setPaymentModal(null);
            const updatedUser = {
              ...currentUser, 
              is_fingerprint_active: true, 
              active_until: new Date(Date.now() + (37 * 24 * 60 * 60 * 1000)).toISOString()
            };
            setCurrentUser(updatedUser);
            const methodUsed = updatedBill.payment_method || 'QRIS';
            showToast(`🎉 Pembayaran via ${methodUsed} Berhasil! Akses Kamar & Sidik Jari telah aktif.`, 'success');
            fetchDashboardData();
            clearInterval(intervalId); 
          }
        } catch (error) {}
      }, 3000);
    }

    return () => { if (intervalId) clearInterval(intervalId); };
  }, [paymentModal]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { 
        username: e.target.username.value, password: e.target.password.value 
      });
      if (response.data.success) {
        setCurrentUser(response.data.user);
        setView(response.data.user.role === 'admin' ? 'admin_dashboard' : 'resident_dashboard');
        showToast(`Selamat datang, ${response.data.user.name}`, 'success');
      } else {
        showToast(response.data.message, 'error');
      }
    } catch (error) { showToast('Koneksi server gagal.', 'error'); } 
    finally { setIsLoading(false); }
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.target);
    const newUsername = fd.get('username') as string;
    try {
      const response = await axios.post('/api/auth/register', { 
        name: fd.get('name'),
        address: fd.get('address'),
        username: newUsername,
        email: fd.get('email'),
        phone: fd.get('phone'),
        password: fd.get('password')
      });
      if (response.data.success) {
        setLastRegUsername(newUsername);
        showToast('Pendaftaran berhasil! Silakan login.', 'success');
        setView('login');
      } else { showToast(response.data.message, 'error'); }
    } catch (error) { showToast('Gagal mendaftar akun.', 'error'); } 
    finally { setIsLoading(false); }
  };

  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.target);
    try {
      const response = await axios.post('/api/auth/update-profile', {
        userId: currentUser?.id,
        name: fd.get('name'),
        address: fd.get('address'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        password: fd.get('password')
      });
      if (response.data.success) {
        setCurrentUser(response.data.user);
        showToast('Profil Anda berhasil diperbarui!', 'success');
      } else {
        showToast(response.data.message || 'Gagal update profil', 'error');
      }
    } catch (error) {
      showToast('Koneksi server gagal.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => { 
    setCurrentUser(null); 
    setView('login'); 
    setIsMobileMenuOpen(false);
    localStorage.removeItem('smartkos_user');
    localStorage.removeItem('smartkos_view');
  };

  const handleSaveRoom = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { number: fd.get('number'), name: fd.get('name'), price: parseInt(fd.get('price') as string, 10) };
    setIsLoading(true);
    try {
      if (roomModal.type === 'add') await axios.post('/api/rooms', payload);
      else await axios.put(`/api/rooms?id=${roomModal.data.id}`, payload);
      showToast('Data kamar disimpan', 'success'); setRoomModal(null); fetchDashboardData();
    } catch (error) { showToast('Gagal menyimpan kamar', 'error'); } 
    finally { setIsLoading(false); }
  };

  const handleDeleteRoom = async (id: number) => {
    try {
      await axios.delete(`/api/rooms?id=${id}`);
      showToast('Kamar berhasil dihapus', 'success'); 
      fetchDashboardData();
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Gagal menghapus kamar. Pastikan tidak ada penghuni aktif.', 'error'); 
    }
  };

  const handleToggleRoomFingerprint = async (id: number, currentStatus: boolean) => {
    try {
      await axios.put(`/api/rooms?id=${id}`, { fingerprint_status: !currentStatus });
      fetchDashboardData();
      showToast(`Hardware Fingerprint ${!currentStatus ? 'Diaktifkan' : 'Dinonaktifkan'}`, 'success');
    } catch (error) { showToast('Gagal update hardware', 'error'); }
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await axios.delete(`/api/bills?id=${id}`);
      showToast('Riwayat transaksi berhasil dihapus', 'success'); 
      fetchDashboardData();
    } catch (error) { showToast('Gagal menghapus riwayat', 'error'); }
  };

  const handleClearLogs = async () => {
    setIsLoading(true);
    try {
      await axios.delete('/api/logs');
      showToast('Semua catatan log pintu berhasil dibersihkan', 'success');
      fetchDashboardData();
    } catch (error) { showToast('Gagal membersihkan log', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleSaveDevice = async (roomId: number, deviceId: string) => {
    setIsLoading(true);
    try {
      await axios.put(`/api/rooms?id=${roomId}`, { device_id: deviceId });
      showToast('Perangkat Fingerprint berhasil dihubungkan!', 'success');
      fetchDashboardData();
    } catch (error) { showToast('Gagal menghubungkan perangkat', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleSaveExpense = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.target);
    try {
      await axios.post('/api/expenses', {
        title: fd.get('title'),
        nominal: fd.get('nominal'),
        category: fd.get('category'),
        expense_date: fd.get('expense_date')
      });
      showToast('Pengeluaran berhasil dicatat!', 'success');
      setExpenseModal(false);
      fetchDashboardData();
    } catch (err) {
      showToast('Gagal menyimpan pengeluaran', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await axios.delete(`/api/expenses?id=${id}`);
      showToast('Data pengeluaran berhasil dihapus', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Gagal menghapus data pengeluaran', 'error');
    }
  };

  const handleSaveSettings = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.target);
    try {
      await axios.post('/api/settings', {
        merchant_id: fd.get('merchant_id') !== null ? fd.get('merchant_id') : settings.tokopay_merchant_id,
        secret_key: fd.get('secret_key') !== null ? fd.get('secret_key') : settings.tokopay_secret_key,
        fonnte_token: fd.get('fonnte_token') !== null ? fd.get('fonnte_token') : ((settings as any).fonnte_token || '')
      });
      showToast('Konfigurasi pengaturan berhasil disimpan!', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal simpan setting', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestFonnte = async () => {
    if (!testWaPhone.trim()) {
      showToast('Masukkan nomor WhatsApp tujuan tes terlebih dahulu', 'error');
      return;
    }
    setIsLoading(true);
    showToast('Mengirim pesan tes via Fonnte...', 'info');
    try {
      const res = await axios.post('/api/whatsapp?action=test', { phone: testWaPhone });
      if (res.data.success) {
        showToast('Pesan WhatsApp uji coba berhasil terkirim!', 'success');
      } else {
        showToast(res.data.message || 'Gagal mengirim pesan', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal terhubung ke WhatsApp Fonnte', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWaReminder = async (billId: number) => {
    setIsLoading(true);
    showToast('Mengirim pengingat WhatsApp...', 'info');
    try {
      const res = await axios.post('/api/whatsapp?action=send-reminder', { bill_id: billId });
      if (res.data.success) {
        showToast('Pesan pengingat jatuh tempo berhasil dikirim ke WhatsApp penghuni!', 'success');
        fetchDashboardData();
      } else {
        showToast(res.data.message || 'Gagal mengirim pengingat', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengirim WhatsApp', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTokoPay = async () => {
    showToast('Menghubungi Server TokoPay...', 'info');
    try {
      const response = await axios.get('/api/payment/test');
      if (response.data.success) showToast(response.data.message, 'success');
      else showToast(response.data.message, 'error');
    } catch (error) { showToast('Error koneksi API TokoPay', 'error'); }
  };

  const handleChooseRoom = async (roomId: number) => {
    try {
      const response = await axios.post('/api/users?action=choose-room', { userId: currentUser?.id, roomId });
      if (response.data.success) {
        showToast('Kamar dipesan! Segera lunasi tagihan.', 'success');
        setCurrentUser({ ...currentUser, room_id: roomId }); fetchDashboardData();
      } else { showToast(response.data.message, 'error'); }
    } catch (error) { showToast('Gagal memproses kamar. Coba lagi.', 'error'); }
  };

  const handleSaveAdminUser = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.target);
    const payload: any = {
      name: fd.get('name'),
      username: fd.get('username'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      address: fd.get('address'),
      room_id: fd.get('room_id') ? Number(fd.get('room_id')) : null,
    };
    const pwd = fd.get('password');
    if (pwd && String(pwd).trim() !== '') {
      payload.password = String(pwd).trim();
    }

    try {
      if (adminUserModal?.type === 'add') {
        const res = await axios.post('/api/users?action=admin-create', payload);
        if (res.data.success) {
          showToast('Akun penghuni baru berhasil dibuat!', 'success');
          setAdminUserModal(null);
          fetchDashboardData();
        } else {
          showToast(res.data.message || 'Gagal membuat akun', 'error');
        }
      } else {
        payload.userId = adminUserModal?.data?.id;
        const res = await axios.put('/api/users', payload);
        if (res.data.success) {
          showToast('Data akun berhasil diperbarui!', 'success');
          setAdminUserModal(null);
          fetchDashboardData();
        } else {
          showToast(res.data.message || 'Gagal update data', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memproses ke server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteUserModal) return;
    setIsLoading(true);
    try {
      await axios.delete(`/api/users?id=${deleteUserModal.id}`);
      showToast(`Akun ${deleteUserModal.name} berhasil dihapus permanen`, 'success');
      setDeleteUserModal(null);
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus pengguna', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserAccess = async (u: any) => {
    setIsLoading(true);
    try {
      const nextActive = !u.is_fingerprint_active;
      await axios.put('/api/users', {
        userId: u.id,
        fingerprint_id: nextActive ? (u.fingerprint_id || u.id.toString()) : u.fingerprint_id,
        is_fingerprint_active: nextActive
      });
      showToast(`Akses pintu ${u.name} ${nextActive ? 'diaktifkan (Lunas)' : 'dikunci (Terkunci)'}!`, 'success');
      fetchDashboardData();
    } catch (e) {
      showToast('Gagal mengubah status akses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBills = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/bills'); showToast('Tagihan otomatis dibuat (ADIBKOS)', 'success'); fetchDashboardData();
    } catch (error) { showToast('Gagal membuat tagihan', 'error'); } 
    finally { setIsLoading(false); }
  };

  const handleEditBill = async (e: any) => {
    e.preventDefault();
    try {
      await axios.put(`/api/bills?id=${billModal.id}`, { nominal: e.target.nominal.value });
      showToast('Tagihan diperbarui', 'success'); setBillModal(null); fetchDashboardData();
    } catch (error) { showToast('Gagal update', 'error'); }
  };

  const handleSetLunasManual = async (billId: number, userId: number) => {
    setIsLoading(true);
    try {
      await axios.put(`/api/bills?id=${billId}`, { action: 'set_lunas', user_id: userId, payment_method: 'Tunai / Manual' });
      showToast('Tagihan dilunasi manual (Tunai)! Akses kamar aktif.', 'success');
      fetchDashboardData();
    } catch (error) { showToast('Gagal set lunas tagihan', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleChangePaymentMethod = async (billId: number, newMethod: string) => {
    setIsLoading(true);
    try {
      await axios.put(`/api/bills?id=${billId}`, { payment_method: newMethod });
      showToast(`Metode pembayaran berhasil diubah ke ${newMethod}`, 'success');
      setChangeMethodModal(null);
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal memperbarui metode pembayaran', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayQRIS = async (bill: any) => {
    setPaymentModal(bill); setQrisData(null);
    try {
      const response = await axios.post('/api/payment/qris', { refId: bill.ref_id, nominal: bill.nominal });
      if (response.data.success) {
        setQrisData(response.data.qr_url);
        if(response.data.new_ref_id) {
           setPaymentModal({...bill, ref_id: response.data.new_ref_id});
           fetchDashboardData();
        }
      } else {
        showToast(response.data.message || 'Gagal koneksi TokoPay', 'error');
        setPaymentModal(null);
      }
    } catch (error) { 
      showToast('Error API TokoPay', 'error');
      setPaymentModal(null);
    }
  };

  const handleStartEnrollment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/users?action=start-enroll', { userId: currentUser?.id });
      if (response.data.success) {
        setCurrentUser({ ...currentUser, fingerprint_id: null });
        setIsScanningFP(true);
        setEnrollCountdown(90);
        showToast('Mode rekam aktif! Tempelkan jari Anda ke sensor di pintu sekarang.', 'info');
      } else {
        showToast(response.data.message, 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Gagal memulai pendaftaran', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEnrollment = async () => {
    try {
      await axios.post('/api/users?action=cancel-enroll', { userId: currentUser?.id });
    } catch (e) {}
    setIsScanningFP(false);
    showToast('Perekaman sidik jari dibatalkan.', 'info');
  };

  useEffect(() => {
    let timer: any;
    let pollInterval: any;

    if (isScanningFP && currentUser) {
      timer = setInterval(() => {
        setEnrollCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsScanningFP(false);
            showToast('Waktu pendaftaran habis. Silakan coba lagi.', 'error');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      pollInterval = setInterval(async () => {
        try {
          const res = await axios.get('/api/users');
          const uList = Array.isArray(res.data) ? res.data : [];
          const myData = uList.find((u: any) => u.id === currentUser?.id);
          
          if (myData && myData.fingerprint_id) {
            setCurrentUser({ 
              ...currentUser, 
              fingerprint_id: myData.fingerprint_id, 
              is_fingerprint_active: true 
            });
            setIsScanningFP(false);
            clearInterval(pollInterval);
            clearInterval(timer);
            setEnrollSuccessModal({ slot_id: myData.fingerprint_id });
            fetchDashboardData();
          }
        } catch (e) {}
      }, 2000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isScanningFP, currentUser]);

  const handleResetResidentFp = async () => {
    setIsLoading(true);
    try {
      await axios.put('/api/users', {
        userId: currentUser?.id,
        fingerprint_id: null
      });
      const updatedUser = { ...currentUser, fingerprint_id: null };
      setCurrentUser(updatedUser);
      showToast('Sidik jari berhasil direset. Silakan daftarkan jari baru.', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal menghapus sidik jari', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const safeBills = Array.isArray(bills) ? bills : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  const totalPemasukan = safeBills
    .filter(b => b.status === 'lunas')
    .reduce((sum, b) => sum + (Number(b.nominal) || 0), 0);

  const totalPengeluaran = safeExpenses
    .reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);

  const isRoomOccupied = (r: any) => {
    if (!r) return false;
    const hasResident = safeUsers.some(u => 
      (!u.role || u.role === 'resident' || u.role !== 'admin') && (
        (u.room_id && (String(u.room_id).trim() === String(r.id).trim() || String(u.room_id).trim() === String(r.number).trim())) ||
        (r.resident_id && String(r.resident_id).trim() === String(u.id).trim())
      )
    );
    return hasResident || r.status === 'occupied' || Boolean(r.resident_id);
  };

  const unpaidTenantsCount = safeRooms.filter(r => {
    if (!isRoomOccupied(r)) return false;
    const resident = safeUsers.find(u => 
      (r.resident_id && String(u.id).trim() === String(r.resident_id).trim()) ||
      (u.room_id && (String(u.room_id).trim() === String(r.id).trim() || String(u.room_id).trim() === String(r.number).trim()))
    );
    const targetUserId = resident?.id || r.resident_id;
    const residentBills = safeBills.filter(b => targetUserId && String(b.user_id).trim() === String(targetUserId).trim());
    return !isResidentPaid(resident, residentBills);
  }).length;

  const totalBelumLunas = unpaidTenantsCount;

  const totalKamarCount = safeRooms.length || 1;
  const kamarTerisiCount = safeRooms.filter(r => isRoomOccupied(r)).length;
  const kamarKosongCount = Math.max(0, safeRooms.length - kamarTerisiCount);
  const occupancyPercent = safeRooms.length > 0 ? Math.round((kamarTerisiCount / safeRooms.length) * 100) : 0;

  const handleApplyReportFilter = () => {
    setAppliedStartDate(reportStartDate);
    setAppliedEndDate(reportEndDate);
    showToast('Laporan berhasil disaring sesuai tanggal', 'info');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredReportBills = safeBills.filter(b => {
    if (b.status !== 'lunas') return false;
    const dateStr = (b.created_at || b.due_date || '').split('T')[0];
    if (!dateStr) return true;
    return dateStr >= appliedStartDate && dateStr <= appliedEndDate;
  });

  const filteredReportExpenses = safeExpenses.filter(e => {
    const dateStr = (e.expense_date || e.created_at || '').split('T')[0];
    if (!dateStr) return true;
    return dateStr >= appliedStartDate && dateStr <= appliedEndDate;
  });

  const reportPemasukan = filteredReportBills.reduce((sum, b) => sum + (Number(b.nominal) || 0), 0);
  const reportPengeluaran = filteredReportExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);
  const reportKeuntunganBersih = reportPemasukan - reportPengeluaran;

  const combinedReportTransactions = [
    ...filteredReportBills.map(b => {
      const user = safeUsers.find(u => u.id === b.user_id);
      const room = safeRooms.find(r => r.id === user?.room_id);
      const method = b.payment_method || 'QRIS';
      return {
        id: `bill-${b.id}`,
        date: (b.created_at || b.due_date || '').split('T')[0],
        type: 'Pemasukan',
        category: room ? `Kamar ${room.number}` : 'Sewa Kamar',
        description: `Pembayaran Sewa: ${user?.name || `User #${b.user_id}`} (${method})`,
        paymentMethod: method,
        income: Number(b.nominal) || 0,
        expense: 0
      };
    }),
    ...filteredReportExpenses.map(e => ({
      id: `exp-${e.id}`,
      date: (e.expense_date || e.created_at || '').split('T')[0],
      type: 'Pengeluaran',
      category: e.category || 'Operasional',
      description: e.title || '-',
      paymentMethod: 'Kas Kos',
      income: 0,
      expense: Number(e.nominal) || 0
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleExportExcel = () => {
    if (combinedReportTransactions.length === 0) {
      showToast('Tidak ada data transaksi pada rentang tanggal ini untuk diekspor', 'error');
      return;
    }

    let runningBalance = 0;
    const rowsHtml = combinedReportTransactions.map((t, idx) => {
      runningBalance += (t.income - t.expense);
      return `
        <tr>
          <td style="text-align:center;border:1px solid #94a3b8;">${idx + 1}</td>
          <td style="text-align:center;border:1px solid #94a3b8;">${t.date}</td>
          <td style="text-align:center;font-weight:bold;color:${t.type === 'Pemasukan' ? '#0284c7' : '#e11d48'};border:1px solid #94a3b8;">${t.type}</td>
          <td style="border:1px solid #94a3b8;">${t.category}</td>
          <td style="border:1px solid #94a3b8;">${t.description}</td>
          <td style="text-align:center;font-weight:bold;border:1px solid #94a3b8;">${t.paymentMethod}</td>
          <td style="text-align:right;border:1px solid #94a3b8;color:#0284c7;">${t.income > 0 ? t.income.toLocaleString('id-ID') : '-'}</td>
          <td style="text-align:right;border:1px solid #94a3b8;color:#e11d48;">${t.expense > 0 ? t.expense.toLocaleString('id-ID') : '-'}</td>
          <td style="text-align:right;font-weight:bold;border:1px solid #94a3b8;color:${runningBalance >= 0 ? '#16a34a' : '#e11d48'};">${runningBalance.toLocaleString('id-ID')}</td>
        </tr>
      `;
    }).join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
          th { background-color: #1e293b; color: #ffffff; border: 1px solid #0f172a; padding: 8px 12px; font-size: 11pt; text-align: center; }
          td { padding: 6px 10px; vertical-align: middle; }
          .header-box { background-color: #f1f5f9; font-weight: bold; border: 1px solid #cbd5e1; text-align: center; }
          .title { font-size: 16pt; font-weight: bold; text-align: center; }
          .subtitle { font-size: 11pt; text-align: center; color: #475569; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="9" class="title">LAPORAN ARUS KAS & KEUANGAN SMARTKOS</td></tr>
          <tr><td colspan="9" class="subtitle">Periode: ${appliedStartDate} s/d ${appliedEndDate} | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}</td></tr>
          <tr><td colspan="9"></td></tr>
          <tr>
            <td colspan="3" class="header-box">TOTAL PEMASUKAN</td>
            <td colspan="3" class="header-box">TOTAL PENGELUARAN</td>
            <td colspan="3" class="header-box">KEUNTUNGAN BERSIH (LABA)</td>
          </tr>
          <tr style="font-size: 13pt; font-weight: bold;">
            <td colspan="3" style="border:1px solid #cbd5e1; color:#0284c7; text-align:center;">Rp ${reportPemasukan.toLocaleString('id-ID')}</td>
            <td colspan="3" style="border:1px solid #cbd5e1; color:#e11d48; text-align:center;">Rp ${reportPengeluaran.toLocaleString('id-ID')}</td>
            <td colspan="3" style="border:1px solid #cbd5e1; color:${reportKeuntunganBersih >= 0 ? '#16a34a' : '#e11d48'}; text-align:center;">Rp ${reportKeuntunganBersih.toLocaleString('id-ID')}</td>
          </tr>
          <tr><td colspan="9"></td></tr>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Kamar / Kategori</th>
              <th>Keterangan / Penghuni</th>
              <th>Metode Bayar</th>
              <th>Pemasukan (Rp)</th>
              <th>Pengeluaran (Rp)</th>
              <th>Saldo Kumulatif (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="6" style="text-align: right; border: 1px solid #94a3b8;">TOTAL:</td>
              <td style="text-align: right; border: 1px solid #94a3b8; color: #0284c7;">Rp ${reportPemasukan.toLocaleString('id-ID')}</td>
              <td style="text-align: right; border: 1px solid #94a3b8; color: #e11d48;">Rp ${reportPengeluaran.toLocaleString('id-ID')}</td>
              <td style="text-align: right; border: 1px solid #94a3b8; color: ${reportKeuntunganBersih >= 0 ? '#16a34a' : '#e11d48'};">Rp ${reportKeuntunganBersih.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Keuangan_SmartKos_${appliedStartDate}_sd_${appliedEndDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File Excel (.xls) berhasil diunduh!', 'success');
  };

  const getTrend6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = d.toLocaleDateString('id-ID', { month: 'short' });
      const fullLabel = `${monthLabel} ${year}`;

      const mBills = safeBills.filter(b => {
        if (b.status !== 'lunas') return false;
        const bDate = new Date(b.created_at || b.due_date);
        return bDate.getFullYear() === year && bDate.getMonth() === month;
      });
      const income = mBills.reduce((s, b) => s + (Number(b.nominal) || 0), 0);

      const mExpenses = safeExpenses.filter(e => {
        const eDate = new Date(e.expense_date || e.created_at);
        return eDate.getFullYear() === year && eDate.getMonth() === month;
      });
      const expense = mExpenses.reduce((s, e) => s + (Number(e.nominal) || 0), 0);
      const profit = income - expense;

      months.push({ label: fullLabel, income, expense, profit });
    }
    return months;
  };

  const trendData = getTrend6Months();
  const maxTrendVal = Math.max(
    1000000,
    ...trendData.flatMap(d => [d.income, d.expense, Math.abs(d.profit)])
  );

  const sortedRooms = [...safeRooms].sort((a, b) => {
    const numA = parseInt((a.number || '').toString().replace(/\D/g, ''), 10);
    const numB = parseInt((b.number || '').toString().replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numA - numB;
    }
    return (a.number || '').toString().localeCompare((b.number || '').toString(), undefined, { numeric: true });
  });

  const getRoomFloor = (r: any): number => {
    const nameLower = (r.name || '').toLowerCase();
    if (nameLower.includes('lt 3') || nameLower.includes('lantai 3')) return 3;
    if (nameLower.includes('lt 2') || nameLower.includes('lantai 2')) return 2;
    const num = parseInt((r.number || '').toString().replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      if ((num >= 17 && num <= 19) || (num >= 301 && num <= 399)) return 3;
      if ((num >= 1 && num <= 16) || (num >= 201 && num <= 299)) return 2;
      if (num >= 17) return 3;
      if (num <= 16) return 2;
    }
    return 2;
  };

  const roomsLantai2 = sortedRooms.filter(r => getRoomFloor(r) === 2);
  const roomsLantai3 = sortedRooms.filter(r => getRoomFloor(r) === 3);

  const displayedRooms = floorFilter === 'lt2' 
    ? roomsLantai2 
    : floorFilter === 'lt3' 
      ? roomsLantai3 
      : sortedRooms;

  const totalTenantsWithRooms = safeUsers.filter(u => u.role === 'resident' && u.room_id).length;
  const totalLunasCount = Math.max(0, totalTenantsWithRooms - totalBelumLunas);

  const pendingBillsList = safeBills.filter(b => b.status === 'pending');
  const historyBillsList = safeBills.filter(b => b.status === 'lunas');

  const adminNavItems = [
    { id: 'admin_dashboard', icon: Activity, label: 'Dashboard Utama' },
    { id: 'admin_payments', icon: CreditCard, label: 'Pembayaran' },
    { id: 'admin_expenses', icon: Receipt, label: 'Buku Pengeluaran' },
    { id: 'admin_reports', icon: BarChart3, label: 'Laporan Keuangan' },
    { id: 'admin_logs', icon: FileText, label: 'Log Pintu' },
    { id: 'admin_users', icon: Users, label: 'Kelola User' },
    { id: 'admin_settings', icon: Settings, label: 'Pengaturan' }
  ];

  const renderAuth = () => (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl text-white inline-block mb-3 shadow-md shadow-blue-600/30">
            <Fingerprint size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">SmartKos System</h1>
          <p className="text-slate-500 text-xs sm:text-sm">Masuk / Daftar Area Penghuni</p>
        </div>

        {view === 'login' || (!currentUser && view !== 'register') ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" name="username" defaultValue={lastRegUsername} placeholder="Username" autoComplete="username" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 font-medium" required />
            <input type="password" name="password" placeholder="Password" autoComplete="current-password" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 font-medium" required />
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-700 cursor-pointer text-sm transition">
              {isLoading ? 'Memproses...' : 'Login ke Akun'}
            </button>
            <p className="text-center text-xs sm:text-sm text-slate-600 mt-4">Belum punya kamar? <button type="button" onClick={() => setView('register')} className="text-blue-600 font-bold hover:underline cursor-pointer">Daftar Baru</button></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
              <input type="text" name="name" placeholder="Contoh: Rian Pratama" autoComplete="name" className="w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap (KTP)</label>
              <textarea name="address" rows={2} placeholder="Alamat asal / domisili KTP lengkap" className="w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 resize-none" required></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Username</label>
                <input type="text" name="username" placeholder="Username baru" autoComplete="username" className="w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nomor WhatsApp</label>
                <input type="tel" name="phone" placeholder="Contoh: 08123456789" className="w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Aktif</label>
              <input type="email" name="email" placeholder="nama@email.com" autoComplete="email" className="w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
              <input type="password" name="password" placeholder="Password akun" autoComplete="new-password" className="w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-green-700 transition mt-2 cursor-pointer text-sm">
              {isLoading ? 'Mendaftarkan...' : 'Daftar Akun'}
            </button>
            <p className="text-center text-xs sm:text-sm text-slate-600 mt-3">Sudah punya akun? <button type="button" onClick={() => { setView('login'); setLastRegUsername(''); }} className="text-blue-600 font-bold hover:underline cursor-pointer">Login</button></p>
          </form>
        )}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* 1. MOBILE TOPBAR ADMIN (HANYA MUNCUL DI HP) */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-md print:hidden">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Fingerprint size={20} />
          </div>
          <span className="font-black text-lg tracking-tight">SmartKos</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => fetchDashboardData(true)} 
            className="p-2 text-slate-300 hover:text-white rounded-lg active:scale-95 transition"
            title="Segarkan Data"
          >
            <RefreshCcw size={18} className={isLoading ? 'animate-spin text-blue-400' : ''} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 bg-slate-800 text-white rounded-lg active:scale-95 transition focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 2. MOBILE DRAWER OVERLAY (MENU SLIDE-OVER HP) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex print:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-slate-900 text-white z-50 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Fingerprint className="text-blue-400" size={24} />
                <span className="font-black text-lg">Menu Admin</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto text-sm">
              {adminNavItems.map(item => {
                const isActive = (view === item.id || (item.id === 'admin_payments' && (view === 'admin_bills' || view === 'admin_history')));
                return (
                  <button 
                    key={item.id} 
                    onClick={() => {
                      setView(item.id);
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition cursor-pointer text-left ${isActive ? 'bg-blue-600 font-bold text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    <item.icon size={18} /> <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800">
              <button 
                onClick={logout} 
                className="w-full flex items-center p-3 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition cursor-pointer font-bold text-sm"
              >
                <LogOut size={18} className="mr-3" /> Keluar Sistem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIDEBAR DESKTOP (TETAP SEPERTI BIASA DI KOMPUTER / LAPTOP) */}
      <div className="w-64 bg-slate-900 text-white flex-col hidden md:flex print:hidden flex-shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <Fingerprint className="text-blue-400" size={28} />
          <span className="font-bold text-xl">AdminKos</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
          {adminNavItems.map(item => {
            const isActive = (view === item.id || (item.id === 'admin_payments' && (view === 'admin_bills' || view === 'admin_history')));
            return (
              <button 
                key={item.id} 
                onClick={() => setView(item.id)} 
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition cursor-pointer ${isActive ? 'bg-blue-600 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <item.icon size={18} /> <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center p-3 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition cursor-pointer">
            <LogOut size={18} className="mr-3" /> Keluar
          </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA (RESPONSIF MOBILE & DESKTOP) */}
      <div className="flex-1 p-3.5 sm:p-5 md:p-8 overflow-y-auto print:p-0 print:bg-white pb-16 md:pb-8">
        {/* Topbar Desktop */}
        <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <div>
            <h2 className="text-xl font-black text-slate-800">Dashboard Manajemen SmartKos</h2>
            <p className="text-xs text-slate-500">Monitoring Hunian, Akses Pintu Biometrik & Arus Kas</p>
          </div>
          <button onClick={() => fetchDashboardData(true)} className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-bold text-sm cursor-pointer">
            <RefreshCcw size={16} className={`mr-2 ${isLoading && 'animate-spin'}`}/> Segarkan
          </button>
        </div>

        {/* VIEW 1: DASHBOARD UTAMA */}
        {view === 'admin_dashboard' && (
          <div className="space-y-4 md:space-y-6">
            {/* 4 Kartu Metrik Ringkas: Grid 2x2 di HP, 4 kolom di Laptop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-[#1e293b] text-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-700 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-wider uppercase">
                    PEMASUKAN
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
                    <TrendingUp size={15} />
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black tracking-tight mb-0.5 sm:mb-1">
                    Rp {totalPemasukan.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                    {totalLunasCount} dari {totalTenantsWithRooms} lunas
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    PENGELUARAN
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setExpenseModal(true)} 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer" 
                      title="Catat Pengeluaran"
                    >
                      <Plus size={13} />
                    </button>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                      <TrendingDown size={15} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight mb-0.5 sm:mb-1">
                    Rp {totalPengeluaran.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Bulan ini</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    BELUM LUNAS
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock size={15} />
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight mb-0.5 sm:mb-1 flex items-baseline gap-1">
                    <span>{totalBelumLunas}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500">penyewa</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Butuh ditagih</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    HUNIAN
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Home size={15} />
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black text-slate-800 tracking-tight mb-1.5 sm:mb-2">
                    {kamarTerisiCount}/{totalKamarCount} <span className="text-[11px] sm:text-xs font-semibold text-slate-400">terisi</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{occupancyPercent}% hunian</span>
                </div>
              </div>
            </div>

            {/* STATUS KAMAR */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">Status Kamar</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                    {sortedRooms.length} kamar · {kamarKosongCount} kosong · {totalBelumLunas} belum lunas
                  </p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold whitespace-nowrap">
                    <button 
                      onClick={() => setFloorFilter('all')} 
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${floorFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Semua ({sortedRooms.length})
                    </button>
                    <button 
                      onClick={() => setFloorFilter('lt2')} 
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${floorFilter === 'lt2' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Lt 2 ({roomsLantai2.length})
                    </button>
                    <button 
                      onClick={() => setFloorFilter('lt3')} 
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${floorFilter === 'lt3' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Lt 3 ({roomsLantai3.length})
                    </button>
                  </div>

                  <button 
                    onClick={() => setRoomModal({ type: 'add', data: {} })} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center shadow-md shadow-blue-600/20 transition cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={14} className="mr-1" /> Tambah Kamar
                  </button>
                </div>
              </div>

              {/* GRID DENAH STATUS KAMAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {displayedRooms.map(room => {
                  const resident = safeUsers.find(u => 
                    (room.resident_id && String(u.id).trim() === String(room.resident_id).trim()) ||
                    (u.room_id && (String(u.room_id).trim() === String(room.id).trim() || String(u.room_id).trim() === String(room.number).trim()))
                  );

                  const targetUserId = resident?.id || room.resident_id;
                  const residentBills = safeBills.filter(b => targetUserId && String(b.user_id).trim() === String(targetUserId).trim());
                  const isOccupied = Boolean(resident || room.status === 'occupied' || room.resident_id);
                  const isPaid = isResidentPaid(resident, residentBills);
                  const floorLabel = getRoomFloor(room) === 3 ? 'Lantai 3' : 'Lantai 2';

                  const masukDateStr = formatDateSafe(resident?.created_at);
                  const latestBill = residentBills[0];
                  const dueRaw = latestBill?.due_date || resident?.active_until;
                  const dueDateStr = formatDueDate25(dueRaw);

                  const residentPhone = resident?.phone || (resident?.username ? `@${resident.username}` : '-');
                  const residentName = resident?.name || (room.resident_id ? `Penghuni #${room.resident_id}` : 'Penghuni Aktif');

                  return (
                    <div 
                      key={room.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-3.5 sm:p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                              <DoorOpen size={16} />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 leading-tight">
                                Kamar {room.number}
                              </h4>
                              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                                {floorLabel}
                              </span>
                            </div>
                          </div>

                          {isOccupied ? (
                            isPaid ? (
                              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Lunas
                              </span>
                            ) : (
                              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60 inline-flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Belum Lunas
                              </span>
                            )
                          ) : (
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 inline-flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span> Kosong
                            </span>
                          )}
                        </div>

                        {isOccupied ? (
                          <div className="space-y-1.5 my-2.5 text-xs">
                            <div className="flex items-center text-slate-700 font-semibold truncate">
                              <UserCheck size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{residentName}</span>
                            </div>
                            <div className="flex items-center text-slate-500 font-normal">
                              <Phone size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span>{residentPhone}</span>
                            </div>
                            <div className="flex items-center text-[10px] sm:text-[11px] text-slate-400 pt-0.5">
                              <Calendar size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span>Masuk: {masukDateStr}</span>
                              <span className="mx-1">·</span>
                              <span className={`font-semibold ${isPaid ? 'text-slate-600' : 'text-amber-600'}`}>
                                JT: {dueDateStr}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="my-2.5 py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs font-semibold text-slate-400">
                            Kosong
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] sm:text-xs font-medium block">Sewa / bulan</span>
                          <span className="font-black text-slate-800 text-xs sm:text-sm">
                            Rp {Number(room.price || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setRoomModal({ type: 'edit', data: room })}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center border border-blue-200 shadow-xs cursor-pointer"
                            title="Edit Data Kamar"
                          >
                            <Edit size={12} className="mr-1" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hapus Kamar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PEMBAYARAN (MOBILE CARD VIEW + DESKTOP TABLE VIEW) */}
        {(view === 'admin_payments' || view === 'admin_bills' || view === 'admin_history') && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center">
                  <CreditCard className="mr-2 text-blue-600" size={22} /> Manajemen Pembayaran
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Format ADIBKOS, deteksi QRIS otomatis, dan tombol WhatsApp Fonnte
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold w-full sm:w-auto justify-center">
                  <button 
                    onClick={() => setPaymentTab('pending')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center justify-center transition cursor-pointer ${paymentTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Clock size={13} className="mr-1.5 text-amber-500" />
                    Pending ({pendingBillsList.length})
                  </button>
                  <button 
                    onClick={() => setPaymentTab('history')}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center justify-center transition cursor-pointer ${paymentTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <CheckCircle size={13} className="mr-1.5 text-emerald-500" />
                    Lunas ({historyBillsList.length})
                  </button>
                </div>

                <button 
                  onClick={handleGenerateBills} 
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center shadow-md shadow-emerald-600/20 transition cursor-pointer whitespace-nowrap"
                >
                  <Plus size={14} className="mr-1.5" /> Buat Tagihan Baru
                </button>
              </div>
            </div>

            {/* TAB 1: TAGIHAN BERJALAN (PENDING) */}
            {paymentTab === 'pending' && (
              <div className="space-y-3">
                {/* A. TAMPILAN KARTU UNTUK HP (MOBILE ONLY: md:hidden) */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {pendingBillsList.map(b => {
                    const user = safeUsers.find(u => u.id === b.user_id);
                    const room = safeRooms.find(r => r.id === user?.room_id);
                    return (
                      <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{user?.name || `User #${b.user_id}`}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{room ? `Kamar ${room.number} (${room.name})` : 'Belum pilih kamar'}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Belum Lunas
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                          <div className="flex justify-between items-center font-mono">
                            <span className="text-[11px] text-slate-400">Invoice:</span>
                            <span className="font-bold text-blue-700">{b.ref_id}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-slate-400">Total Tagihan:</span>
                            <span className="font-black text-rose-600 text-sm">Rp {Number(b.nominal).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-500 text-[11px]">
                            <span>Jatuh Tempo:</span>
                            <span className="font-semibold text-slate-700">{formatDueDate25(b.due_date)}</span>
                          </div>
                        </div>

                        {/* Tombol Aksi Mobile Ramah Sentuhan */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button 
                            onClick={() => handleSetLunasManual(b.id, b.user_id)} 
                            className="py-2 px-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-[11px] font-bold text-center active:scale-95 transition"
                          >
                            Set Lunas
                          </button>
                          <button 
                            onClick={() => handleSendWaReminder(b.id)}
                            disabled={isLoading}
                            className="py-2 px-1 bg-green-600 text-white rounded-xl text-[11px] font-bold text-center shadow-xs active:scale-95 transition flex items-center justify-center"
                          >
                            <MessageSquare size={12} className="mr-1" /> Kirim WA
                          </button>
                          <button 
                            onClick={() => setBillModal(b)} 
                            className="py-2 px-1 bg-blue-50 text-blue-700 border border-blue-300 rounded-xl text-[11px] font-bold text-center active:scale-95 transition"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {pendingBillsList.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl border text-center text-slate-400">
                      <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                      <p className="font-bold text-slate-700 text-sm">Semua Tagihan Lunas!</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tidak ada tagihan tertunda.</p>
                    </div>
                  )}
                </div>

                {/* B. TAMPILAN TABEL RESMI DESKTOP (LAPTOP ONLY: hidden md:block) */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-4">Penghuni & Kamar</th>
                          <th className="p-4">Ref TokoPay (Invoice)</th>
                          <th className="p-4">Nominal</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Jatuh Tempo</th>
                          <th className="p-4 text-center">Aksi Pengelola</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingBillsList.map(b => {
                          const user = safeUsers.find(u => u.id === b.user_id);
                          const room = safeRooms.find(r => r.id === user?.room_id);
                          return (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4">
                                <span className="font-bold text-slate-800 text-sm block">{user?.name || `User #${b.user_id}`}</span>
                                <span className="text-[11px] text-slate-400 font-medium">{room ? `Kamar ${room.number} (${room.name})` : 'Belum pilih kamar'}</span>
                              </td>
                              <td className="p-4 font-mono font-bold text-slate-700 text-xs">
                                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                                  {b.ref_id}
                                </span>
                              </td>
                              <td className="p-4 font-black text-rose-600 font-mono text-sm">
                                Rp {Number(b.nominal).toLocaleString('id-ID')}
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 inline-flex items-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Belum Lunas
                                </span>
                              </td>
                              <td className="p-4 text-slate-600 font-semibold">
                                {formatDueDate25(b.due_date)}
                              </td>
                              <td className="p-4 text-center">
                                <div className="inline-flex items-center gap-2">
                                  <button 
                                    onClick={() => handleSetLunasManual(b.id, b.user_id)} 
                                    className="text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-bold transition shadow-xs flex items-center cursor-pointer"
                                  >
                                    <CheckCircle size={13} className="mr-1.5 text-emerald-600" /> Set Lunas (Tunai)
                                  </button>
                                  <button 
                                    onClick={() => handleSendWaReminder(b.id)}
                                    disabled={isLoading}
                                    className="text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-bold transition shadow-xs flex items-center cursor-pointer"
                                    title="Kirim pengingat WhatsApp"
                                  >
                                    <MessageSquare size={13} className="mr-1.5 text-emerald-600" /> Kirim WA
                                  </button>
                                  <button 
                                    onClick={() => setBillModal(b)} 
                                    className="text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-300 text-xs font-bold transition shadow-xs flex items-center cursor-pointer"
                                  >
                                    <Edit size={13} className="mr-1.5 text-blue-600" /> Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {pendingBillsList.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-400">
                              <CheckCircle size={40} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                              <p className="font-bold text-slate-700 text-sm">Semua Tagihan Sewa Lunas!</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RIWAYAT PEMBAYARAN LUNAS */}
            {paymentTab === 'history' && (
              <div className="space-y-3">
                {/* A. TAMPILAN KARTU RIWAYAT DI HP (md:hidden) */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {historyBillsList.map(b => {
                    const user = safeUsers.find(u => u.id === b.user_id);
                    const room = safeRooms.find(r => r.id === user?.room_id);
                    return (
                      <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{user?.name || `User #${b.user_id}`}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{room ? `Kamar ${room.number}` : '-'} · {formatDateSafe(b.created_at || b.due_date)}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center">
                            LUNAS
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                          <div>{renderPaymentBadge(b.payment_method, () => setChangeMethodModal(b))}</div>
                          <span className="font-black text-emerald-600 font-mono text-sm">Rp {Number(b.nominal).toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                          <span className="font-mono text-slate-400 truncate max-w-[180px]">{b.ref_id}</span>
                          <button 
                            onClick={() => handleDeleteHistory(b.id)}
                            className="text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-xs font-bold transition flex items-center"
                          >
                            <Trash2 size={12} className="mr-1" /> Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {historyBillsList.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl border text-center text-slate-400">
                      <History size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700 text-sm">Belum Ada Riwayat Transaksi</p>
                    </div>
                  )}
                </div>

                {/* B. TABEL RIWAYAT DI DESKTOP (hidden md:block) */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-4">Tanggal Pembayaran</th>
                          <th className="p-4">Penghuni & Kamar</th>
                          <th className="p-4">Ref TokoPay (Invoice)</th>
                          <th className="p-4">Metode Bayar</th>
                          <th className="p-4">Nominal Masuk</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {historyBillsList.map(b => {
                          const user = safeUsers.find(u => u.id === b.user_id);
                          const room = safeRooms.find(r => r.id === user?.room_id);
                          return (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4 text-slate-600">
                                {formatDateSafe(b.created_at || b.due_date)}
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-slate-800 text-sm block">{user?.name || `User #${b.user_id}`}</span>
                                <span className="text-[11px] text-slate-400 font-medium">{room ? `Kamar ${room.number}` : '-'}</span>
                              </td>
                              <td className="p-4 font-mono font-bold text-slate-700 text-xs">
                                <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                                  {b.ref_id}
                                </span>
                              </td>
                              <td className="p-4">
                                {renderPaymentBadge(b.payment_method, () => setChangeMethodModal(b))}
                              </td>
                              <td className="p-4 font-black text-emerald-600 font-mono text-sm">
                                Rp {Number(b.nominal).toLocaleString('id-ID')}
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center">
                                  <CheckCircle size={12} className="mr-1.5 text-emerald-600" /> LUNAS
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => handleDeleteHistory(b.id)} 
                                  className="text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-bold transition shadow-xs inline-flex items-center cursor-pointer"
                                >
                                  <Trash2 size={13} className="mr-1.5" /> Hapus
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: BUKU PENGELUARAN */}
        {view === 'admin_expenses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <div>
                <h3 className="font-black text-lg sm:text-xl text-slate-800">Catatan Pengeluaran Kos</h3>
                <p className="text-xs text-slate-500">Mencatat biaya listrik, air, internet, perbaikan, dan kebersihan</p>
              </div>
              <button 
                onClick={() => setExpenseModal(true)} 
                className="w-full sm:w-auto bg-rose-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-md hover:bg-rose-700 transition text-xs sm:text-sm cursor-pointer"
              >
                <Plus size={16} className="mr-1.5" /> Catat Pengeluaran Baru
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3.5 sm:p-4">Tanggal</th>
                    <th className="p-3.5 sm:p-4">Keperluan / Keterangan</th>
                    <th className="p-3.5 sm:p-4">Kategori</th>
                    <th className="p-3.5 sm:p-4">Nominal</th>
                    <th className="p-3.5 sm:p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {safeExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3.5 sm:p-4 text-slate-500">{formatDateSafe(exp.expense_date || exp.created_at)}</td>
                      <td className="p-3.5 sm:p-4 font-bold text-slate-800">{exp.title}</td>
                      <td className="p-3.5 sm:p-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{exp.category}</span></td>
                      <td className="p-3.5 sm:p-4 font-black text-rose-600">Rp {Number(exp.nominal).toLocaleString('id-ID')}</td>
                      <td className="p-3.5 sm:p-4">
                        <button onClick={() => handleDeleteExpense(exp.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {safeExpenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">Belum ada catatan pengeluaran.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: KELOLA USER (PANEL ADMIN MOBILE-FRIENDLY & DESKTOP) */}
        {view === 'admin_users' && (() => {
          const nonAdminUsers = safeUsers.filter(u => !u.role || u.role === 'resident' || u.role !== 'admin');

          const sortedAdminUsers = [...nonAdminUsers].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            if (timeA && timeB && timeA !== timeB) return timeB - timeA;
            return (Number(b.id) || 0) - (Number(a.id) || 0);
          });

          const searchedUsers = sortedAdminUsers.filter(u => {
            const q = userSearchQuery.toLowerCase().trim();
            if (q) {
              const nameMatch = (u.name || '').toLowerCase().includes(q);
              const userMatch = (u.username || '').toLowerCase().includes(q);
              const phoneMatch = (u.phone || '').toLowerCase().includes(q);
              const emailMatch = (u.email || '').toLowerCase().includes(q);
              if (!nameMatch && !userMatch && !phoneMatch && !emailMatch) return false;
            }
            if (userFilterTab === 'no_room') return !u.room_id;
            if (userFilterTab === 'has_room') return Boolean(u.room_id);
            if (userFilterTab === 'active') return Boolean(u.is_fingerprint_active);
            return true;
          });

          const totalUserCount = nonAdminUsers.length;
          const noRoomCount = nonAdminUsers.filter(u => !u.room_id).length;
          const hasRoomCount = nonAdminUsers.filter(u => Boolean(u.room_id)).length;
          const activeAccessCount = nonAdminUsers.filter(u => Boolean(u.is_fingerprint_active)).length;

          return (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center">
                    <Users className="mr-2 text-blue-600" size={22} /> Kelola Akun Penghuni
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Penetapan kamar, kontrol sidik jari, dan edit akun anak kos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminUserModal({ type: 'add', data: {} })}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <UserPlus size={14} className="mr-1.5" /> Tambah Pengguna Baru
                </button>
              </div>

              {/* 4 Mini Kartu Ringkasan (2x2 di HP) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total User</span>
                    <span className="text-base font-black text-slate-800">{totalUserCount}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Belum Kamar</span>
                    <span className="text-base font-black text-amber-600">{noRoomCount} akun</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <DoorOpen size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Punya Kamar</span>
                    <span className="text-base font-black text-slate-800">{hasRoomCount}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Akses Aktif</span>
                    <span className="text-base font-black text-slate-800">{activeAccessCount}</span>
                  </div>
                </div>
              </div>

              {/* Bilah Pencarian & Sub-Filter */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Cari nama, username, atau nomor WA..."
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto whitespace-nowrap">
                  <button
                    onClick={() => setUserFilterTab('all')}
                    className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${userFilterTab === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Semua ({nonAdminUsers.length})
                  </button>
                  <button
                    onClick={() => setUserFilterTab('no_room')}
                    className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${userFilterTab === 'no_room' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Belum Kamar ({noRoomCount})
                  </button>
                  <button
                    onClick={() => setUserFilterTab('has_room')}
                    className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${userFilterTab === 'has_room' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Punya Kamar ({hasRoomCount})
                  </button>
                </div>
              </div>

              {/* A. TAMPILAN KARTU AKUN PENGGUNA DI HP (md:hidden) */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {searchedUsers.map((u) => {
                  const room = safeRooms.find(r => r.id === u.room_id || String(r.number).trim() === String(u.room_id).trim());
                  const isNewUser = !u.room_id;
                  const cleanPhone = (u.phone || '').replace(/\D/g, '');
                  const waLink = cleanPhone ? (cleanPhone.startsWith('0') ? `https://wa.me/62${cleanPhone.slice(1)}` : `https://wa.me/${cleanPhone}`) : null;

                  return (
                    <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200/60 shadow-xs flex-shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-sm leading-tight">{u.name}</span>
                              {isNewUser && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                  Baru
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                          </div>
                        </div>

                        {u.is_fingerprint_active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Terkunci
                          </span>
                        )}
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-[11px]">Kamar:</span>
                          {room ? (
                            <span className="font-bold text-blue-700">Kamar {room.number}</span>
                          ) : (
                            <span className="text-amber-600 font-semibold text-[11px]">Belum Pilih Kamar</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-[11px]">WhatsApp:</span>
                          {u.phone ? (
                            <a href={waLink || '#'} target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">
                              {u.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Terdaftar:</span>
                          <span>{formatDateSafe(u.created_at)}</span>
                        </div>
                      </div>

                      {/* Tombol Aksi Mobile */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleUserAccess(u)}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center ${
                            u.is_fingerprint_active
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {u.is_fingerprint_active ? 'Kunci Pintu' : 'Buka Pintu'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminUserModal({ type: 'edit', data: u })}
                          className="py-2 px-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 text-center"
                        >
                          Edit Profil
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteUserModal(u)}
                          className="py-2 px-1 rounded-xl text-[11px] font-bold bg-slate-100 text-rose-600 border border-slate-200 text-center"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}

                {searchedUsers.length === 0 && (
                  <div className="bg-white p-8 rounded-2xl border text-center text-slate-400">
                    <Users size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">Pengguna Tidak Ditemukan</p>
                  </div>
                )}
              </div>

              {/* B. TAMPILAN TABEL PENGGUNA DI DESKTOP (hidden md:block) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 text-center w-12">No</th>
                        <th className="p-3.5">Akun Penghuni</th>
                        <th className="p-3.5">Kontak & WhatsApp</th>
                        <th className="p-3.5">Kamar Ditempati</th>
                        <th className="p-3.5">Status Akses & Sidik Jari</th>
                        <th className="p-3.5">Tanggal Daftar</th>
                        <th className="p-3.5 text-center w-36">Aksi Pengelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {searchedUsers.map((u, idx) => {
                        const room = safeRooms.find(r => r.id === u.room_id || String(r.number).trim() === String(u.room_id).trim());
                        const isNewUser = !u.room_id;
                        const cleanPhone = (u.phone || '').replace(/\D/g, '');
                        const waLink = cleanPhone ? (cleanPhone.startsWith('0') ? `https://wa.me/62${cleanPhone.slice(1)}` : `https://wa.me/${cleanPhone}`) : null;

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>

                            <td className="p-3.5">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm border border-blue-200/60 shadow-xs flex-shrink-0">
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                                    {isNewUser && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                        Baru
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono block">@{u.username}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                {u.phone ? (
                                  <a
                                    href={waLink || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                                  >
                                    <Phone size={12} className="text-emerald-500" />
                                    <span>{u.phone}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Belum ada WA</span>
                                )}
                                {u.email && <span className="text-[11px] text-slate-400 block truncate max-w-xs">{u.email}</span>}
                              </div>
                            </td>

                            <td className="p-3.5">
                              {room ? (
                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                                  <DoorOpen size={13} className="mr-1.5 text-blue-600" />
                                  Kamar {room.number}
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock size={12} className="mr-1 text-amber-500" />
                                  Belum Pilih Kamar
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <div className="space-y-1">
                                {u.is_fingerprint_active ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center">
                                    <CheckCircle size={11} className="mr-1 text-emerald-600" /> Akses Aktif (Lunas)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center">
                                    <XCircle size={11} className="mr-1 text-rose-600" /> Terkunci
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 block">
                                  Sensor: {u.fingerprint_id ? `ID #${u.fingerprint_id}` : 'Belum Rekam Jari'}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5 text-slate-500 text-[11px]">
                              {formatDateSafe(u.created_at)}
                            </td>

                            <td className="p-3.5 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserAccess(u)}
                                  disabled={isLoading}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    u.is_fingerprint_active
                                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                  title={u.is_fingerprint_active ? 'Kunci Akses Pintu' : 'Buka Akses Pintu'}
                                >
                                  {u.is_fingerprint_active ? <Lock size={14} /> : <Unlock size={14} />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAdminUserModal({ type: 'edit', data: u })}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                                  title="Edit Akun"
                                >
                                  <Edit size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteUserModal(u)}
                                  className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                                  title="Hapus Akun"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW: LAPORAN KEUANGAN */}
        {view === 'admin_reports' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:hidden">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">Laporan Keuangan</h2>
                <p className="text-xs text-slate-500 font-medium">Ringkasan pemasukan & pengeluaran kos</p>
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 print:hidden">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase mr-1.5">DARI</span>
                  <input 
                    type="date" 
                    value={reportStartDate} 
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                  />
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase mr-1.5">SAMPAI</span>
                  <input 
                    type="date" 
                    value={reportEndDate} 
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                  />
                </div>
                <button 
                  onClick={handleApplyReportFilter}
                  className="bg-[#2c3e50] hover:bg-[#1a252f] text-white px-3.5 py-2 rounded-xl font-bold flex items-center transition shadow-sm cursor-pointer text-xs"
                >
                  <Search size={13} className="mr-1" /> Terapkan
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="mr-1.5" /> Export Excel
                </button>
                <button 
                  onClick={handlePrintReport}
                  className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center shadow-xs transition cursor-pointer"
                >
                  <Printer size={14} className="mr-1.5 text-slate-500" /> Cetak
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 print:hidden">
              <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                    <TrendingUp size={13} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">PEMASUKAN</span>
                </div>
                <div>
                  <div className="text-base sm:text-2xl font-black text-slate-800 tracking-tight mb-0.5">
                    Rp {reportPemasukan.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-slate-400">{filteredReportBills.length} lunas</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                    <TrendingDown size={13} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">PENGELUARAN</span>
                </div>
                <div>
                  <div className="text-base sm:text-2xl font-black text-slate-800 tracking-tight mb-0.5">
                    Rp {reportPengeluaran.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-slate-400">{filteredReportExpenses.length} item</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <Wallet size={13} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">UANG MUKA</span>
                </div>
                <div>
                  <div className="text-base sm:text-2xl font-black text-slate-800 tracking-tight mb-0.5">Rp 0</div>
                  <span className="text-[10px] text-slate-400">0 penyewa</span>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${reportKeuntunganBersih >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Receipt size={13} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">LABA BERSIH</span>
                </div>
                <div>
                  <div className={`text-base sm:text-2xl font-black tracking-tight mb-0.5 ${reportKeuntunganBersih < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {reportKeuntunganBersih < 0 ? `-Rp ${Math.abs(reportKeuntunganBersih).toLocaleString('id-ID')}` : `Rp ${reportKeuntunganBersih.toLocaleString('id-ID')}`}
                  </div>
                  <span className="text-[10px] text-slate-400">Saldo kumulatif</span>
                </div>
              </div>
            </div>

            {/* TABEL BUKU KAS GABUNGAN DI LAYAR */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden">
              <h4 className="font-black text-slate-800 text-sm sm:text-base mb-3 flex items-center">
                <FileSpreadsheet className="mr-2 text-emerald-600" size={18} /> Buku Kas Mutasi Keuangan
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-center w-10">No</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3 text-center">Tipe</th>
                      <th className="p-3">Kamar / Kategori</th>
                      <th className="p-3">Keterangan / Penghuni</th>
                      <th className="p-3 text-center">Metode Bayar</th>
                      <th className="p-3 text-right">Pemasukan</th>
                      <th className="p-3 text-right">Pengeluaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {combinedReportTransactions.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 text-slate-600">{formatDateSafe(t.date)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.type === 'Pemasukan' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{t.category}</td>
                        <td className="p-3 text-slate-600">{t.description}</td>
                        <td className="p-3 text-center">{renderPaymentBadge(t.paymentMethod)}</td>
                        <td className="p-3 text-right font-black text-sky-600 font-mono">
                          {t.income > 0 ? `Rp ${t.income.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="p-3 text-right font-black text-rose-600 font-mono">
                          {t.expense > 0 ? `Rp ${t.expense.toLocaleString('id-ID')}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: LOG PINTU */}
        {view === 'admin_logs' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h3 className="font-bold text-base sm:text-lg flex items-center">
                <FileText className="mr-2 text-blue-600"/> Log Akses Pintu (Fingerprint)
              </h3>
              <button onClick={handleClearLogs} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center shadow-xs cursor-pointer">
                <Trash2 size={13} className="mr-1"/> Kosongkan Log
              </button>
            </div>
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 border-b">
                <tr><th className="p-3">Waktu</th><th className="p-3">User</th><th className="p-3">Pesan Sistem</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3 whitespace-nowrap text-slate-500">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold text-slate-800">{safeUsers.find(u => u.id === l.user_id)?.name || 'Unknown'}</td>
                    <td className="p-3 text-slate-600">{l.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW: PENGATURAN */}
        {view === 'admin_settings' && (
          <div className="space-y-4 max-w-4xl">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center">
                    <Settings className="mr-2 text-blue-600" size={22}/> Pengaturan Sistem
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">TokoPay (QRIS), Perangkat IoT, dan Fonnte WhatsApp</p>
                </div>

                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto w-full sm:w-auto">
                  <button 
                    onClick={() => setSettingsTab('tokopay')} 
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center justify-center transition cursor-pointer whitespace-nowrap ${settingsTab === 'tokopay' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    TokoPay
                  </button>
                  <button 
                    onClick={() => setSettingsTab('devices')} 
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center justify-center transition cursor-pointer whitespace-nowrap ${settingsTab === 'devices' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Perangkat
                  </button>
                  <button 
                    onClick={() => setSettingsTab('fonnte')} 
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg flex items-center justify-center transition cursor-pointer whitespace-nowrap ${settingsTab === 'fonnte' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    WhatsApp (Fonnte)
                  </button>
                </div>
              </div>
            </div>

            {settingsTab === 'tokopay' && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Merchant ID TokoPay</label>
                    <input type="text" name="merchant_id" defaultValue={settings.tokopay_merchant_id} placeholder="M240101XXXXX" className="w-full p-2.5 sm:p-3 border rounded-xl bg-slate-50 text-xs sm:text-sm font-mono outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Secret Key TokoPay</label>
                    <input type="password" name="secret_key" defaultValue={settings.tokopay_secret_key} placeholder="Secret Key" className="w-full p-2.5 sm:p-3 border rounded-xl bg-slate-50 text-xs sm:text-sm font-mono outline-none" required />
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer">
                      Simpan Konfigurasi
                    </button>
                    <button type="button" onClick={handleTestTokoPay} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer">
                      Uji Koneksi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {settingsTab === 'fonnte' && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <form onSubmit={handleSaveSettings} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Fonnte API Token</label>
                    <input type="text" name="fonnte_token" defaultValue={(settings as any).fonnte_token || ''} placeholder="Token Fonnte" className="w-full p-2.5 sm:p-3 border rounded-xl bg-slate-50 text-xs sm:text-sm font-mono outline-none" required />
                  </div>
                  <button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer">
                    Simpan Token Fonnte
                  </button>
                </form>

                <div className="pt-3 border-t border-slate-100">
                  <h5 className="font-bold text-xs text-slate-700 mb-2">Uji Kirim Pesan WhatsApp</h5>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md">
                    <input type="tel" value={testWaPhone} onChange={(e) => setTestWaPhone(e.target.value)} placeholder="08123xxxxxx" className="p-2.5 text-xs border rounded-xl bg-slate-50 flex-1 outline-none" />
                    <button type="button" onClick={handleTestFonnte} disabled={isLoading} className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer">
                      <Send size={13} className="mr-1.5" /> Kirim Tes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'devices' && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                      <tr>
                        <th className="p-3">Kamar</th>
                        <th className="p-3">Device ID (ESP8266)</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedRooms.map(r => (
                        <tr key={r.id}>
                          <td className="p-3 font-bold text-slate-800">Kamar {r.number}</td>
                          <td className="p-3">
                            <form onSubmit={(e: any) => { e.preventDefault(); handleSaveDevice(r.id, e.target.device_id.value); }} className="flex items-center gap-1.5">
                              <input type="text" name="device_id" defaultValue={r.device_id || `KAMAR-${r.number}`} className="p-1.5 text-xs border rounded-lg bg-slate-50 font-mono w-28 sm:w-36" />
                              <button type="submit" className="bg-slate-800 text-white px-2 py-1.5 rounded-lg text-[11px] font-bold">Simpan</button>
                            </form>
                          </td>
                          <td className="p-3 text-center">
                            <button onClick={() => handleToggleRoomFingerprint(r.id, r.fingerprint_status)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.fingerprint_status ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {r.fingerprint_status ? 'ONLINE' : 'OFFLINE'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL PENGELUARAN */}
        {expenseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveExpense} className="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-sm shadow-2xl border">
              <h3 className="font-black text-slate-800 text-base mb-3">Catat Pengeluaran</h3>
              <div className="space-y-3 mb-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keperluan</label>
                  <input type="text" name="title" placeholder="Token Listrik Lt 2" className="w-full p-2.5 border rounded-xl bg-slate-50" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                  <input type="number" name="nominal" placeholder="250000" className="w-full p-2.5 border rounded-xl bg-slate-50 font-mono font-bold text-rose-600" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select name="category" className="w-full p-2.5 border rounded-xl bg-slate-50">
                    <option value="Listrik & Air">Listrik & Air</option>
                    <option value="Internet / WiFi">Internet / WiFi</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Perbaikan">Perbaikan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input type="date" name="expense_date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border rounded-xl bg-slate-50" required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setExpenseModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL KAMAR */}
        {roomModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveRoom} className="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-sm shadow-2xl border">
              <h3 className="font-bold text-base mb-3">{roomModal.type === 'add' ? 'Tambah Kamar' : 'Edit Kamar'}</h3>
              <div className="space-y-3 mb-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Kamar</label>
                  <input type="text" name="number" defaultValue={roomModal.data.number} placeholder="201" className="w-full p-2.5 border rounded-xl bg-slate-50" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Kamar</label>
                  <input type="text" name="name" defaultValue={roomModal.data.name} placeholder="Standard AC" className="w-full p-2.5 border rounded-xl bg-slate-50" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Sewa (Rp)</label>
                  <input type="number" name="price" defaultValue={roomModal.data.price} placeholder="750000" className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-blue-600" required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRoomModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL TAGIHAN */}
        {billModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleEditBill} className="bg-white p-5 rounded-2xl w-full max-w-sm">
              <h3 className="font-bold text-base mb-2">Edit Nominal Tagihan</h3>
              <input type="number" name="nominal" defaultValue={billModal.nominal} className="w-full p-3 border rounded-xl mb-4 text-lg font-bold text-red-600 font-mono" required />
              <div className="flex gap-2">
                <button type="button" onClick={() => setBillModal(null)} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-xs">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL EDIT AKUN ADMIN */}
        {adminUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveAdminUser} className="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl border">
              <h3 className="font-black text-slate-800 text-base mb-3">
                {adminUserModal.type === 'add' ? 'Tambah Akun Penghuni' : 'Edit Akun Pengguna'}
              </h3>
              <div className="space-y-2.5 mb-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="name" defaultValue={adminUserModal.data?.name || ''} className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Username</label>
                    <input type="text" name="username" defaultValue={adminUserModal.data?.username || ''} className="w-full p-2.5 border rounded-xl bg-slate-50 font-mono" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                    <input type="tel" name="phone" defaultValue={adminUserModal.data?.phone || ''} className="w-full p-2.5 border rounded-xl bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tetapkan Kamar</label>
                  <select name="room_id" defaultValue={adminUserModal.data?.room_id || ''} className="w-full p-2.5 border rounded-xl bg-slate-50 font-semibold">
                    <option value="">-- Belum Pilih Kamar --</option>
                    {safeRooms.map(r => (
                      <option key={r.id} value={r.id}>Kamar {r.number} — {r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password {adminUserModal.type === 'edit' && '(Opsional)'}</label>
                  <input type="password" name="password" placeholder={adminUserModal.type === 'add' ? 'user123' : 'Kosongkan jika tidak diubah'} className="w-full p-2.5 border rounded-xl bg-slate-50" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAdminUserModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL HAPUS AKUN */}
        {deleteUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white p-5 rounded-2xl w-full max-w-sm shadow-2xl border text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                <Trash2 size={24} />
              </div>
              <h3 className="font-black text-slate-800 text-base mb-1">Hapus Pengguna?</h3>
              <p className="text-xs text-slate-600 mb-4">
                Hapus akun <strong>{deleteUserModal.name}</strong>? Kamar akan otomatis kosong dan akses sidik jari dicabut.
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDeleteUserModal(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">Batal</button>
                <button type="button" onClick={handleConfirmDeleteUser} disabled={isLoading} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md">Ya, Hapus</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResident = () => {
    const availableRooms = sortedRooms.filter(r => r.status === 'available');
    const availRoomsLt2 = availableRooms.filter(r => getRoomFloor(r) === 2);
    const availRoomsLt3 = availableRooms.filter(r => getRoomFloor(r) === 3);
    const displayedAvailRooms = residentFloorFilter === 'lt2' 
      ? availRoomsLt2 
      : residentFloorFilter === 'lt3' 
        ? availRoomsLt3 
        : availableRooms;

    const myBills = safeBills.filter(b => b.user_id === currentUser?.id);
    const pendingBill = myBills.find(b => b.status === 'pending');
    const historyBills = myBills.filter(b => b.status === 'lunas'); 
    const isActive = Boolean(currentUser?.is_fingerprint_active);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-12 sm:pb-6">
        {/* Top Navbar Konsisten untuk Semua Penghuni */}
        <nav className="bg-white shadow-sm border-b px-3.5 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="font-black text-lg sm:text-xl flex items-center">
            <Fingerprint className="mr-2 text-blue-600" size={24} /> SmartKos
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Halo, <strong className="text-slate-800">{currentUser?.name}</strong>
            </span>
            <button 
              onClick={logout} 
              className="text-red-600 font-bold flex items-center hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition cursor-pointer text-xs"
            >
              <LogOut size={15} className="mr-1"/> Keluar
            </button>
          </div>
        </nav>

        {/* Tab Navigasi - Rata dan Fleksibel di Layar HP */}
        <div className="bg-white border-b px-2 sm:px-6 flex space-x-1 sm:space-x-6 justify-around sm:justify-center text-xs sm:text-sm font-bold shadow-xs overflow-x-auto">
           <button onClick={() => setView('resident_dashboard')} className={`py-3.5 px-2.5 sm:px-4 border-b-2 sm:border-b-4 transition cursor-pointer whitespace-nowrap ${view === 'resident_dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Beranda</button>
           <button onClick={() => setView('resident_fingerprint')} className={`py-3.5 px-2.5 sm:px-4 border-b-2 sm:border-b-4 transition cursor-pointer whitespace-nowrap ${view === 'resident_fingerprint' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Sidik Jari</button>
           <button onClick={() => setView('resident_history')} className={`py-3.5 px-2.5 sm:px-4 border-b-2 sm:border-b-4 transition cursor-pointer whitespace-nowrap ${view === 'resident_history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Riwayat</button>
           <button onClick={() => setView('resident_profile')} className={`py-3.5 px-2.5 sm:px-4 border-b-2 sm:border-b-4 transition cursor-pointer whitespace-nowrap ${view === 'resident_profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Profil Saya</button>
        </div>

        <div className="max-w-4xl mx-auto p-3.5 sm:p-6 w-full flex-1 space-y-4 sm:space-y-6">
          {view === 'resident_dashboard' && (
             !currentUser?.room_id ? (
               <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                   <div>
                     <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center">
                       <DoorOpen className="mr-2 text-blue-600" size={22} /> Pilih Kamar Kos Anda
                     </h3>
                     <p className="text-xs text-slate-500 mt-0.5">
                       Selamat datang, <strong>{currentUser?.name}</strong>! Tentukan kamar idaman Anda.
                     </p>
                   </div>
                   <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                     {availableRooms.length} Kamar Kosong
                   </span>
                 </div>

                 {/* PILIHAN CEPAT VIA DROPDOWN (SANGAT MUDAH DI HP) */}
                 <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
                   <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                     Pilihan Cepat (Dropdown)
                   </label>
                   <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                     <select 
                       value={selectedRoomId || ''} 
                       onChange={(e) => setSelectedRoomId(Number(e.target.value) || null)}
                       className="flex-1 p-2.5 sm:p-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 cursor-pointer"
                     >
                       <option value="">-- Pilih Kamar Dari Daftar --</option>
                       {availableRooms.map(r => (
                         <option key={r.id} value={r.id}>
                           Kamar {r.number} — {r.name} (Rp {Number(r.price).toLocaleString('id-ID')}/bln)
                         </option>
                       ))}
                     </select>
                     <button
                       type="button"
                       onClick={() => {
                         if (!selectedRoomId) {
                           showToast('Pilih salah satu kamar terlebih dahulu', 'error');
                           return;
                         }
                         handleChooseRoom(selectedRoomId);
                       }}
                       disabled={isLoading || !selectedRoomId}
                       className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-40 cursor-pointer text-center"
                     >
                       Pilih Kamar Ini
                     </button>
                   </div>
                 </div>

                 {/* DENAH GRID MINI KAMAR (KOMPAK DI LAYAR HP) */}
                 <div className="space-y-2.5">
                   <div className="flex justify-between items-center gap-2">
                     <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                       Atau Ketuk Denah Kamar:
                     </span>
                     <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                       <button 
                         onClick={() => setResidentFloorFilter('all')}
                         className={`px-2.5 py-1 rounded-lg text-xs transition ${residentFloorFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                       >
                         Semua
                       </button>
                       <button 
                         onClick={() => setResidentFloorFilter('lt2')}
                         className={`px-2.5 py-1 rounded-lg text-xs transition ${residentFloorFilter === 'lt2' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                       >
                         Lt 2
                       </button>
                       <button 
                         onClick={() => setResidentFloorFilter('lt3')}
                         className={`px-2.5 py-1 rounded-lg text-xs transition ${residentFloorFilter === 'lt3' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                       >
                         Lt 3
                       </button>
                     </div>
                   </div>

                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                     {displayedAvailRooms.map(room => {
                       const isSelected = selectedRoomId === room.id;
                       const floor = getRoomFloor(room) === 3 ? 'Lt 3' : 'Lt 2';
                       return (
                         <div
                           key={room.id}
                           onClick={() => setSelectedRoomId(room.id)}
                           className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col justify-between ${
                             isSelected 
                               ? 'border-blue-600 bg-blue-50 shadow-sm ring-2 ring-blue-500/20' 
                               : 'border-slate-200 bg-white hover:border-blue-300'
                           }`}
                         >
                           <div>
                             <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold mb-0.5">
                               <span>{floor}</span>
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                             </div>
                             <div className="text-base font-black text-slate-800 leading-tight">
                               {room.number}
                             </div>
                           </div>
                           <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                             <div className="text-[10px] font-bold text-blue-600 mb-1">
                               Rp {(Number(room.price) / 1000)}rb
                             </div>
                             <button
                               type="button"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleChooseRoom(room.id);
                               }}
                               disabled={isLoading}
                               className={`w-full py-1 rounded-lg text-[10px] font-bold transition ${
                                 isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                               }`}
                             >
                               Pilih
                             </button>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center border-b pb-3">
                    <CreditCard className="mr-2 text-blue-600" size={20}/> Tagihan Sewa Kamar
                  </h3>
                  {pendingBill ? (
                    <div className="text-center pt-2 flex-1 flex flex-col justify-center">
                      <div>
                        <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full text-xs mb-2 inline-block">Belum Lunas</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 my-3">Rp {Number(pendingBill.nominal).toLocaleString('id-ID')}</h2>
                        <p className="text-xs font-mono font-bold text-slate-500 mb-1">Invoice: {pendingBill.ref_id}</p>
                        <p className="text-xs text-slate-500 mb-5">Jatuh Tempo: {formatDueDate25(pendingBill.due_date)}</p>
                        <button onClick={() => handlePayQRIS(pendingBill)} className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition shadow-lg cursor-pointer text-sm">
                          Bayar dengan QRIS
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 flex-1 flex flex-col justify-center">
                      <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                      <span className="text-green-700 font-black text-lg block">Semua Tagihan Lunas</span>
                      <p className="text-slate-500 mt-1 text-xs">Terima kasih telah membayar tepat waktu.</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center border-b pb-3">
                    <DoorOpen className="mr-2 text-blue-600" size={20}/> Status Kamar Anda
                  </h3>
                  <div className="pt-2 text-center flex-1 flex flex-col justify-center">
                    {isActive ? (
                      <div className="p-5 bg-green-50 text-green-800 rounded-xl border border-green-200">
                        <CheckCircle size={40} className="mx-auto mb-2 text-green-500"/>
                        <div className="font-black text-base">KAMAR AKTIF</div>
                        <p className="text-xs mt-1">Masa aktif kamar s/d:<br/><strong>{formatDateSafe(currentUser?.active_until)}</strong></p>
                      </div>
                    ) : (
                      <div className="p-5 bg-red-50 text-red-800 rounded-xl border border-red-200">
                        <XCircle size={40} className="mx-auto mb-2 text-red-500"/>
                        <div className="font-black text-base">AKSES TERKUNCI</div>
                        <p className="text-xs mt-1">Selesaikan pembayaran QRIS terlebih dahulu agar sensor sidik jari aktif.</p>
                      </div>
                    )}
                  </div>
                </div>
               </div>
             )
          )}

          {view === 'resident_fingerprint' && (
             <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-xl mx-auto">
                <h3 className="text-lg sm:text-xl font-black mb-4 flex items-center justify-center border-b pb-3">
                  <Fingerprint className="mr-2 text-blue-600" size={24}/> Akses Sidik Jari Pintu
                </h3>
                {!isActive ? (
                    <div className="p-5 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
                      <XCircle className="mx-auto mb-2 text-red-500" size={36}/>
                      <p className="font-bold text-sm">Akses Pintu Terkunci</p>
                      <p className="mt-1 text-slate-600">Tagihan sewa belum lunas. Selesaikan di Beranda.</p>
                    </div>
                ) : currentUser?.fingerprint_id ? (
                    <div className="p-4">
                       <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                       <h4 className="font-bold text-xl text-slate-800">Sidik Jari Aktif!</h4>
                       <p className="text-xs mt-3 text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-200">
                         Pintu kamar sudah bisa dibuka dengan menempelkan jari ke sensor.
                       </p>
                       <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                          <button onClick={handleStartEnrollment} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md">
                            Rekam Ulang Jari
                          </button>
                          <button onClick={handleResetResidentFp} className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs">
                            Hapus Jari
                          </button>
                       </div>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col items-center">
                       <Fingerprint size={64} className="mb-3 text-blue-500" />
                       <button onClick={handleStartEnrollment} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs shadow-md">
                         Mulai Rekam Jari di Pintu
                       </button>
                    </div>
                )}
             </div>
          )}

          {view === 'resident_history' && (
             <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-base font-bold mb-3 flex items-center border-b pb-3">
                 <FileText className="mr-2 text-blue-600" size={18}/> Riwayat Pembayaran Anda
               </h3>
               {historyBills.length > 0 ? (
                 <div className="space-y-2.5">
                   {historyBills.map(b => (
                     <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                       <div>
                         <span className="font-bold text-slate-800 block">{b.month}</span>
                         <span className="text-[10px] text-slate-400 font-mono">{b.ref_id}</span>
                       </div>
                       <div className="text-right">
                         <span className="font-black text-emerald-600 block">Rp {Number(b.nominal).toLocaleString('id-ID')}</span>
                         <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">LUNAS</span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                   Belum ada riwayat pembayaran yang tercatat.
                 </div>
               )}
             </div>
          )}

          {/* VIEW: PROFIL PENGHUNI */}
          {view === 'resident_profile' && (
             <div className="space-y-4 max-w-xl mx-auto">
               <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                 <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl flex-shrink-0">
                   {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                 </div>
                 <div>
                   <h3 className="font-black text-base sm:text-lg text-slate-800">{currentUser?.name}</h3>
                   <p className="text-xs text-slate-400 font-mono">@{currentUser?.username}</p>
                 </div>
               </div>

               <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
                 <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
                   <div>
                     <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                     <input type="text" name="name" defaultValue={currentUser?.name || ''} className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium" required />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                     <div>
                       <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                       <input type="tel" name="phone" defaultValue={currentUser?.phone || ''} className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium" required />
                     </div>
                     <div>
                       <label className="block font-bold text-slate-700 mb-1">Email</label>
                       <input type="email" name="email" defaultValue={currentUser?.email || ''} className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium" required />
                     </div>
                   </div>
                   <div>
                     <label className="block font-bold text-slate-700 mb-1">Alamat (KTP)</label>
                     <textarea name="address" defaultValue={currentUser?.address || ''} rows={2} className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium resize-none" required></textarea>
                   </div>
                   <div>
                     <label className="block font-bold text-slate-700 mb-1">Ganti Password (Opsional)</label>
                     <input type="password" name="password" placeholder="Kosongkan jika tidak diganti" className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium" />
                   </div>
                   <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs shadow-md mt-2">
                     Simpan Perubahan
                   </button>
                 </form>
               </div>
             </div>
          )}
        </div>

        {/* MODAL SCAN QRIS (PAS DI LAYAR HP) */}
        {paymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white p-5 rounded-3xl shadow-2xl w-full max-w-xs text-center border">
              <h3 className="text-base font-black mb-1">Scan QRIS (TokoPay)</h3>
              <p className="text-[11px] text-blue-600 font-mono font-bold mb-3 bg-blue-50 py-1 rounded-lg">{paymentModal.ref_id}</p>
              
              <div className="bg-slate-100 p-2 rounded-2xl mb-3 min-h-[220px] flex justify-center items-center border-2 border-dashed border-slate-300">
                 {qrisData ? (
                   <img src={qrisData} alt="QRIS" className="w-full rounded-xl shadow-xs" />
                 ) : (
                   <div className="text-slate-500 font-bold flex flex-col items-center text-xs">
                     <Activity className="animate-spin mb-2 text-blue-500" size={24}/> Memproses QR...
                   </div>
                 )}
              </div>

              <p className="text-[10px] text-slate-400 mb-3">Dapat dibayar via DANA, GoPay, ShopeePay, BCA, Livin, dll.</p>

              <button
                type="button"
                onClick={() => setPaymentModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const isAuthView = !currentUser || view === 'login' || view === 'register';

  return (
    <div className="font-sans text-slate-800 bg-slate-100 min-h-screen">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          table {
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #1e293b !important;
          }
        }
      `}</style>

      {isAuthView ? renderAuth() : currentUser.role === 'admin' ? renderAdmin() : renderResident()}
      {toast && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 print:hidden">
           <div className={`px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-xl font-bold text-xs sm:text-sm flex items-center justify-center sm:justify-start ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-850 text-white'}`}>
             {toast.type === 'error' ? <XCircle className="mr-2" size={16} /> : <CheckCircle className="mr-2 text-green-400" size={16} />} {toast.msg}
           </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}