import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ==========================================
// KOMPONEN IKON SVG (RINGAN & AMAN TANPA CRASH)
// ==========================================
const Icon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  switch (name) {
    case 'trending-up':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
    case 'trending-down':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
    case 'clock':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'home':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case 'door':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z M14 12h.01" /></svg>;
    case 'user':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    case 'phone':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
    case 'plus':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
    case 'edit':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
    case 'trash':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
    case 'logout':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
    case 'fingerprint':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.07 1.003-4.27 1.003-6.552a9.96 9.96 0 00-1.003-4.32" /></svg>;
    case 'receipt':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>;
    case 'settings':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'refresh':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
    default:
      return null;
  }
};

export default function App() {
  // State User & Autentikasi
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', name: '' });

  // Navigasi Utama Admin
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenants' | 'expenses' | 'logs' | 'settings'>('dashboard');
  const [floorFilter, setFloorFilter] = useState<'all' | 'lt2' | 'lt3'>('all');
  const [settingSubTab, setSettingSubTab] = useState<'tokopay' | 'hardware'>('tokopay');

  // State Data Database
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<{ merchantId: string; secretKey: string }>({ merchantId: '', secretKey: '' });

  // State Modal & Aksi
  const [roomModal, setRoomModal] = useState<{ isOpen: boolean; type: 'add' | 'edit'; data: any } | null>(null);
  const [expenseModal, setExpenseModal] = useState(false);
  const [billModal, setBillModal] = useState<any>(null);
  const [enrollModal, setEnrollModal] = useState<{ active: boolean; timeLeft: number } | null>(null);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ambil Data Sesi Login saat Pertama Load
  useEffect(() => {
    const savedUser = localStorage.getItem('smartkos_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  // Fetch Semua Data Terkait
  const fetchData = async () => {
    try {
      const [resRooms, resUsers, resBills, resLogs, resExp] = await Promise.all([
        axios.get('/api/rooms').catch(() => ({ data: [] })),
        axios.get('/api/users').catch(() => ({ data: [] })),
        axios.get('/api/bills').catch(() => ({ data: [] })),
        axios.get('/api/logs').catch(() => ({ data: [] })),
        axios.get('/api/expenses').catch(() => ({ data: [] }))
      ]);
      setRooms(Array.isArray(resRooms.data) ? resRooms.data : []);
      setUsers(Array.isArray(resUsers.data) ? resUsers.data : []);
      setBills(Array.isArray(resBills.data) ? resBills.data : []);
      setLogs(Array.isArray(resLogs.data) ? resLogs.data : []);
      setExpenses(Array.isArray(resExp.data) ? resExp.data : []);
    } catch (e) {
      console.error("Gagal load data:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
  };

  // Format Tanggal Singkat
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // ==========================================
  // LOGIKA PENGURUTAN ALAMI & PEMBAGIAN LANTAI
  // ==========================================
  // Mengurutkan 1, 2, 3 ... 9, 10, 11 secara alami
  const sortedRooms = [...rooms].sort((a, b) => {
    const numA = parseInt((a.number || '').toString().replace(/\D/g, ''), 10);
    const numB = parseInt((b.number || '').toString().replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numA - numB;
    }
    return (a.number || '').toString().localeCompare((b.number || '').toString(), undefined, { numeric: true });
  });

  // Penentuan Lantai: Kamar 1-16 (Lt 2), Kamar 17-19 (Lt 3)
  const getRoomFloor = (r: any): number => {
    const nameLower = (r.name || '').toLowerCase();
    if (nameLower.includes('lt 3') || nameLower.includes('lantai 3')) return 3;
    if (nameLower.includes('lt 2') || nameLower.includes('lantai 2')) return 2;

    const num = parseInt((r.number || '').toString().replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      if ((num >= 17 && num <= 19) || (num >= 301 && num <= 399)) return 3;
      if ((num >= 1 && num <= 16) || (num >= 201 && num <= 299)) return 2;
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

  // Metrik Statistik Dashboard
  const totalPemasukan = bills
    .filter(b => b.status === 'lunas')
    .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

  const totalPengeluaran = expenses
    .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

  const activeResidents = users.filter(u => u.role === 'resident' && u.room_id);
  const lunasCount = activeResidents.filter(u => u.is_fingerprint_active).length;
  const unpaidCount = activeResidents.filter(u => !u.is_fingerprint_active).length;
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const emptyCount = rooms.filter(r => r.status === 'available').length;
  const totalRoomCount = rooms.length || 1;
  const occupancyPercent = Math.round((occupiedCount / totalRoomCount) * 100);

  // ==========================================
  // HANDLERS (LOGIN, KAMAR, PENGELUARAN, ENROLL)
  // ==========================================
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(url, authForm);
      if (res.data.success) {
        if (authMode === 'login') {
          setUser(res.data.user);
          localStorage.setItem('smartkos_user', JSON.stringify(res.data.user));
          showToast(`Selamat datang, ${res.data.user.name}!`, 'success');
        } else {
          showToast('Registrasi berhasil! Silakan masuk.', 'success');
          setAuthMode('login');
        }
      } else {
        showToast(res.data.message || 'Gagal autentikasi', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartkos_user');
    setUser(null);
  };

  // Simpan Kamar Baru / Edit Kamar dengan Pilihan Lantai
  const handleSaveRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const floorVal = (fd.get('floor') as string) || 'Lantai 2';
    let baseName = ((fd.get('name') as string) || '').replace(/\s*-\s*(Lt|Lantai)\s*\d+/gi, '').trim();
    if (!baseName) baseName = 'Standard';
    const finalName = `${baseName} - ${floorVal}`;

    const payload = {
      number: fd.get('number'),
      name: finalName,
      price: parseInt(fd.get('price') as string, 10)
    };

    setIsLoading(true);
    try {
      if (roomModal?.type === 'add') {
        await axios.post('/api/rooms', payload);
        showToast('Kamar baru berhasil ditambahkan', 'success');
      } else if (roomModal?.data?.id) {
        await axios.put(`/api/rooms?id=${roomModal.data.id}`, payload);
        showToast('Data kamar berhasil diperbarui', 'success');
      }
      setRoomModal(null);
      fetchData();
    } catch {
      showToast('Gagal menyimpan kamar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus kamar ini?')) return;
    try {
      await axios.delete(`/api/rooms?id=${id}`);
      showToast('Kamar berhasil dihapus', 'success');
      fetchData();
    } catch {
      showToast('Gagal menghapus kamar', 'error');
    }
  };

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await axios.post('/api/expenses', {
        title: fd.get('title'),
        nominal: parseInt(fd.get('nominal') as string, 10),
        category: fd.get('category'),
        expense_date: fd.get('expense_date')
      });
      showToast('Pengeluaran berhasil dicatat', 'success');
      setExpenseModal(false);
      fetchData();
    } catch {
      showToast('Gagal mencatat pengeluaran', 'error');
    }
  };

  const handleStartEnroll = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await axios.post('/api/users?action=start-enroll', { userId: user.id });
      if (res.data.success) {
        setEnrollModal({ active: true, timeLeft: 60 });
        showToast('Alat siaga! Silakan tempelkan jari ke sensor di pintu.', 'info');
      } else {
        showToast(res.data.message || 'Gagal memulai perekaman', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memulai pendaftaran', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectActivate = async (userId: number) => {
    try {
      await axios.put('/api/users', { userId, is_fingerprint_active: true, fingerprint_id: userId.toString() });
      showToast('Akses sidik jari langsung diaktifkan!', 'success');
      fetchData();
    } catch {
      showToast('Gagal mengaktifkan sidik jari', 'error');
    }
  };

  // ==========================================
  // TAMPILAN JIKA BELUM LOGIN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'}`}>
            {toast.message}
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3">
              <Icon name="door" className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">SmartKos IoT</h1>
            <p className="text-xs text-slate-500 mt-1">Sistem Pintu & Manajemen Kos Terpadu</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="admin atau username Anda"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : authMode === 'login' ? 'Masuk ke Sistem' : 'Daftar Akun Baru'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              {authMode === 'login' ? 'Belum punya akun? Daftar sebagai Penghuni' : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN DASHBOARD PENGELOLA (ADMIN)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col md:flex-row">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigasi */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Icon name="door" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight leading-none text-slate-800">SmartKos</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Sistem IoT</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <Icon name="home" className="w-5 h-5" />
              Dashboard Utama
            </button>

            <button
              onClick={() => setActiveTab('tenants')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'tenants' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <Icon name="user" className="w-5 h-5" />
              Kelola Penyewa
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'expenses' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <Icon name="receipt" className="w-5 h-5" />
              Pengeluaran
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'logs' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <Icon name="clock" className="w-5 h-5" />
              Log Pintu Realtime
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <Icon name="settings" className="w-5 h-5" />
              Pengaturan Terpadu
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between px-2 mb-3">
            <div>
              <p className="font-bold text-xs text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <Icon name="logout" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Konten Halaman */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD UTAMA (DESAIN SAMA PERSIS DENGAN GAMBAR) */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 4 Kartu Metrik di Atas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Kartu 1: Pemasukan (Navy Elegan) */}
              <div className="bg-[#1e293b] text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Pemasukan</span>
                  <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400">
                    <Icon name="trending-up" className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{formatRupiah(totalPemasukan)}</h3>
                  <p className="text-xs text-slate-400 mt-1">{lunasCount} dari {activeResidents.length} penyewa lunas</p>
                </div>
              </div>

              {/* Kartu 2: Pengeluaran */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Pengeluaran</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpenseModal(true)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-md transition"
                      title="Catat Pengeluaran"
                    >
                      + Catat
                    </button>
                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                      <Icon name="trending-down" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatRupiah(totalPengeluaran)}</h3>
                  <p className="text-xs text-slate-500 mt-1">Bulan ini</p>
                </div>
              </div>

              {/* Kartu 3: Belum Lunas */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Belum Lunas</span>
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                    <Icon name="clock" className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{unpaidCount} <span className="text-sm font-semibold text-slate-500">penyewa</span></h3>
                  <p className="text-xs text-slate-500 mt-1">Butuh ditagih</p>
                </div>
              </div>

              {/* Kartu 4: Hunian */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">Hunian</span>
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                    <Icon name="home" className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {occupiedCount}/{rooms.length} <span className="text-sm font-semibold text-slate-500">kamar terisi</span>
                  </h3>
                  <div className="w-full bg-slate-100 rounded-full h-2 my-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${occupancyPercent}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500">{occupancyPercent}% hunian</p>
                </div>
              </div>
            </div>

            {/* Bagian Status Kamar (Denah Visual) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800">Status Kamar</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {rooms.length} kamar · {emptyCount} kosong · {unpaidCount} belum lunas
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Filter Tab Lantai Otomatis & Dinamis */}
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

                  {/* Tombol Tambah Kamar Baru */}
                  <button
                    onClick={() => setRoomModal({ isOpen: true, type: 'add', data: {} })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Tambah Kamar
                  </button>
                </div>
              </div>

              {/* Grid Kartu Kamar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedRooms.map(room => {
                  const resident = users.find(u => u.room_id === room.id && u.role === 'resident');
                  const residentBill = bills.find(b => b.user_id === resident?.id);
                  const isPaid = resident?.is_fingerprint_active;
                  const isOccupied = room.status === 'occupied' && resident;
                  const floorLabel = `Lantai ${getRoomFloor(room)}`;

                  return (
                    <div key={room.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col justify-between">
                      <div>
                        {/* Header Kartu: Ikon, Nomor Kamar & Badge Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                              <Icon name="door" className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-black text-slate-800 text-base leading-none">Kamar {room.number}</h3>
                              <p className="text-[11px] font-semibold text-slate-400 mt-1">{floorLabel}</p>
                            </div>
                          </div>

                          {/* Badge Status Kamar */}
                          {isOccupied ? (
                            isPaid ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                • Lunas
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                • Belum Lunas
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                              • Kosong
                            </span>
                          )}
                        </div>

                        {/* Isi Tengah: Informasi Penyewa ATAU Kotak Kosong */}
                        {isOccupied ? (
                          <div className="space-y-2 my-4 pt-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                              <Icon name="user" className="w-4 h-4 text-slate-400" />
                              <span>{resident.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <Icon name="phone" className="w-3.5 h-3.5 text-slate-400" />
                              <span>{resident.username || 'Tidak ada kontak'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                              <span>Masuk: {formatDate(resident.created_at)}</span>
                              <span>Tempo: {formatDate(residentBill?.due_date)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="my-5 py-4 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400">
                            Kosong
                          </div>
                        )}
                      </div>

                      {/* Footer Kartu: Harga Sewa & Tombol Edit/Hapus */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Sewa / bulan</p>
                          <p className="font-extrabold text-slate-800 text-sm">{formatRupiah(room.price)}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setRoomModal({ isOpen: true, type: 'edit', data: room })}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-xs flex items-center gap-1 transition"
                          >
                            <Icon name="edit" className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Kamar"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
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

        {/* ======================================================== */}
        {/* TAB 2: KELOLA PENYEWA */}
        {/* ======================================================== */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800">Daftar Penyewa Kos</h2>
              <p className="text-xs text-slate-500">Pantau status sewa dan akses sidik jari penghuni</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-3.5">Nama Penyewa</th>
                      <th className="p-3.5">Kamar</th>
                      <th className="p-3.5">Status Sewa</th>
                      <th className="p-3.5">ID Jari di Sensor</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.filter(u => u.role === 'resident').map(res => {
                      const roomObj = rooms.find(r => r.id === res.room_id);
                      return (
                        <tr key={res.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-bold text-slate-800">{res.name} ({res.username})</td>
                          <td className="p-3.5">{roomObj ? `Kamar ${roomObj.number}` : '<Belum Pilih Kamar>'}</td>
                          <td className="p-3.5">
                            {res.is_fingerprint_active ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">Aktif / Lunas</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">Belum Lunas</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">ID #{res.fingerprint_id || '-'}</td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleDirectActivate(res.id)}
                              className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                            >
                              Aktifkan Akses
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

        {/* ======================================================== */}
        {/* TAB 3: PENGELUARAN */}
        {/* ======================================================== */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">Catatan Pengeluaran Kos</h2>
                <p className="text-xs text-slate-500">Kelola biaya listrik, air, wifi, dan perawatan</p>
              </div>
              <button
                onClick={() => setExpenseModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Icon name="plus" className="w-4 h-4" />
                Catat Pengeluaran
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {expenses.length === 0 ? (
                    <tr><td colSpan={4} className="p-5 text-center text-slate-400">Belum ada catatan pengeluaran</td></tr>
                  ) : (
                    expenses.map(exp => (
                      <tr key={exp.id}>
                        <td className="p-3.5 text-slate-500">{formatDate(exp.expense_date)}</td>
                        <td className="p-3.5 font-bold text-slate-800">{exp.title}</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold">{exp.category}</span></td>
                        <td className="p-3.5 text-right font-bold text-rose-600">{formatRupiah(exp.nominal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: LOG PINTU */}
        {/* ======================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">Log Aktivitas Pintu</h2>
                <p className="text-xs text-slate-500">Pantau sensor dan riwayat ketukan pintu realtime</p>
              </div>
              <button
                onClick={fetchData}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Icon name="refresh" className="w-4 h-4" />
                Segarkan
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
              {logs.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">Belum ada riwayat pintu tercatat</p>
              ) : (
                logs.slice(0, 30).map(log => (
                  <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Icon name="door" className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{log.action}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PENGATURAN TERPADU (TOKOPAY + HARDWARE FINGERPRINT) */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800">Pengaturan Terpadu</h2>
              <p className="text-xs text-slate-500">Konfigurasi Pembayaran Otomatis TokoPay & Perangkat Sensor</p>
            </div>

            {/* Sub-tab Pengaturan */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSettingSubTab('tokopay')}
                className={`px-4 py-2 rounded-lg transition ${settingSubTab === 'tokopay' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
              >
                API TokoPay (QRIS)
              </button>
              <button
                onClick={() => setSettingSubTab('hardware')}
                className={`px-4 py-2 rounded-lg transition ${settingSubTab === 'hardware' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
              >
                Perangkat Fingerprint
              </button>
            </div>

            {settingSubTab === 'tokopay' ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-lg space-y-4 shadow-xs">
                <h3 className="font-bold text-sm text-slate-800">Konfigurasi Gateway TokoPay</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Merchant ID TokoPay</label>
                  <input
                    type="text"
                    value={settings.merchantId}
                    onChange={(e) => setSettings({ ...settings, merchantId: e.target.value })}
                    placeholder="Contoh: M240901..."
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Secret Key TokoPay</label>
                  <input
                    type="password"
                    value={settings.secretKey}
                    onChange={(e) => setSettings({ ...settings, secretKey: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
                  />
                </div>
                <button
                  onClick={() => showToast('Pengaturan API TokoPay tersimpan', 'success')}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-800 mb-2">Daftar Pintu & Modul Sensor</h3>
                <p className="text-xs text-slate-500 mb-4">Sistem 1 Hardware Melayani Multi-Kamar (Uji Coba Otomatis)</p>

                <div className="divide-y divide-slate-100 text-xs">
                  {rooms.map(r => (
                    <div key={r.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">Kamar {r.number}</span>
                        <span className="text-slate-400 ml-2 font-mono">({r.device_id || `KAMAR-${r.number}`})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        Siaga / Online
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL TAMBAH / EDIT KAMAR (DENGAN DROPDOWN PILIH LANTAI) */}
      {/* ======================================================== */}
      {roomModal?.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveRoom} className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200">
            <h3 className="font-black text-base mb-4 text-slate-800">
              {roomModal.type === 'add' ? 'Tambah Kamar Baru' : 'Edit Data Kamar'}
            </h3>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nomor Kamar</label>
                <input
                  type="text"
                  name="number"
                  defaultValue={roomModal.data.number || ''}
                  placeholder="Contoh: 1, 2, atau 16"
                  className="w-full p-2.5 text-xs font-bold border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Lantai</label>
                <select
                  name="floor"
                  defaultValue={roomModal.data?.id ? (getRoomFloor(roomModal.data) === 3 ? 'Lantai 3' : 'Lantai 2') : 'Lantai 2'}
                  className="w-full p-2.5 text-xs font-bold border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Lantai 2">Lantai 2 (Kamar 1 - 16)</option>
                  <option value="Lantai 3">Lantai 3 (Kamar 17 - 19)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tipe Kamar</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={(roomModal.data.name || '').replace(/\s*-\s*(Lt|Lantai)\s*\d+/gi, '') || 'Standard'}
                  placeholder="Contoh: Standard AC"
                  className="w-full p-2.5 text-xs border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Harga Sewa / Bulan (Rp)</label>
                <input
                  type="number"
                  name="price"
                  defaultValue={roomModal.data.price || 750000}
                  className="w-full p-2.5 text-xs font-mono font-bold text-blue-600 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRoomModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CATAT PENGELUARAN */}
      {expenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveExpense} className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200">
            <h3 className="font-black text-base mb-4 text-slate-800">Catat Pengeluaran Baru</h3>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Keterangan Pengeluaran</label>
                <input type="text" name="title" required placeholder="Contoh: Beli Token Listrik Utama" className="w-full p-2.5 text-xs border rounded-xl bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nominal (Rp)</label>
                <input type="number" name="nominal" required placeholder="Contoh: 250000" className="w-full p-2.5 text-xs font-mono font-bold border rounded-xl bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
                <select name="category" className="w-full p-2.5 text-xs font-bold border rounded-xl bg-slate-50">
                  <option value="Listrik">Listrik & Air</option>
                  <option value="Internet">WiFi & Internet</option>
                  <option value="Perbaikan">Perbaikan & Alat</option>
                  <option value="Lainnya">Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal</label>
                <input type="date" name="expense_date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 text-xs border rounded-xl bg-slate-50" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setExpenseModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">Batal</button>
              <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}