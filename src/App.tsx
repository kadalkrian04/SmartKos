import React, { useState, useEffect } from 'react';
import { 
  Users, DoorOpen, CreditCard, Settings, LogOut, 
  CheckCircle, XCircle, Fingerprint, Activity, FileText, Plus, Edit, Trash2, RefreshCcw, 
  Save, ShieldCheck, History, Cpu, Wifi, TrendingUp, TrendingDown, AlertCircle, 
  Home, Calendar, UserCheck, Receipt, DollarSign, ChevronRight, Phone, Clock,
  BarChart3, Printer, Search, ArrowUpRight, ArrowDownRight, Wallet, FileSpreadsheet, Download,
  Smartphone, Banknote, User, Mail, MapPin
} from 'lucide-react';
import axios from 'axios';

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

export default function App() {
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
  const [settingsTab, setSettingsTab] = useState<'tokopay' | 'devices'>('tokopay');
  const [paymentTab, setPaymentTab] = useState<'pending' | 'history'>('pending');

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
      if(currentUser.role === 'admin') {
         const [resUsers, resRooms, resBills, resLogs, resSettings, resExpenses] = await Promise.all([
           axios.get('/api/users'), 
           axios.get('/api/rooms'), 
           axios.get('/api/bills'), 
           axios.get('/api/logs'), 
           axios.get('/api/settings'),
           axios.get('/api/expenses').catch(() => ({ data: [] }))
         ]);
         setUsers(resUsers.data || []); 
         setRooms(resRooms.data || []); 
         setBills(resBills.data || []); 
         setLogs(resLogs.data || []); 
         setSettings(resSettings.data || {});
         setExpenses(resExpenses.data || []);
         if (isManual) showToast('Data dashboard berhasil diperbarui', 'success');
      } else {
         const [resRooms, resBills] = await Promise.all([axios.get('/api/rooms'), axios.get('/api/bills')]);
         setRooms(resRooms.data || []); 
         setBills(resBills.data || []); 
         
         const myBill = resBills.data?.find((b: any) => b.user_id === currentUser.id);
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
          const updatedBill = response.data?.find((b: any) => b.id === paymentModal.id);
          
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
        userId: currentUser.id,
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
    try {
      await axios.post('/api/settings', { merchant_id: e.target.merchant_id.value, secret_key: e.target.secret_key.value });
      showToast('Setting API TokoPay tersimpan', 'success'); fetchDashboardData();
    } catch (error) { showToast('Gagal simpan setting', 'error'); }
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
      const response = await axios.post('/api/users?action=choose-room', { userId: currentUser.id, roomId });
      if (response.data.success) {
        showToast('Kamar dipesan! Segera lunasi tagihan.', 'success');
        setCurrentUser({ ...currentUser, room_id: roomId }); fetchDashboardData();
      } else { showToast(response.data.message, 'error'); }
    } catch (error) { showToast('Gagal memproses kamar. Coba lagi.', 'error'); }
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
      const response = await axios.post('/api/users?action=start-enroll', { userId: currentUser.id });
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
      await axios.post('/api/users?action=cancel-enroll', { userId: currentUser.id });
    } catch (e) {}
    setIsScanningFP(false);
    showToast('Perekaman sidik jari dibatalkan.', 'info');
  };

  useEffect(() => {
    let timer: any;
    let pollInterval: any;

    if (isScanningFP) {
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
          const myData = res.data?.find((u: any) => u.id === currentUser.id);
          
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
        userId: currentUser.id,
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

  const totalPemasukan = bills
    .filter(b => b.status === 'lunas')
    .reduce((sum, b) => sum + (Number(b.nominal) || 0), 0);

  const totalPengeluaran = expenses
    .reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);

  const unpaidTenantsSet = new Set(
    bills.filter(b => b.status === 'pending').map(b => b.user_id)
  );
  const totalBelumLunas = unpaidTenantsSet.size;

  const isRoomOccupied = (r: any) => {
    if (!r) return false;
    const hasResident = users.some(u => 
      (!u.role || u.role === 'resident' || u.role !== 'admin') && (
        (u.room_id && (String(u.room_id).trim() === String(r.id).trim() || String(u.room_id).trim() === String(r.number).trim())) ||
        (r.resident_id && String(r.resident_id).trim() === String(u.id).trim())
      )
    );
    return hasResident || r.status === 'occupied' || Boolean(r.resident_id);
  };

  const totalKamarCount = rooms.length || 1;
  const kamarTerisiCount = rooms.filter(r => isRoomOccupied(r)).length;
  const kamarKosongCount = Math.max(0, rooms.length - kamarTerisiCount);
  const occupancyPercent = rooms.length > 0 ? Math.round((kamarTerisiCount / rooms.length) * 100) : 0;

  const handleApplyReportFilter = () => {
    setAppliedStartDate(reportStartDate);
    setAppliedEndDate(reportEndDate);
    showToast('Laporan berhasil disaring sesuai tanggal', 'info');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredReportBills = bills.filter(b => {
    if (b.status !== 'lunas') return false;
    const dateStr = (b.created_at || b.due_date || '').split('T')[0];
    if (!dateStr) return true;
    return dateStr >= appliedStartDate && dateStr <= appliedEndDate;
  });

  const filteredReportExpenses = expenses.filter(e => {
    const dateStr = (e.expense_date || e.created_at || '').split('T')[0];
    if (!dateStr) return true;
    return dateStr >= appliedStartDate && dateStr <= appliedEndDate;
  });

  const reportPemasukan = filteredReportBills.reduce((sum, b) => sum + (Number(b.nominal) || 0), 0);
  const reportPengeluaran = filteredReportExpenses.reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);
  const reportKeuntunganBersih = reportPemasukan - reportPengeluaran;

  const combinedReportTransactions = [
    ...filteredReportBills.map(b => {
      const user = users.find(u => u.id === b.user_id);
      const room = rooms.find(r => r.id === user?.room_id);
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

      const mBills = bills.filter(b => {
        if (b.status !== 'lunas') return false;
        const bDate = new Date(b.created_at || b.due_date);
        return bDate.getFullYear() === year && bDate.getMonth() === month;
      });
      const income = mBills.reduce((s, b) => s + (Number(b.nominal) || 0), 0);

      const mExpenses = expenses.filter(e => {
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

  const sortedRooms = [...rooms].sort((a, b) => {
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

  const totalTenantsWithRooms = users.filter(u => u.role === 'resident' && u.room_id).length;
  const totalLunasCount = Math.max(0, totalTenantsWithRooms - totalBelumLunas);

  const pendingBillsList = bills.filter(b => b.status === 'pending');
  const historyBillsList = bills.filter(b => b.status === 'lunas');

  const renderAuth = () => (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full text-white inline-block mb-3"><Fingerprint size={32} /></div>
          <h1 className="text-2xl font-black text-slate-800">SmartKos System</h1>
          <p className="text-slate-500 text-sm">Masuk / Daftar Area Penghuni</p>
        </div>

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" name="username" defaultValue={lastRegUsername} placeholder="Username" autoComplete="username" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="password" name="password" placeholder="Password" autoComplete="current-password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow hover:bg-blue-700">Login</button>
            <p className="text-center text-sm text-slate-600 mt-4">Belum punya kamar? <button type="button" onClick={() => setView('register')} className="text-blue-600 font-bold hover:underline">Daftar Baru</button></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
              <input type="text" name="name" placeholder="Contoh: Rian Pratama" autoComplete="name" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap</label>
              <textarea name="address" rows={2} placeholder="Alamat asal / domisili KTP lengkap" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 resize-none" required></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Username</label>
                <input type="text" name="username" placeholder="Username baru" autoComplete="username" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nomor WhatsApp</label>
                <input type="tel" name="phone" placeholder="Contoh: 08123456789" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Aktif</label>
              <input type="email" name="email" placeholder="nama@email.com" autoComplete="email" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
              <input type="password" name="password" placeholder="Password akun" autoComplete="new-password" className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold shadow hover:bg-green-700 transition mt-2">Daftar Akun</button>
            <p className="text-center text-sm text-slate-600 mt-3">Sudah punya akun? <button type="button" onClick={() => { setView('login'); setLastRegUsername(''); }} className="text-blue-600 font-bold hover:underline">Login</button></p>
          </form>
        )}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex print:hidden">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <Fingerprint className="text-blue-400" size={28} />
          <span className="font-bold text-xl">AdminKos</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
          {[
            { id: 'admin_dashboard', icon: Activity, label: 'Dashboard Utama' },
            { id: 'admin_payments', icon: CreditCard, label: 'Pembayaran' },
            { id: 'admin_expenses', icon: Receipt, label: 'Buku Pengeluaran' },
            { id: 'admin_reports', icon: BarChart3, label: 'Laporan Keuangan' },
            { id: 'admin_logs', icon: FileText, label: 'Log Pintu' },
            { id: 'admin_users', icon: Users, label: 'Kelola User' },
            { id: 'admin_settings', icon: Settings, label: 'Pengaturan' }
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${(view === item.id || (item.id === 'admin_payments' && (view === 'admin_bills' || view === 'admin_history'))) ? 'bg-blue-600 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <item.icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={logout} className="w-full flex items-center p-3 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition"><LogOut size={18} className="mr-3" /> Keluar</button></div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:bg-white">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <div>
            <h2 className="text-xl font-black text-slate-800">Dashboard Manajemen SmartKos</h2>
            <p className="text-xs text-slate-500">Monitoring Hunian, Akses Pintu Biometrik & Arus Kas</p>
          </div>
          <button onClick={() => fetchDashboardData(true)} className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-bold text-sm">
            <RefreshCcw size={16} className={`mr-2 ${isLoading && 'animate-spin'}`}/> Segarkan
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD UTAMA */}
        {/* ========================================================================= */}
        {view === 'admin_dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1e293b] text-white p-5 rounded-2xl shadow-sm border border-slate-700 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">
                    PEMASUKAN
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight mb-1">
                    Rp {totalPemasukan.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {totalLunasCount} dari {totalTenantsWithRooms} penyewa lunas
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    PENGELUARAN
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setExpenseModal(true)} 
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition" 
                      title="Catat Pengeluaran"
                    >
                      <Plus size={14} />
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                      <TrendingDown size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                    Rp {totalPengeluaran.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Bulan ini</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    BELUM LUNAS
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock size={16} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight mb-1 flex items-baseline gap-1.5">
                    <span>{totalBelumLunas}</span>
                    <span className="text-sm font-semibold text-slate-500">penyewa</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Butuh ditagih</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    HUNIAN
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Home size={16} />
                  </div>
                </div>
                <div>
                  <div className="text-base font-black text-slate-800 tracking-tight mb-2">
                    {kamarTerisiCount}/{totalKamarCount} <span className="text-xs font-semibold text-slate-400">kamar terisi</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{occupancyPercent}% hunian</span>
                </div>
              </div>
            </div>

            {/* STATUS KAMAR */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Status Kamar</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {sortedRooms.length} kamar · {kamarKosongCount} kosong · {totalBelumLunas} belum lunas
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button 
                      onClick={() => setFloorFilter('all')} 
                      className={`px-3 py-1.5 rounded-lg transition ${floorFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Semua ({sortedRooms.length})
                    </button>
                    <button 
                      onClick={() => setFloorFilter('lt2')} 
                      className={`px-3 py-1.5 rounded-lg transition ${floorFilter === 'lt2' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Lt 2 ({roomsLantai2.length})
                    </button>
                    <button 
                      onClick={() => setFloorFilter('lt3')} 
                      className={`px-3 py-1.5 rounded-lg transition ${floorFilter === 'lt3' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Lt 3 ({roomsLantai3.length})
                    </button>
                  </div>

                  <button 
                    onClick={() => setRoomModal({ type: 'add', data: {} })} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-md shadow-blue-600/20 transition"
                  >
                    <Plus size={15} className="mr-1.5" /> Tambah Kamar
                  </button>
                </div>
              </div>

              {/* GRID DENAH STATUS KAMAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedRooms.map(room => {
                  const resident = users.find(u => 
                    (room.resident_id && String(u.id).trim() === String(room.resident_id).trim()) ||
                    (u.room_id && (String(u.room_id).trim() === String(room.id).trim() || String(u.room_id).trim() === String(room.number).trim()))
                  );

                  const targetUserId = resident?.id || room.resident_id;
                  const residentBills = bills.filter(b => targetUserId && String(b.user_id).trim() === String(targetUserId).trim());
                  const hasPendingBill = residentBills.some(b => b.status === 'pending');
                  const hasLunasBill = residentBills.some(b => b.status === 'lunas');
                  const isOccupied = Boolean(resident || room.status === 'occupied' || room.resident_id);

                  const isPaid = Boolean(
                    (resident?.is_fingerprint_active && !hasPendingBill) || 
                    (hasLunasBill && !hasPendingBill) ||
                    (resident?.active_until && new Date(resident.active_until) > new Date() && !hasPendingBill)
                  );

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
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                              <DoorOpen size={18} />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 leading-tight">
                                Kamar {room.number}
                              </h4>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {floorLabel}
                              </span>
                            </div>
                          </div>

                          {isOccupied ? (
                            isPaid ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Lunas
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60 inline-flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Belum Lunas
                              </span>
                            )
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 inline-flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span> Kosong
                            </span>
                          )}
                        </div>

                        {isOccupied ? (
                          <div className="space-y-1.5 my-3 text-xs">
                            <div className="flex items-center text-slate-700 font-semibold truncate">
                              <UserCheck size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{residentName}</span>
                            </div>
                            <div className="flex items-center text-slate-500 font-normal">
                              <Phone size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span>{residentPhone}</span>
                            </div>
                            <div className="flex items-center text-[11px] text-slate-400 pt-0.5">
                              <Calendar size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span>Masuk: {masukDateStr}</span>
                              <span className="mx-1.5">·</span>
                              <span className={`font-semibold ${isPaid ? 'text-slate-600' : 'text-amber-600'}`}>
                                JT: {dueDateStr}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="my-3 py-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs font-semibold text-slate-400">
                            Kosong
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 font-medium block">Sewa / bulan</span>
                          <span className="font-black text-slate-800 text-sm">
                            Rp {Number(room.price || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setRoomModal({ type: 'edit', data: room })}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center border border-blue-200 shadow-xs"
                            title="Edit Data Kamar"
                          >
                            <Edit size={13} className="mr-1" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Kamar"
                          >
                            <Trash2 size={14} />
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

        {/* ========================================================================= */}
        {/* VIEW: PEMBAYARAN */}
        {/* ========================================================================= */}
        {(view === 'admin_payments' || view === 'admin_bills' || view === 'admin_history') && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center">
                  <CreditCard className="mr-2.5 text-blue-600" size={24} /> Manajemen Pembayaran & Tagihan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invoice format ADIBKOS, deteksi QRIS otomatis (GoPay, OVO, ShopeePay, DANA), dan arsip transaksi
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button 
                    onClick={() => setPaymentTab('pending')}
                    className={`px-4 py-2 rounded-lg flex items-center transition ${paymentTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Clock size={14} className="mr-1.5 text-amber-500" />
                    Tagihan Berjalan ({pendingBillsList.length})
                  </button>
                  <button 
                    onClick={() => setPaymentTab('history')}
                    className={`px-4 py-2 rounded-lg flex items-center transition ${paymentTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <CheckCircle size={14} className="mr-1.5 text-emerald-500" />
                    Riwayat Lunas ({historyBillsList.length})
                  </button>
                </div>

                <button 
                  onClick={handleGenerateBills} 
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-md shadow-emerald-600/20 transition whitespace-nowrap"
                  title="Generate tagihan bulanan format ADIBKOS"
                >
                  <Plus size={15} className="mr-1.5" /> Buat Tagihan Baru
                </button>
              </div>
            </div>

            {/* TAB 1: TAGIHAN BERJALAN */}
            {paymentTab === 'pending' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="font-bold text-sm text-slate-800">Daftar Tagihan Sewa (Pending / Belum Lunas)</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Total: {pendingBillsList.length} tagihan</span>
                </div>

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
                        const user = users.find(u => u.id === b.user_id);
                        const room = rooms.find(r => r.id === user?.room_id);
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
                                  className="text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 text-xs font-bold transition shadow-xs flex items-center"
                                  title="Tandai tagihan lunas manual (Tunai)"
                                >
                                  <CheckCircle size={13} className="mr-1.5 text-emerald-600" /> Set Lunas (Tunai)
                                </button>
                                <button 
                                  onClick={() => setBillModal(b)} 
                                  className="text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-300 text-xs font-bold transition shadow-xs flex items-center"
                                >
                                  <Edit size={13} className="mr-1.5 text-blue-600" /> Edit Nominal
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
                            <p className="text-xs text-slate-400 mt-1">Tidak ada tagihan tertunda yang perlu ditagihkan.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: RIWAYAT PEMBAYARAN LUNAS */}
            {paymentTab === 'history' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-sm text-slate-800">Arsip Riwayat Pembayaran (Status Lunas)</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Total: {historyBillsList.length} transaksi</span>
                </div>

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
                        const user = users.find(u => u.id === b.user_id);
                        const room = rooms.find(r => r.id === user?.room_id);
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
                                className="text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-bold transition shadow-xs inline-flex items-center"
                              >
                                <Trash2 size={13} className="mr-1.5" /> Hapus
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {historyBillsList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400">
                            <History size={40} className="mx-auto text-slate-300 mb-2" />
                            <p className="font-bold text-slate-700 text-sm">Belum Ada Riwayat Transaksi</p>
                            <p className="text-xs text-slate-400 mt-1">Transaksi yang sudah lunas akan tercatat otomatis di sini.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: BUKU PENGELUARAN */}
        {/* ========================================================================= */}
        {view === 'admin_expenses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-black text-xl text-slate-800">Catatan Pengeluaran Kos</h3>
                <p className="text-xs text-slate-500">Mencatat biaya listrik, air, internet, perbaikan, dan kebersihan</p>
              </div>
              <button 
                onClick={() => setExpenseModal(true)} 
                className="bg-rose-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-rose-700 transition text-sm"
              >
                <Plus size={16} className="mr-2" /> Catat Pengeluaran Baru
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Keperluan / Keterangan</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-500">{formatDateSafe(exp.expense_date || exp.created_at)}</td>
                      <td className="p-4 font-bold text-slate-800">{exp.title}</td>
                      <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{exp.category}</span></td>
                      <td className="p-4 font-black text-rose-600">Rp {Number(exp.nominal).toLocaleString('id-ID')}</td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteExpense(exp.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">Belum ada catatan pengeluaran. Klik tombol di atas untuk menambah.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: KELOLA USER (DI ATAS PENGATURAN) */}
        {/* ========================================================================= */}
        {view === 'admin_users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
            <h3 className="font-bold mb-6 text-lg">Kelola User (Penghuni Aktif)</h3>
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-4">Nama</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Kamar</th>
                    <th className="p-4">Status Sidik Jari</th>
                    <th className="p-4">Status Tagihan</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4 text-slate-500">{u.username}</td>
                      <td className="p-4 font-bold">{rooms.find(r => r.id === u.room_id)?.number || '-'}</td>
                      <td className="p-4">
                        {u.fingerprint_id ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 inline-flex items-center">
                            <CheckCircle size={12} className="mr-1" /> Terdaftar & Aktif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                            Belum Didaftarkan
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {!u.room_id ? (
                           <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-500">BELUM PILIH KAMAR</span>
                        ) : !u.is_fingerprint_active ? (
                           <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">TERKUNCI (BELUM LUNAS)</span>
                        ) : (
                           <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">LUNAS</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              await axios.put('/api/users', {
                                userId: u.id,
                                fingerprint_id: u.id.toString(),
                                is_fingerprint_active: true
                              });
                              showToast(`Sidik jari ${u.name} langsung diaktifkan!`, 'success');
                              fetchDashboardData();
                            } catch(e) {
                              showToast('Gagal mengaktifkan', 'error');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm"
                        >
                          <ShieldCheck size={14} className="mr-1.5" />
                          {u.fingerprint_id ? 'Reset / Aktifkan Ulang' : 'Langsung Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: LAPORAN KEUANGAN */}
        {/* ========================================================================= */}
        {view === 'admin_reports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Laporan Keuangan</h2>
                <p className="text-xs text-slate-500 font-medium">Ringkasan pemasukan & pengeluaran berdasarkan rentang tanggal</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print:hidden">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">DARI</span>
                  <input 
                    type="date" 
                    value={reportStartDate} 
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 outline-none"
                  />
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">SAMPAI</span>
                  <input 
                    type="date" 
                    value={reportEndDate} 
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 outline-none"
                  />
                </div>
                <button 
                  onClick={handleApplyReportFilter}
                  className="bg-[#2c3e50] hover:bg-[#1a252f] text-white px-5 py-2.5 rounded-xl font-bold flex items-center transition shadow-sm"
                >
                  <Search size={14} className="mr-1.5" /> Terapkan
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-600/20 transition"
                >
                  <FileSpreadsheet size={15} className="mr-2" /> Export Excel (.xls)
                </button>
                <button 
                  onClick={handlePrintReport}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center shadow-xs transition"
                >
                  <Printer size={15} className="mr-2 text-slate-500" /> Cetak / PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                    <TrendingUp size={15} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    PEMASUKAN
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                    Rp {reportPemasukan.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {filteredReportBills.length} pembayaran lunas
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                    <TrendingDown size={15} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    PENGELUARAN
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                    Rp {reportPengeluaran.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {filteredReportExpenses.length} item pengeluaran
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <Wallet size={15} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    UANG MUKA
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                    Rp 0
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    0 penyewa
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${reportKeuntunganBersih >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Receipt size={15} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    KEUNTUNGAN BERSIH
                  </span>
                </div>
                <div>
                  <div className={`text-2xl font-black tracking-tight mb-1 ${reportKeuntunganBersih < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {reportKeuntunganBersih < 0 ? `-Rp ${Math.abs(reportKeuntunganBersih).toLocaleString('id-ID')}` : `Rp ${reportKeuntunganBersih.toLocaleString('id-ID')}`}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDateSafe(appliedStartDate)} – {formatDateSafe(appliedEndDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Grafik Tren 6 Bulan */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden">
              <div className="mb-6">
                <h3 className="font-bold text-base text-slate-800">Tren 6 Bulan Terakhir</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pemasukan, pengeluaran, dan keuntungan bersih per bulan</p>
              </div>

              <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 border-b border-slate-100">
                {trendData.map((item, idx) => {
                  const incomeHeight = Math.max(6, Math.min(100, Math.round((item.income / maxTrendVal) * 100)));
                  const expenseHeight = Math.max(6, Math.min(100, Math.round((item.expense / maxTrendVal) * 100)));
                  const profitHeight = Math.max(6, Math.min(100, Math.round((Math.max(0, item.profit) / maxTrendVal) * 100)));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                        <div 
                          className="w-3 sm:w-5 bg-sky-400 rounded-t-md transition-all hover:bg-sky-500 relative" 
                          style={{ height: `${incomeHeight}%` }}
                          title={`Pemasukan: Rp ${item.income.toLocaleString('id-ID')}`}
                        ></div>
                        <div 
                          className="w-3 sm:w-5 bg-rose-400 rounded-t-md transition-all hover:bg-rose-500 relative" 
                          style={{ height: `${expenseHeight}%` }}
                          title={`Pengeluaran: Rp ${item.expense.toLocaleString('id-ID')}`}
                        ></div>
                        <div 
                          className="w-3 sm:w-5 bg-[#2c3e50] rounded-t-md transition-all hover:bg-slate-900 relative" 
                          style={{ height: `${profitHeight}%` }}
                          title={`Keuntungan: Rp ${item.profit.toLocaleString('id-ID')}`}
                        ></div>
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-3 whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-[#2c3e50]"></span>
                  <span>Keuntungan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-sky-400"></span>
                  <span>Pemasukan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-rose-400"></span>
                  <span>Pengeluaran</span>
                </div>
              </div>
            </div>

            {/* TABEL BUKU KAS GABUNGAN DI LAYAR DENGAN METODE BAYAR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div>
                  <h4 className="font-black text-slate-800 text-base flex items-center">
                    <FileSpreadsheet className="mr-2 text-emerald-600" size={18} /> Buku Kas Mutasi Keuangan (Pratinjau Spreadsheet)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Rincian mutasi kas lengkap dengan channel pembayaran anak kos</p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center transition"
                >
                  <Download size={14} className="mr-1.5" /> Unduh .XLS
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
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
                        <td className="p-3 text-center">
                          {renderPaymentBadge(t.paymentMethod)}
                        </td>
                        <td className="p-3 text-right font-black text-sky-600 font-mono">
                          {t.income > 0 ? `Rp ${t.income.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="p-3 text-right font-black text-rose-600 font-mono">
                          {t.expense > 0 ? `Rp ${t.expense.toLocaleString('id-ID')}` : '-'}
                        </td>
                      </tr>
                    ))}

                    {combinedReportTransactions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          Tidak ada transaksi yang tercatat pada rentang tanggal ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {combinedReportTransactions.length > 0 && (
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
                      <tr>
                        <td colSpan={6} className="p-3 text-right uppercase tracking-wider text-[11px]">Total Kas:</td>
                        <td className="p-3 text-right font-black text-sky-600 font-mono">Rp {reportPemasukan.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-black text-rose-600 font-mono">Rp {reportPengeluaran.toLocaleString('id-ID')}</td>
                      </tr>
                      <tr className="bg-slate-100/70 border-t border-slate-200">
                        <td colSpan={6} className="p-3 text-right uppercase tracking-wider text-[11px]">Keuntungan Bersih:</td>
                        <td colSpan={2} className={`p-3 text-right font-black text-sm font-mono ${reportKeuntunganBersih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          Rp {reportKeuntunganBersih.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* FORMAT CETAK DOKUMEN RESMI (HANYA SAAT CETAK / PDF) */}
            <div className="hidden print:block print-document-container p-2 text-black">
              <div className="text-center border-b-2 border-black pb-4 mb-5">
                <h1 className="text-2xl font-black uppercase tracking-wider">SMARTKOS MANAGEMENT SYSTEM</h1>
                <h2 className="text-base font-bold uppercase text-slate-700 mt-1">Laporan Rekapitulasi Arus Kas & Keuangan</h2>
                <div className="text-xs text-slate-600 mt-1 flex justify-center gap-4">
                  <span><strong>Periode:</strong> {formatDateSafe(appliedStartDate)} s/d {formatDateSafe(appliedEndDate)}</span>
                  <span>·</span>
                  <span><strong>Dicetak Pada:</strong> {formatDateSafe(new Date())}</span>
                </div>
              </div>

              <table className="w-full border-collapse border border-black mb-6 text-xs">
                <thead>
                  <tr className="bg-slate-200 text-black">
                    <th className="border border-black p-2.5 text-center font-bold">TOTAL PEMASUKAN</th>
                    <th className="border border-black p-2.5 text-center font-bold">TOTAL PENGELUARAN</th>
                    <th className="border border-black p-2.5 text-center font-bold">KEUNTUNGAN BERSIH</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center text-sm font-black">
                    <td className="border border-black p-3 text-sky-900">Rp {reportPemasukan.toLocaleString('id-ID')}</td>
                    <td className="border border-black p-3 text-rose-900">Rp {reportPengeluaran.toLocaleString('id-ID')}</td>
                    <td className="border border-black p-3 text-emerald-900">Rp {reportKeuntunganBersih.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Rincian Mutasi Transaksi (Buku Kas Besar):</h3>
                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-slate-200 text-black">
                      <th className="border border-black p-2 text-center w-10">No</th>
                      <th className="border border-black p-2 text-center w-24">Tanggal</th>
                      <th className="border border-black p-2 text-center w-20">Tipe</th>
                      <th className="border border-black p-2 text-left w-32">Kamar / Kategori</th>
                      <th className="border border-black p-2 text-left">Keterangan / Penghuni</th>
                      <th className="border border-black p-2 text-center w-24">Metode Bayar</th>
                      <th className="border border-black p-2 text-right w-24">Pemasukan</th>
                      <th className="border border-black p-2 text-right w-24">Pengeluaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedReportTransactions.map((t, idx) => (
                      <tr key={t.id} className="border-b border-black">
                        <td className="border border-black p-1.5 text-center font-mono">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center">{t.date}</td>
                        <td className="border border-black p-1.5 text-center font-bold">{t.type}</td>
                        <td className="border border-black p-1.5">{t.category}</td>
                        <td className="border border-black p-1.5">{t.description}</td>
                        <td className="border border-black p-1.5 text-center font-semibold">{t.paymentMethod}</td>
                        <td className="border border-black p-1.5 text-right font-mono font-semibold">
                          {t.income > 0 ? `Rp ${t.income.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="border border-black p-1.5 text-right font-mono font-semibold">
                          {t.expense > 0 ? `Rp ${t.expense.toLocaleString('id-ID')}` : '-'}
                        </td>
                      </tr>
                    ))}

                    {combinedReportTransactions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="border border-black p-4 text-center">
                          Tidak ada catatan transaksi pada periode yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={6} className="border border-black p-2 text-right uppercase">TOTAL KESELURUHAN:</td>
                      <td className="border border-black p-2 text-right font-mono">Rp {reportPemasukan.toLocaleString('id-ID')}</td>
                      <td className="border border-black p-2 text-right font-mono">Rp {reportPengeluaran.toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="bg-slate-200 font-black text-xs">
                      <td colSpan={6} className="border border-black p-2.5 text-right uppercase">SALDO AKHIR (LABA BERSIH):</td>
                      <td colSpan={2} className="border border-black p-2.5 text-right font-mono text-sm">
                        Rp {reportKeuntunganBersih.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <div className="text-center w-56 text-xs">
                  <p className="text-slate-700">Pengelola SmartKos,</p>
                  <div className="h-20"></div>
                  <p className="font-bold border-b border-black pb-1 uppercase">{currentUser?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Penanggung Jawab Keuangan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: LOG PINTU */}
        {/* ========================================================================= */}
        {view === 'admin_logs' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <h3 className="font-bold text-lg flex items-center"><FileText className="mr-2 text-blue-600"/> Log Buka Pintu (Fingerprint)</h3>
               <button onClick={handleClearLogs} className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center shadow-sm"><Trash2 size={14} className="mr-1"/> Kosongkan Log</button>
            </div>
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 border-b"><tr><th className="p-4">Waktu</th><th className="p-4">User</th><th className="p-4">Aksi / Pesan Sistem</th></tr></thead>
                <tbody className="divide-y">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-4 whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                      <td className="p-4 font-bold">{users.find(u => u.id === l.user_id)?.name || 'Unknown'}</td>
                      <td className="p-4 text-slate-600">{l.action}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: PENGATURAN */}
        {/* ========================================================================= */}
        {view === 'admin_settings' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center">
                    <Settings className="mr-2.5 text-blue-600" size={24}/> Pengaturan Sistem & Integrasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola gerbang pembayaran TokoPay (QRIS) dan koneksi perangkat IoT pintu kamar
                  </p>
                </div>

                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button 
                    onClick={() => setSettingsTab('tokopay')} 
                    className={`px-4 py-2 rounded-lg flex items-center transition ${settingsTab === 'tokopay' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <ShieldCheck size={14} className="mr-1.5" /> API TokoPay (QRIS)
                  </button>
                  <button 
                    onClick={() => setSettingsTab('devices')} 
                    className={`px-4 py-2 rounded-lg flex items-center transition ${settingsTab === 'devices' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Cpu size={14} className="mr-1.5" /> Perangkat Fingerprint
                  </button>
                </div>
              </div>
            </div>

            {settingsTab === 'tokopay' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="border-b pb-4 mb-6">
                  <h4 className="font-black text-slate-800 text-base flex items-center">
                    <CreditCard className="mr-2 text-blue-600" size={18} /> Integrasi Pembayaran QRIS Otomatis
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Masukkan kredensial akun TokoPay Anda agar invoice tagihan anak kos otomatis menghasilkan QRIS real-time.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Merchant ID TokoPay
                    </label>
                    <input 
                      type="text" 
                      name="merchant_id" 
                      defaultValue={settings.tokopay_merchant_id} 
                      placeholder="Contoh: M240101XXXXX"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Secret Key TokoPay
                    </label>
                    <input 
                      type="password" 
                      name="secret_key" 
                      defaultValue={settings.tokopay_secret_key} 
                      placeholder="Masukkan Secret Key TokoPay"
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                      required 
                    />
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-md shadow-blue-600/20 transition"
                    >
                      <Save size={16} className="mr-2"/> Simpan Konfigurasi
                    </button>
                    <button 
                      type="button" 
                      onClick={handleTestTokoPay} 
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center transition border border-slate-200"
                    >
                      <RefreshCcw size={15} className="mr-2 text-slate-500"/> Uji Koneksi API
                    </button>
                  </div>
                </form>
              </div>
            )}

            {settingsTab === 'devices' && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <div className="border-b pb-4">
                  <h4 className="font-black text-slate-800 text-base flex items-center">
                    <Wifi className="mr-2 text-blue-600" size={18} /> Koneksi Perangkat Fingerprint (IoT)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur Device ID perangkat ESP8266 pada masing-masing pintu kamar. Jika menggunakan 1 alat uji coba di meja, cukup gunakan ID default <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">KAMAR-A1</span>.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                      <tr>
                        <th className="p-3.5">Kamar</th>
                        <th className="p-3.5">Device ID Pintu (ESP8266)</th>
                        <th className="p-3.5 text-center">Status Hardware</th>
                        <th className="p-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedRooms.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5">
                            <span className="font-black text-slate-800 text-sm block">Kamar {r.number}</span>
                            <span className="text-[11px] text-slate-400">{r.name}</span>
                          </td>
                          <td className="p-3.5">
                            <form 
                              onSubmit={(e: any) => { 
                                e.preventDefault(); 
                                handleSaveDevice(r.id, e.target.device_id.value); 
                              }} 
                              className="flex items-center gap-2 max-w-xs"
                            >
                              <input 
                                type="text" 
                                name="device_id" 
                                defaultValue={r.device_id || `KAMAR-${r.number}`} 
                                placeholder="Ex: KAMAR-201" 
                                className="p-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono outline-none focus:ring-1 focus:ring-blue-500 flex-1" 
                              />
                              <button 
                                type="submit" 
                                className="bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-2 rounded-lg text-xs font-bold transition shadow-xs"
                              >
                                Simpan
                              </button>
                            </form>
                          </td>
                          <td className="p-3.5 text-center">
                            <button 
                              onClick={() => handleToggleRoomFingerprint(r.id, r.fingerprint_status)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition inline-flex items-center ${
                                r.fingerprint_status 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${r.fingerprint_status ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {r.fingerprint_status ? 'ONLINE' : 'OFFLINE'}
                            </button>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="text-[11px] text-slate-400">
                              {r.device_id ? 'Terhubung' : 'Standby'}
                            </span>
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

        {/* Modal Catat Pengeluaran Baru */}
        {expenseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveExpense} className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">Catat Pengeluaran Baru</h3>
                  <p className="text-xs text-slate-500">Biaya operasional & pemeliharaan</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan / Keterangan</label>
                  <input type="text" name="title" placeholder="Contoh: Token Listrik Lt 2" className="w-full p-2.5 text-sm border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-rose-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                  <input type="number" name="nominal" placeholder="Contoh: 250000" className="w-full p-2.5 text-sm border rounded-xl font-mono font-bold text-rose-600 bg-slate-50 outline-none focus:ring-2 focus:ring-rose-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select name="category" className="w-full p-2.5 text-sm border rounded-xl bg-slate-50 outline-none">
                    <option value="Listrik & Air">Listrik & Air</option>
                    <option value="Internet / WiFi">Internet / WiFi</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Perbaikan / Maintenance">Perbaikan / Maintenance</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input type="date" name="expense_date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 text-sm border rounded-xl bg-slate-50 outline-none" required />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setExpenseModal(false)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Kamar */}
        {roomModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveRoom} className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-lg mb-4">{roomModal.type === 'add' ? 'Tambah Kamar' : 'Edit Kamar'}</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Kamar</label>
                  <input type="text" name="number" defaultValue={roomModal.data.number} placeholder="Nomor Kamar (ex: 1, 2, 201)" className="w-full p-2.5 text-sm border rounded-lg bg-slate-50 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Tipe Kamar</label>
                  <input type="text" name="name" defaultValue={roomModal.data.name} placeholder="Nama Tipe Kamar" className="w-full p-2.5 text-sm border rounded-lg bg-slate-50 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harga Sewa / Bulan (Rp)</label>
                  <input type="number" name="price" defaultValue={roomModal.data.price} placeholder="Harga Sewa / Bulan" className="w-full p-2.5 text-sm border rounded-lg bg-slate-50 font-bold text-blue-600 outline-none" required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRoomModal(null)} className="flex-1 p-2.5 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 p-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        )}
        
        {/* Modal Tagihan */}
        {billModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleEditBill} className="bg-white p-6 rounded-xl w-full max-w-sm">
              <h3 className="font-bold text-lg mb-2">Edit Nominal Tagihan</h3>
              <p className="text-sm text-slate-500 mb-4">User ID: {billModal.user_id}</p>
              <input type="number" name="nominal" defaultValue={billModal.nominal} className="w-full p-3 border rounded mb-4 text-lg font-bold text-red-600" required />
              <div className="flex gap-2"><button type="button" onClick={() => setBillModal(null)} className="flex-1 p-2 bg-slate-200 rounded font-bold">Batal</button><button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded font-bold">Simpan</button></div>
            </form>
          </div>
        )}

        {/* Modal Koreksi Metode Pembayaran */}
        {changeMethodModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CreditCard size={24} />
              </div>
              <h3 className="font-black text-slate-800 text-base mb-1">Koreksi Metode Pembayaran</h3>
              <p className="text-xs text-slate-500 mb-2">
                Invoice: <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{changeMethodModal.ref_id}</span>
              </p>
              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4 leading-relaxed font-medium">
                💡 <strong>Catatan:</strong> Pembayaran QRIS online akan terdeteksi <strong>otomatis</strong> oleh sistem. Menu ini hanya dipakai jika Anda ingin mengubahnya secara manual.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-bold">
                {[
                  { label: 'QRIS DANA', badge: 'bg-sky-50 text-sky-700 border-sky-300' },
                  { label: 'QRIS GoPay', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                  { label: 'QRIS BCA', badge: 'bg-blue-50 text-blue-700 border-blue-300' },
                  { label: 'QRIS ShopeePay', badge: 'bg-orange-50 text-orange-700 border-orange-300' },
                  { label: 'QRIS OVO', badge: 'bg-purple-50 text-purple-700 border-purple-300' },
                  { label: 'QRIS Mandiri', badge: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
                  { label: 'QRIS BRI', badge: 'bg-cyan-50 text-cyan-700 border-cyan-300' },
                  { label: 'Tunai / Manual', badge: 'bg-amber-50 text-amber-700 border-amber-300' }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleChangePaymentMethod(changeMethodModal.id, item.label)}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border font-bold transition flex items-center justify-center ${item.badge} hover:shadow-xs hover:scale-[1.02]`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setChangeMethodModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResident = () => {
    if (!currentUser.room_id) {
      return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
          <nav className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border">
             <div className="font-black text-xl flex items-center"><Fingerprint className="mr-2 text-blue-600" /> SmartKos</div>
             <button onClick={logout} className="text-red-600 font-bold flex items-center hover:bg-red-50 px-3 py-2 rounded transition"><LogOut size={16} className="mr-2"/> Keluar</button>
          </nav>
          <div className="max-w-4xl mx-auto">
             <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border text-center">
               <h2 className="text-2xl font-black mb-2">Selamat Datang, {currentUser.name}!</h2>
               <p className="text-slate-600">Silakan pilih kamar kosong di bawah ini untuk mulai menyewa.</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {sortedRooms.filter(r => r.status === 'available').map(room => (
                 <div key={room.id} className="bg-white p-6 rounded-xl shadow border border-slate-200 text-center hover:border-blue-400 transition">
                   <h3 className="text-3xl font-black text-slate-800 mb-2">{room.number}</h3>
                   <p className="text-sm text-slate-500 mb-4">{room.name}</p>
                   <p className="text-xl font-bold text-blue-600 mb-6">Rp {Number(room.price || 0).toLocaleString('id-ID')}/bln</p>
                   <button onClick={() => handleChooseRoom(room.id)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow hover:bg-blue-700">Pilih Kamar Ini</button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      );
    }

    const myBills = bills.filter(b => b.user_id === currentUser.id);
    const pendingBill = myBills.find(b => b.status === 'pending');
    const historyBills = myBills.filter(b => b.status === 'lunas'); 
    const isActive = currentUser.is_fingerprint_active;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-white shadow-sm border-b px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="font-black text-xl flex items-center"><Fingerprint className="mr-2 text-blue-600" /> SmartKos</div>
          <button onClick={logout} className="text-red-600 font-bold flex items-center hover:bg-red-50 px-3 py-2 rounded transition"><LogOut size={18} className="mr-2 hidden md:block"/> Keluar</button>
        </nav>

        <div className="bg-white border-b px-2 md:px-6 flex space-x-2 md:space-x-6 justify-center text-xs md:text-sm font-bold shadow-sm overflow-x-auto">
           <button onClick={() => setView('resident_dashboard')} className={`py-4 px-2 md:px-4 border-b-4 transition ${view === 'resident_dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Beranda</button>
           <button onClick={() => setView('resident_fingerprint')} className={`py-4 px-2 md:px-4 border-b-4 transition ${view === 'resident_fingerprint' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Sidik Jari</button>
           <button onClick={() => setView('resident_history')} className={`py-4 px-2 md:px-4 border-b-4 transition ${view === 'resident_history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Riwayat Pembayaran</button>
           <button onClick={() => setView('resident_profile')} className={`py-4 px-2 md:px-4 border-b-4 transition ${view === 'resident_profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Profil Saya</button>
        </div>

        <div className="max-w-4xl mx-auto p-4 md:p-6 w-full flex-1 space-y-6">
          {view === 'resident_dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <h3 className="text-lg font-bold mb-4 flex items-center border-b pb-3"><CreditCard className="mr-2 text-blue-600"/> Tagihan Sewa Kamar</h3>
                  {pendingBill ? (
                    <div className="text-center pt-4 flex-1 flex flex-col justify-center">
                      <div>
                        <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full text-xs mb-2 inline-block">Belum Lunas</span>
                        <h2 className="text-4xl font-black text-slate-800 my-4">Rp {Number(pendingBill.nominal).toLocaleString('id-ID')}</h2>
                        <p className="text-xs font-mono font-bold text-slate-500 mb-2">Invoice: {pendingBill.ref_id}</p>
                        <p className="text-sm text-slate-500 mb-6">Jatuh Tempo: {formatDueDate25(pendingBill.due_date)}</p>
                        <button onClick={() => handlePayQRIS(pendingBill)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg">Bayar dengan QRIS</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center pt-8 flex-1 flex flex-col justify-center">
                      <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                      <span className="text-green-700 font-black text-xl block">Semua Tagihan Lunas</span>
                      <p className="text-slate-500 mt-2 text-sm">Terima kasih telah membayar tepat waktu.</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <h3 className="text-lg font-bold mb-4 flex items-center border-b pb-3"><DoorOpen className="mr-2 text-blue-600"/> Status Kamar Anda</h3>
                  <div className="pt-4 text-center flex-1 flex flex-col justify-center">
                    {isActive ? (
                      <div className="p-6 bg-green-50 text-green-800 rounded-xl border border-green-200">
                        <CheckCircle size={48} className="mx-auto mb-3 text-green-500"/>
                        <div className="font-black text-lg">KAMAR AKTIF</div>
                        <p className="text-sm mt-2">Masa aktif kamar Anda s/d:<br/><strong>{formatDateSafe(currentUser.active_until)}</strong></p>
                      </div>
                    ) : (
                      <div className="p-6 bg-red-50 text-red-800 rounded-xl border border-red-200">
                        <XCircle size={48} className="mx-auto mb-3 text-red-500"/>
                        <div className="font-black text-lg">AKSES TERKUNCI</div>
                        <p className="text-sm mt-1">Selesaikan pembayaran QRIS terlebih dahulu agar kamar dan sidik jari kembali aktif.</p>
                      </div>
                    )}
                  </div>
                </div>
             </div>
          )}

          {view === 'resident_fingerprint' && (
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-2xl mx-auto">
                <h3 className="text-xl font-black mb-6 flex items-center justify-center border-b pb-4"><Fingerprint className="mr-2 text-blue-600" size={28}/> Akses Sidik Jari Kamar</h3>
                {!isActive ? (
                    <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
                      <XCircle className="mx-auto mb-3 text-red-500" size={40}/>
                      <p className="font-bold">Akses Kamar Terkunci</p>
                      <p className="text-sm mt-2">Tagihan sewa kamar Anda belum lunas. Silakan selesaikan pembayaran di menu Beranda agar akses sidik jari otomatis aktif.</p>
                    </div>
                ) : currentUser.fingerprint_id ? (
                    <div className="p-6">
                       <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                       <h4 className="font-bold text-2xl text-slate-800">Sidik Jari Aktif & Siap Digunakan!</h4>
                       <p className="text-sm mt-4 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 font-medium">
                         Pintu kamar Anda sudah bisa dibuka kapan saja dengan menempelkan jari Anda ke sensor di pintu.
                       </p>
                       
                       <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={handleStartEnrollment}
                            disabled={isLoading}
                            className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-sm shadow-md transition"
                          >
                            <RefreshCcw size={16} className="mr-2" /> Rekam Ulang Jari di Pintu
                          </button>
                          <button
                            onClick={handleResetResidentFp}
                            disabled={isLoading}
                            className="flex items-center justify-center px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition border border-red-200"
                          >
                            <Trash2 size={16} className="mr-2" /> Hapus Akses Jari
                          </button>
                       </div>
                    </div>
                ) : (
                    <div className="p-6 flex flex-col items-center">
                       <Fingerprint size={80} className={`mb-4 ${isScanningFP ? 'text-blue-500 animate-bounce' : 'text-slate-300'}`} />
                       {isScanningFP ? (
                           <div className="w-full max-w-md space-y-4">
                             <div className="bg-gradient-to-b from-blue-50 to-indigo-50 border-2 border-blue-300 p-5 rounded-2xl shadow-sm text-left">
                               <div className="flex justify-between items-center mb-3">
                                 <span className="font-black text-sm text-blue-900 tracking-wide flex items-center">
                                   <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping mr-2"></span>
                                   ALAT SIAGA MEREKAM
                                 </span>
                                 <span className="px-3 py-0.5 bg-blue-600 text-white font-mono font-bold text-xs rounded-full">
                                   {enrollCountdown}s
                                 </span>
                               </div>

                               <div className="space-y-2.5 text-xs text-slate-700 font-medium bg-white/80 p-3 rounded-xl border border-blue-100">
                                 <p className="flex items-start">
                                   <span className="font-bold text-blue-600 mr-2">1.</span>
                                   <span><strong>Tempelkan jari</strong> ke sensor pintu.</span>
                                 </p>
                                 <p className="flex items-start">
                                   <span className="font-bold text-blue-600 mr-2">2.</span>
                                   <span><strong>Angkat jari</strong> Anda dari sensor.</span>
                                 </p>
                                 <p className="flex items-start">
                                   <span className="font-bold text-blue-600 mr-2">3.</span>
                                   <span><strong>Tempelkan lagi jari yang sama</strong> sampai pintu terbuka!</span>
                                 </p>
                               </div>
                             </div>

                             <button
                               onClick={handleCancelEnrollment}
                               className="text-xs text-red-500 hover:text-red-700 font-bold block mx-auto underline pt-1"
                             >
                               Batalkan Perekaman
                             </button>
                           </div>
                       ) : (
                           <div className="w-full max-w-md space-y-4">
                             <p className="text-slate-600 text-sm font-medium">Pilih salah satu cara termudah untuk mengaktifkan sidik jari kamar Anda:</p>
                             
                             <div className="space-y-3">
                               <button 
                                 onClick={handleStartEnrollment} 
                                 disabled={isLoading} 
                                 className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition flex items-center justify-center text-sm"
                               >
                                 <Fingerprint size={18} className="mr-2" /> Mulai Rekam Jari di Pintu Sekarang
                               </button>

                               <button 
                                 onClick={async () => {
                                   try {
                                     setIsLoading(true);
                                     await axios.put('/api/users', {
                                       userId: currentUser.id,
                                       fingerprint_id: currentUser.id.toString(),
                                       is_fingerprint_active: true
                                     });
                                     setCurrentUser({ ...currentUser, fingerprint_id: currentUser.id.toString(), is_fingerprint_active: true });
                                     showToast('Sidik jari Anda berhasil diaktifkan seketika!', 'success');
                                     fetchDashboardData();
                                   } catch(e) {
                                     showToast('Gagal mengaktifkan', 'error');
                                   } finally {
                                     setIsLoading(false);
                                   }
                                 }}
                                 disabled={isLoading} 
                                 className="w-full bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition text-sm flex items-center justify-center border border-slate-200"
                               >
                                 <CheckCircle size={16} className="mr-2 text-green-600" /> Langsung Aktifkan (Sudah Rekam di Alat)
                               </button>
                             </div>
                           </div>
                       )}
                    </div>
                )}
             </div>
          )}

          {view === 'resident_history' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
               <h3 className="text-lg font-bold mb-4 flex items-center border-b pb-3"><FileText className="mr-2 text-blue-600"/> Riwayat Pembayaran Anda</h3>
               {historyBills.length > 0 ? (
                 <div className="overflow-x-auto rounded-lg border border-slate-200">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-slate-100">
                       <tr>
                         <th className="p-4">Bulan Tagihan</th>
                         <th className="p-4">Ref TokoPay (Invoice)</th>
                         <th className="p-4">Metode Bayar</th>
                         <th className="p-4">Nominal</th>
                         <th className="p-4">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {historyBills.map(b => (
                         <tr key={b.id} className="hover:bg-slate-50">
                           <td className="p-4">{b.month}</td>
                           <td className="p-4 font-mono text-xs font-bold text-slate-700">{b.ref_id}</td>
                           <td className="p-4">{renderPaymentBadge(b.payment_method)}</td>
                           <td className="p-4 font-bold text-slate-800">Rp {Number(b.nominal).toLocaleString('id-ID')}</td>
                           <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs shadow-sm">LUNAS</span></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                   Belum ada riwayat pembayaran yang tercatat.
                 </div>
               )}
             </div>
          )}

          {/* VIEW: PROFIL PENGHUNI */}
          {view === 'resident_profile' && (
             <div className="space-y-6 max-w-2xl mx-auto">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                 <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-2xl border-4 border-blue-50 shadow-inner">
                   {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                 </div>
                 <div className="text-center sm:text-left flex-1">
                   <h3 className="font-black text-xl text-slate-800">{currentUser.name}</h3>
                   <p className="text-xs text-slate-400 font-mono">@{currentUser.username}</p>
                   <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2.5">
                     <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                       Kamar {rooms.find(r => r.id === currentUser.room_id)?.number || '-'}
                     </span>
                     {currentUser.is_fingerprint_active ? (
                       <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center">
                         <CheckCircle size={12} className="mr-1" /> Akses Aktif
                       </span>
                     ) : (
                       <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center">
                         <XCircle size={12} className="mr-1" /> Terkunci
                       </span>
                     )}
                   </div>
                 </div>
               </div>

               <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                 <div className="border-b pb-4 mb-6">
                   <h4 className="font-black text-slate-800 text-base flex items-center">
                     <User className="mr-2 text-blue-600" size={18} /> Detail Data Diri Penghuni
                   </h4>
                   <p className="text-xs text-slate-500 mt-1">
                     Perbarui informasi kontak WhatsApp, email, dan alamat tempat tinggal asal Anda.
                   </p>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Nama Lengkap</label>
                     <div className="relative">
                       <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                       <input type="text" name="name" defaultValue={currentUser.name} className="w-full pl-9 p-3 text-sm border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Nomor WhatsApp</label>
                       <div className="relative">
                         <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                         <input type="tel" name="phone" defaultValue={currentUser.phone || ''} placeholder="08123456789" className="w-full pl-9 p-3 text-sm border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Email</label>
                       <div className="relative">
                         <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                         <input type="email" name="email" defaultValue={currentUser.email || ''} placeholder="nama@email.com" className="w-full pl-9 p-3 text-sm border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                       </div>
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Alamat Lengkap (KTP)</label>
                     <div className="relative">
                       <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                       <textarea name="address" defaultValue={currentUser.address || ''} rows={2} placeholder="Alamat asal / KTP" className="w-full pl-9 p-2.5 text-sm border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium" required></textarea>
                     </div>
                   </div>

                   <div className="border-t pt-4">
                     <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Ganti Password (Opsional)</label>
                     <input type="password" name="password" placeholder="Kosongkan jika tidak ingin mengganti password" className="w-full p-3 text-sm border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                     <p className="text-[11px] text-slate-400 mt-1">Isi hanya jika Anda ingin mengubah password login Anda.</p>
                   </div>

                   <div className="pt-2">
                     <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition flex items-center justify-center">
                       <Save size={16} className="mr-2" /> Simpan Perubahan Profil
                     </button>
                   </div>
                 </form>
               </div>
             </div>
          )}
        </div>

        {/* Modal Scan QRIS TokoPay */}
        {paymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
              <h3 className="text-xl font-bold mb-1">Scan QRIS (TokoPay)</h3>
              <p className="text-xs text-blue-600 font-mono font-bold mb-4 bg-blue-50 py-1 rounded-lg">Invoice: {paymentModal.ref_id}</p>
              
              <div className="bg-slate-100 p-2 rounded-xl mb-4 min-h-[250px] flex justify-center items-center border-2 border-dashed border-slate-300">
                 {qrisData ? <img src={qrisData} alt="QRIS" className="w-full rounded-lg" /> : <div className="text-slate-500 font-bold flex flex-col items-center"><Activity className="animate-spin mb-2 text-blue-500" size={32}/> Memproses QR...</div>}
              </div>

              <p className="text-[11px] text-slate-400 mb-3">Dapat dibayar menggunakan GoPay, ShopeePay, OVO, DANA, BCA, Livin, dll.</p>

              <button
                type="button"
                onClick={() => setPaymentModal(null)}
                className="w-full py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Perekaman Sukses */}
        {enrollSuccessModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl border text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle size={44} className="animate-pulse" />
              </div>
              <h3 className="font-black text-slate-800 text-2xl mb-2">Perekaman Sukses!</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Sidik jari Anda berhasil disimpan di sensor fisik pada <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Slot #{enrollSuccessModal.slot_id}</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEnrollSuccessModal(null);
                  setView('resident_dashboard');
                }}
                className="w-full py-3.5 bg-green-600 text-white rounded-xl font-black text-sm hover:bg-green-700 shadow-lg shadow-green-600/30 transition"
              >
                Selesai & Ke Beranda
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
          .print-document-container {
            width: 100% !important;
            display: block !important;
          }
          table {
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #1e293b !important;
          }
        }
      `}</style>

      {view === 'login' || view === 'register' ? renderAuth() : view.startsWith('admin') ? renderAdmin() : renderResident()}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
           <div className={`px-6 py-4 rounded-xl shadow-xl font-bold flex items-center ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
             {toast.type === 'error' ? <XCircle className="mr-3" /> : <CheckCircle className="mr-3 text-green-400" />} {toast.msg}
           </div>
        </div>
      )}
    </div>
  );
}