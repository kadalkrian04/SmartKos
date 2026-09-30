import React, { useState, useEffect } from 'react';
import { 
  Users, DoorOpen, CreditCard, Settings, LogOut, 
  CheckCircle, XCircle, Fingerprint, Activity, FileText, Plus, Edit, Trash2, RefreshCcw, 
  Save, ShieldCheck, History, Cpu, Wifi, TrendingUp, TrendingDown, AlertCircle, 
  Home, Calendar, UserCheck, Receipt, DollarSign, ChevronRight, Phone, Clock
} from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('smartkos_user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  
  const [view, setView] = useState(() => {
    return localStorage.getItem('smartkos_view') || 'login';
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
  const [userFpModal, setUserFpModal] = useState<any>(null);
  const [residentEditFpModal, setResidentEditFpModal] = useState(false);
  const [confirmResetFpModal, setConfirmResetFpModal] = useState(false);
  const [enrollSuccessModal, setEnrollSuccessModal] = useState<any>(null);
  const [floorFilter, setFloorFilter] = useState<'all' | 'lt2' | 'lt3'>('all');

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

  const fetchDashboardData = async (isManual = false) => {
    if (!currentUser) return;
    setIsLoading(true);
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
             showToast('Waktu pembayaran habis (10 Menit). Kamar dibatalkan otomatis.', 'error');
         } else if (isManual) {
             showToast('Data berhasil diperbarui', 'success');
         }
      }
    } catch (error) {
      showToast('Gagal memuat data dari server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'login' && view !== 'register') fetchDashboardData();
  }, [view]);

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
            showToast('🎉 Pembayaran Berhasil! Akses Kamar & Sidik Jari telah aktif.', 'success');
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
    const newUsername = e.target.username.value;
    try {
      const response = await axios.post('/api/auth/register', { 
        name: e.target.name.value, username: newUsername, password: e.target.password.value 
      });
      if (response.data.success) {
        setLastRegUsername(newUsername);
        showToast('Pendaftaran berhasil! Silakan login.', 'success');
        setView('login');
      } else { showToast(response.data.message, 'error'); }
    } catch (error) { showToast('Gagal mendaftar akun.', 'error'); } 
    finally { setIsLoading(false); }
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
    if(!window.confirm('Yakin hapus kamar ini? Pastikan tidak ada penghuni!')) return;
    try {
      await axios.delete(`/api/rooms?id=${id}`);
      showToast('Kamar dihapus', 'success'); fetchDashboardData();
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Gagal menghapus kamar', 'error'); 
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
    if(!window.confirm('Yakin ingin menghapus riwayat pembayaran ini?')) return;
    try {
      await axios.delete(`/api/bills?id=${id}`);
      showToast('Riwayat berhasil dihapus', 'success'); 
      fetchDashboardData();
    } catch (error) { showToast('Gagal menghapus riwayat', 'error'); }
  };

  const handleClearLogs = async () => {
    if(!window.confirm('Yakin ingin menghapus SEMUA catatan log pintu?')) return;
    setIsLoading(true);
    try {
      await axios.delete('/api/logs');
      showToast('Semua log berhasil dibersihkan', 'success');
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
    if (!window.confirm('Hapus catatan pengeluaran ini?')) return;
    try {
      await axios.delete(`/api/expenses?id=${id}`);
      showToast('Pengeluaran dihapus', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Gagal menghapus', 'error');
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
        showToast('Kamar dipesan! Segera lunasi dalam waktu 10 Menit.', 'success');
        setCurrentUser({ ...currentUser, room_id: roomId }); fetchDashboardData();
      } else { showToast(response.data.message, 'error'); }
    } catch (error) { showToast('Gagal memproses kamar. Coba lagi.', 'error'); }
  };

  const handleGenerateBills = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/bills'); showToast('Tagihan otomatis dibuat', 'success'); fetchDashboardData();
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
    if(!window.confirm('TokoPay Error? Yakin ingin menandai tagihan ini LUNAS secara manual?')) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/bills?id=${billId}`, { action: 'set_lunas', user_id: userId });
      showToast('Tagihan dilunasi manual! Akses kamar aktif.', 'success');
      fetchDashboardData();
    } catch (error) { showToast('Gagal set lunas tagihan', 'error'); }
    finally { setIsLoading(false); }
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
      setConfirmResetFpModal(false);
      showToast('Sidik jari berhasil direset. Silakan daftarkan jari baru.', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal menghapus sidik jari', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // PERHITUNGAN STATISTIK DASHBOARD
  // =========================================================================
  const totalPemasukan = bills
    .filter(b => b.status === 'lunas')
    .reduce((sum, b) => sum + (Number(b.nominal) || 0), 0);

  const totalPengeluaran = expenses
    .reduce((sum, e) => sum + (Number(e.nominal) || 0), 0);

  const labaBersih = totalPemasukan - totalPengeluaran;

  // Hitung jumlah penyewa yang belum lunas
  const unpaidTenantsSet = new Set(
    bills.filter(b => b.status === 'pending').map(b => b.user_id)
  );
  const totalBelumLunas = unpaidTenantsSet.size;

  // Persentase hunian kamar
  const totalKamarCount = rooms.length || 1;
  const kamarTerisiCount = rooms.filter(r => r.status === 'occupied').length;
  const kamarKosongCount = rooms.filter(r => r.status === 'available').length;
  const occupancyPercent = Math.round((kamarTerisiCount / totalKamarCount) * 100);

  // Pembagian Denah Kamar: Lantai 2 (16 Kamar) & Lantai 3 (3 Kamar)
  const roomsLantai2 = rooms.filter(r => {
    const num = parseInt(r.number.replace(/\D/g, ''), 10);
    const nameLower = (r.name || '').toLowerCase();
    if (nameLower.includes('lt 2') || nameLower.includes('lantai 2')) return true;
    if (nameLower.includes('lt 3') || nameLower.includes('lantai 3')) return false;
    return (num >= 201 && num <= 216) || num <= 16;
  });

  const roomsLantai3 = rooms.filter(r => !roomsLantai2.includes(r));

  // Daftar kamar yang ditampilkan sesuai tab aktif
  const displayedRooms = floorFilter === 'lt2' 
    ? roomsLantai2 
    : floorFilter === 'lt3' 
      ? roomsLantai3 
      : rooms;

  const totalTenantsWithRooms = users.filter(u => u.role === 'resident' && u.room_id).length;
  const totalLunasCount = Math.max(0, totalTenantsWithRooms - totalBelumLunas);

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
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" name="name" placeholder="Nama Lengkap" autoComplete="name" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="text" name="username" placeholder="Username Baru" autoComplete="username" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="password" name="password" placeholder="Password Baru" autoComplete="new-password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold shadow hover:bg-green-700">Daftar Akun</button>
            <p className="text-center text-sm text-slate-600 mt-4">Sudah punya akun? <button type="button" onClick={() => { setView('login'); setLastRegUsername(''); }} className="text-blue-600 font-bold hover:underline">Login</button></p>
          </form>
        )}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <Fingerprint className="text-blue-400" size={28} />
          <span className="font-bold text-xl">AdminKos</span>
        </div>
        {}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
          {[
            { id: 'admin_dashboard', icon: Activity, label: 'Dashboard Utama' },
            { id: 'admin_users', icon: Users, label: 'Data Penghuni' },
            { id: 'admin_bills', icon: CreditCard, label: 'Tagihan & Keuangan' },
            { id: 'admin_expenses', icon: Receipt, label: 'Buku Pengeluaran' },
            { id: 'admin_history', icon: History, label: 'Riwayat Transaksi' },
            { id: 'admin_devices', icon: Cpu, label: 'Koneksi Fingerprint' },
            { id: 'admin_logs', icon: FileText, label: 'Log Pintu' },
            { id: 'admin_settings', icon: Settings, label: 'API & Sistem' }
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === item.id ? 'bg-blue-600 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}>
              <item.icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={logout} className="w-full flex items-center p-3 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition"><LogOut size={18} className="mr-3" /> Keluar</button></div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-black text-slate-800">Dashboard Manajemen SmartKos</h2>
            <p className="text-xs text-slate-500">Monitoring Hunian, Akses Pintu Biometrik & Arus Kas</p>
          </div>
          <button onClick={() => fetchDashboardData(true)} className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-bold text-sm">
            <RefreshCcw size={16} className={`mr-2 ${isLoading && 'animate-spin'}`}/> Segarkan
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD UTAMA DENGAN 5 METRIK DAN DENAH LANTAI 2 & 3 */}
        {/* ========================================================================= */}
        {view === 'admin_dashboard' && (
          <div className="space-y-6">
            {/* 4 KARTU STATISTIK UTAMA (PERSIS SEPERTI GAMBAR CONTOH) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. KARTU PEMASUKAN (Warna Biru Navy Gelap) */}
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

              {/* 2. KARTU PENGELUARAN */}
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

              {/* 3. KARTU BELUM LUNAS */}
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

              {/* 4. KARTU HUNIAN */}
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

            {/* ===================================================================== */}
            {/* HEADER STATUS KAMAR & TOMBOL TAMBAH KAMAR */}
            {/* ===================================================================== */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Status Kamar</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {rooms.length} kamar · {kamarKosongCount} kosong · {totalBelumLunas} belum lunas
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Filter Lantai */}
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button 
                      onClick={() => setFloorFilter('all')} 
                      className={`px-3 py-1.5 rounded-lg transition ${floorFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Semua ({rooms.length})
                    </button>
                    <button 
                      onClick={() => setFloorFilter('lt2')} 
                      className={`px-3 py-1.5 rounded-lg transition ${floorFilter === 'lt2' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Lt 2 (16)
                    </button>
                    <button 
                      onClick={() => setFloorFilter('lt3')} 
                      className={`px-3 py-1.5 rounded-lg transition ${floorFilter === 'lt3' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Lt 3 (3)
                    </button>
                  </div>

                  {/* Tombol Tambah Kamar Menonjol */}
                  <button 
                    onClick={() => setRoomModal({ type: 'add', data: {} })} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center shadow-md shadow-blue-600/20 transition"
                  >
                    <Plus size={15} className="mr-1.5" /> Tambah Kamar
                  </button>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* GRID DENAH STATUS KAMAR (PERSIS DENGAN KARTU PADA GAMBAR) */}
              {/* ===================================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedRooms.map(room => {
                  const resident = users.find(u => u.room_id === room.id && u.role === 'resident');
                  const residentBill = bills.find(b => b.user_id === resident?.id);
                  const isPaid = resident?.is_fingerprint_active;
                  const isOccupied = room.status === 'occupied' && resident;

                  // Tentukan lantai otomatis
                  const numOnly = parseInt(room.number.replace(/\D/g, ''), 10);
                  const floorLabel = (numOnly >= 301 || (room.name || '').toLowerCase().includes('lt 3') || (room.name || '').toLowerCase().includes('lantai 3'))
                    ? 'Lantai 3'
                    : 'Lantai 2';

                  // Format tanggal masuk & jatuh tempo
                  const masukDateStr = resident?.created_at 
                    ? new Date(resident.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '-';
                  
                  const dueRaw = residentBill?.due_date || resident?.active_until;
                  const dueDateStr = dueRaw 
                    ? new Date(dueRaw).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '-';

                  return (
                    <div 
                      key={room.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between"
                    >
                      {/* Bagian Atas: Nomor Kamar, Lantai & Badge Status */}
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

                          {/* Badge Status (Belum Lunas / Lunas / Kosong) */}
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

                        {/* Bagian Tengah: Detail Penghuni / Kotak Kosong */}
                        {isOccupied ? (
                          <div className="space-y-1.5 my-3 text-xs">
                            <div className="flex items-center text-slate-700 font-semibold truncate">
                              <UserCheck size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{resident.name}</span>
                            </div>
                            <div className="flex items-center text-slate-500 font-normal">
                              <Phone size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                              <span>{resident.username ? `@${resident.username}` : '-'}</span>
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

                      {/* Bagian Bawah: Sewa / bulan, Harga & Aksi Edit/Hapus */}
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 font-medium block">Sewa / bulan</span>
                          <span className="font-black text-slate-800 text-sm">
                            Rp {room.price.toLocaleString('id-ID')}
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

                {/* Tampilan bantuan jika belum ada kamar di database */}
                {displayedRooms.length === 0 && (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center col-span-full">
                    <DoorOpen className="mx-auto text-slate-300 mb-2" size={44} />
                    <h4 className="font-bold text-slate-700 text-sm mb-1">Belum Ada Kamar yang Tersedia</h4>
                    <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                      Kamar belum terdaftar di database Neon. Klik tombol di bawah untuk menambah kamar perdana.
                    </p>
                    <button 
                      onClick={() => setRoomModal({ type: 'add', data: {} })} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center shadow-md transition"
                    >
                      <Plus size={14} className="mr-1.5" /> Tambah Kamar Baru
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: BUKU PENGELUARAN KOS */}
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
                      <td className="p-4 text-slate-500">{new Date(exp.expense_date || exp.created_at).toLocaleDateString('id-ID')}</td>
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

        {view === 'admin_users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
            <h3 className="font-bold mb-6 text-lg">Data Penghuni Aktif</h3>
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

        {view === 'admin_rooms' && (
          <div className="space-y-4">
            <button onClick={() => setRoomModal({ type: 'add', data: {} })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center mb-4"><Plus size={16} className="mr-2" /> Tambah Kamar Baru</button>
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 border-b"><tr><th className="p-4">No. Kamar</th><th className="p-4">Nama</th><th className="p-4">Harga (Rp)</th><th className="p-4">Status</th><th className="p-4">HW Fingerprint</th><th className="p-4">Aksi</th></tr></thead>
                <tbody className="divide-y">
                  {rooms.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold">{r.number}</td><td className="p-4">{r.name}</td><td className="p-4 text-blue-600 font-bold">{r.price.toLocaleString()}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span></td>
                      <td className="p-4">
                        <button onClick={() => handleToggleRoomFingerprint(r.id, r.fingerprint_status)} className={`px-3 py-1 text-xs font-bold rounded-full ${r.fingerprint_status ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                          {r.fingerprint_status ? 'NYALA' : 'MATI'}
                        </button>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => setRoomModal({ type: 'edit', data: r })} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                        <button onClick={() => handleDeleteRoom(r.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'admin_bills' && (
          <div className="space-y-4">
            <button onClick={handleGenerateBills} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center mb-4"><Plus size={16} className="mr-2" /> Generate Tagihan Bulan Ini</button>
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 border-b"><tr><th className="p-4">ID User</th><th className="p-4">Ref TokoPay</th><th className="p-4">Nominal</th><th className="p-4">Status</th><th className="p-4">Jatuh Tempo</th><th className="p-4">Aksi</th></tr></thead>
                <tbody className="divide-y">
                  {bills.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold">{users.find(u => u.id === b.user_id)?.name || `User #${b.user_id}`}</td><td className="p-4 font-mono text-xs">{b.ref_id}</td>
                      <td className="p-4 font-bold text-red-600">Rp {b.nominal.toLocaleString()}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span></td>
                      <td className="p-4">{new Date(b.due_date).toLocaleDateString()}</td>
                      <td className="p-4 flex gap-2">
                        {b.status === 'pending' && (
                           <>
                             <button onClick={() => handleSetLunasManual(b.id, b.user_id)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded border border-green-200 text-xs font-bold">Set Lunas (Manual)</button>
                             <button onClick={() => setBillModal(b)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded border border-blue-200 text-xs font-bold">Edit Nominal</button>
                           </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'admin_history' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center"><History className="mr-2 text-blue-600"/> Riwayat Pembayaran (Lunas)</h3>
               <p className="text-sm text-slate-500">Pencatatan transaksi lunas</p>
            </div>
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 border-b"><tr><th className="p-4">Tanggal Tagihan</th><th className="p-4">Penghuni</th><th className="p-4">Ref ID</th><th className="p-4">Nominal</th><th className="p-4">Aksi</th></tr></thead>
                <tbody className="divide-y">
                  {bills.filter(b => b.status === 'lunas').map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-4">{new Date(b.created_at || b.due_date).toLocaleDateString()}</td>
                      <td className="p-4 font-bold">{users.find(u => u.id === b.user_id)?.name || `User #${b.user_id}`}</td>
                      <td className="p-4 font-mono text-xs text-slate-500">{b.ref_id}</td>
                      <td className="p-4 font-bold text-green-600">Rp {b.nominal.toLocaleString()}</td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteHistory(b.id)} className="text-red-600 hover:bg-red-50 p-2 rounded flex items-center text-xs font-bold"><Trash2 size={14} className="mr-1"/> Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}

        {view === 'admin_devices' && (
          <div className="space-y-4">
             <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4 text-sm text-blue-800 flex items-start">
               <Wifi className="mr-3 mt-0.5 flex-shrink-0"/> 
               <div><strong className="block mb-1">Manajemen Perangkat IoT Pintu</strong> Hubungkan alat Fingerprint ke sistem dengan memasukkan Device ID kamar.</div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(r => (
                   <div key={r.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                      <div className="flex justify-between items-center mb-4 border-b pb-4">
                         <div>
                           <h4 className="font-black text-xl text-slate-800">{r.number}</h4>
                           <span className="text-xs text-slate-500">{r.name}</span>
                         </div>
                         <Cpu size={32} className={r.device_id ? 'text-green-500' : 'text-slate-300'} />
                      </div>
                      
                      <div className="flex-1">
                         <label className="text-xs font-bold text-slate-600 block mb-2">Device ID / IP Address</label>
                         <form onSubmit={(e: any) => { e.preventDefault(); handleSaveDevice(r.id, e.target.device_id.value); }} className="flex gap-2">
                           <input type="text" name="device_id" defaultValue={r.device_id || ''} placeholder="Ex: KAMAR-201" className="flex-1 p-2 text-sm border rounded bg-slate-50 outline-none focus:border-blue-400" />
                           <button type="submit" className="bg-slate-800 text-white px-3 py-2 rounded text-sm font-bold hover:bg-slate-900 transition">Save</button>
                         </form>
                      </div>

                      <div className="mt-4 pt-4 border-t text-xs flex justify-between items-center">
                         <span className="font-bold text-slate-500">Status Hardware:</span>
                         <span className={`px-2 py-1 rounded font-bold ${r.fingerprint_status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {r.fingerprint_status ? 'ONLINE' : 'OFFLINE'}
                         </span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

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

        {view === 'admin_settings' && (
          <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-6 flex items-center"><ShieldCheck className="mr-2 text-blue-600"/> Konfigurasi API TokoPay (QRIS)</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Merchant ID</label>
                <input type="text" name="merchant_id" defaultValue={settings.tokopay_merchant_id} className="w-full p-3 border rounded-lg bg-slate-50" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Secret Key</label>
                <input type="password" name="secret_key" defaultValue={settings.tokopay_secret_key} className="w-full p-3 border rounded-lg bg-slate-50" required />
              </div>
              <div className="pt-4">
                <button type="submit" className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold flex items-center hover:bg-slate-900"><Save size={18} className="mr-2"/> Simpan Konfigurasi</button>
              </div>
            </form>
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

        {roomModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveRoom} className="bg-white p-6 rounded-xl w-full max-w-sm">
              <h3 className="font-bold text-lg mb-4">{roomModal.type === 'add' ? 'Tambah Kamar' : 'Edit Kamar'}</h3>
              <input type="text" name="number" defaultValue={roomModal.data.number} placeholder="Nomor Kamar (ex: 201)" className="w-full p-2 border rounded mb-3" required />
              <input type="text" name="name" defaultValue={roomModal.data.name} placeholder="Nama Tipe Kamar" className="w-full p-2 border rounded mb-3" required />
              <input type="number" name="price" defaultValue={roomModal.data.price} placeholder="Harga Sewa / Bulan" className="w-full p-2 border rounded mb-4" required />
              <div className="flex gap-2"><button type="button" onClick={() => setRoomModal(null)} className="flex-1 p-2 bg-slate-200 rounded font-bold">Batal</button><button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded font-bold">Simpan</button></div>
            </form>
          </div>
        )}
        
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
               {rooms.filter(r => r.status === 'available').map(room => (
                 <div key={room.id} className="bg-white p-6 rounded-xl shadow border border-slate-200 text-center hover:border-blue-400 transition">
                   <h3 className="text-3xl font-black text-slate-800 mb-2">{room.number}</h3>
                   <p className="text-sm text-slate-500 mb-4">{room.name}</p>
                   <p className="text-xl font-bold text-blue-600 mb-6">Rp {room.price.toLocaleString()}/bln</p>
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
                        <h2 className="text-4xl font-black text-slate-800 my-4">Rp {pendingBill.nominal.toLocaleString()}</h2>
                        <p className="text-sm text-slate-500 mb-6">Jatuh Tempo: {new Date(pendingBill.due_date).toLocaleDateString()}</p>
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
                        <p className="text-sm mt-2">Masa aktif kamar Anda s/d:<br/><strong>{new Date(currentUser.active_until).toLocaleDateString()}</strong></p>
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
                     <thead className="bg-slate-100"><tr><th className="p-4">Bulan Tagihan</th><th className="p-4">Ref ID</th><th className="p-4">Nominal</th><th className="p-4">Status</th></tr></thead>
                     <tbody className="divide-y divide-slate-100">
                       {historyBills.map(b => (
                         <tr key={b.id} className="hover:bg-slate-50">
                           <td className="p-4">{b.month}</td>
                           <td className="p-4 font-mono text-xs text-slate-500">{b.ref_id}</td>
                           <td className="p-4 font-bold text-slate-800">Rp {b.nominal.toLocaleString()}</td>
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
        </div>

        {paymentModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
              <h3 className="text-xl font-bold mb-1">Scan QRIS (TokoPay)</h3>
              <p className="text-xs text-slate-500 font-mono mb-4">Ref: {paymentModal.ref_id}</p>
              
              <div className="bg-slate-100 p-2 rounded-xl mb-4 min-h-[250px] flex justify-center items-center border-2 border-dashed border-slate-300">
                 {qrisData ? <img src={qrisData} alt="QRIS" className="w-full rounded-lg" /> : <div className="text-slate-500 font-bold flex flex-col items-center"><Activity className="animate-spin mb-2 text-blue-500" size={32}/> Memproses QR...</div>}
              </div>

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
      {view === 'login' || view === 'register' ? renderAuth() : view.startsWith('admin') ? renderAdmin() : renderResident()}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
           <div className={`px-6 py-4 rounded-xl shadow-xl font-bold flex items-center ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
             {toast.type === 'error' ? <XCircle className="mr-3" /> : <CheckCircle className="mr-3 text-green-400" />} {toast.msg}
           </div>
        </div>
      )}
    </div>
  );
}