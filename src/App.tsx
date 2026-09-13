import React, { useState, useEffect } from 'react';
import { 
  Users, DoorOpen, CreditCard, Settings, LogOut, 
  CheckCircle, XCircle, Fingerprint, Activity, FileText, Plus, Edit, Trash2, RefreshCcw, Save, ShieldCheck, History, Cpu, Wifi
} from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [view, setView] = useState('login'); 
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState({ tokopay_merchant_id: '', tokopay_secret_key: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isScanningFP, setIsScanningFP] = useState(false);
  
  const [toast, setToast] = useState<{msg: string, type: string} | null>(null);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [qrisData, setQrisData] = useState<string | null>(null);
  const [roomModal, setRoomModal] = useState<any>(null);
  const [billModal, setBillModal] = useState<any>(null);

  const showToast = (msg: string, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboardData = async (isManual = false) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      if(currentUser.role === 'admin') {
         const [resUsers, resRooms, resBills, resLogs, resSettings] = await Promise.all([
           axios.get('/api/users'), axios.get('/api/rooms'), axios.get('/api/bills'), axios.get('/api/logs'), axios.get('/api/settings')
         ]);
         setUsers(resUsers.data); setRooms(resRooms.data); setBills(resBills.data); setLogs(resLogs.data); setSettings(resSettings.data);
         if (isManual) showToast('Data berhasil diperbarui', 'success');
      } else {
         const [resRooms, resBills] = await Promise.all([axios.get('/api/rooms'), axios.get('/api/bills')]);
         setRooms(resRooms.data); setBills(resBills.data);
         
         const myBill = resBills.data.find((b: any) => b.user_id === currentUser.id);
         if (!myBill && currentUser.active_until === null && currentUser.room_id) {
             setCurrentUser({...currentUser, room_id: null});
             showToast('Waktu pembayaran habis (10 Menit). Kamar dibatalkan otomatis.', 'error');
         } else if (isManual) {
             showToast('Data berhasil diperbarui', 'success');
         }
      }
    } catch (error) {
      showToast('Gagal memuat data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'login' && view !== 'register') fetchDashboardData();
  }, [view]);

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
    try {
      const response = await axios.post('/api/auth/register', { 
        name: e.target.name.value, username: e.target.username.value, password: e.target.password.value 
      });
      if (response.data.success) {
        showToast('Pendaftaran berhasil! Silakan login.', 'success');
        setView('login');
      } else { showToast(response.data.message, 'error'); }
    } catch (error) { showToast('Gagal mendaftar akun.', 'error'); } 
    finally { setIsLoading(false); }
  };

  const logout = () => { setCurrentUser(null); setView('login'); };

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
    if(!window.confirm('Yakin hapus kamar ini?')) return;
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
    if(!window.confirm('Yakin ingin menghapus riwayat pembayaran lunas ini secara manual?')) return;
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
      const response = await axios.post('/api/users/choose-room', { userId: currentUser.id, roomId });
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

  const handleRegisterFingerprint = async () => {
    setIsScanningFP(true);
    setTimeout(async () => {
      try {
        const response = await axios.post('/api/users/fingerprint', { userId: currentUser.id });
        if(response.data.success) {
           setCurrentUser({...currentUser, fingerprint_id: response.data.fingerprint_id});
           showToast(response.data.message, 'success');
        } else {
           showToast(response.data.message, 'error');
        }
      } catch (error) { showToast('Gagal terhubung dengan mesin pintu.', 'error'); }
      finally { setIsScanningFP(false); }
    }, 3000); 
  };

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
            <input type="text" name="username" placeholder="Username" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="password" name="password" placeholder="Password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow hover:bg-blue-700">Login</button>
            <p className="text-center text-sm text-slate-600 mt-4">Belum punya kamar? <button type="button" onClick={() => setView('register')} className="text-blue-600 font-bold hover:underline">Daftar Baru</button></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" name="name" placeholder="Nama Lengkap" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="text" name="username" placeholder="Username Baru" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="password" name="password" placeholder="Password Baru" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold shadow hover:bg-green-700">Daftar Akun</button>
            <p className="text-center text-sm text-slate-600 mt-4">Sudah punya akun? <button type="button" onClick={() => setView('login')} className="text-blue-600 font-bold hover:underline">Login</button></p>
          </form>
        )}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <Fingerprint className="text-blue-400" size={28} />
          <span className="font-bold text-xl">AdminKos</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
          {[
            { id: 'admin_dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'admin_users', icon: Users, label: 'Data Penghuni' },
            { id: 'admin_rooms', icon: DoorOpen, label: 'Kelola Kamar' },
            { id: 'admin_bills', icon: CreditCard, label: 'Tagihan & Keuangan' },
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
        <div className="p-4"><button onClick={logout} className="w-full flex items-center p-3 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition"><LogOut size={18} className="mr-3" /> Keluar</button></div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Manajemen Kos</h2>
          <button onClick={() => fetchDashboardData(true)} className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-bold"><RefreshCcw size={16} className={`mr-2 ${isLoading && 'animate-spin'}`}/> Segarkan Data</button>
        </div>

        {view === 'admin_dashboard' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
             <h3 className="font-bold mb-6 text-lg">Peta Kamar</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rooms.map(room => (
                  <div key={room.id} className={`p-4 rounded-lg border-2 ${room.status === 'available' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                     <div className="flex justify-between items-center mb-2"><span className="font-bold text-xl">{room.number}</span><span className={`text-xs px-2 py-1 rounded font-bold ${room.status === 'available' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{room.status.toUpperCase()}</span></div>
                     <p className="text-sm font-medium text-slate-600">{room.name}</p>
                     <p className="text-xs mt-2 text-slate-500">HW Sidik Jari: <span className={room.fingerprint_status ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{room.fingerprint_status ? 'AKTIF' : 'NONAKTIF'}</span></p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'admin_users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-bold mb-6 text-lg">Data Penghuni Aktif</h3>
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b"><tr><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Kamar</th><th className="p-4">Aktif Sampai</th><th className="p-4">Status Sidik Jari</th></tr></thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold">{u.name}</td><td className="p-4 text-slate-500">{u.username}</td>
                      <td className="p-4">{rooms.find(r => r.id === u.room_id)?.number || 'Belum Pilih'}</td>
                      <td className="p-4">{u.active_until ? new Date(u.active_until).toLocaleDateString() : '-'}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.is_fingerprint_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_fingerprint_active ? 'TERDAFTAR' : 'TERKUNCI'}</span></td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        )}

        {view === 'admin_rooms' && (
          <div className="space-y-4">
            <button onClick={() => setRoomModal({ type: 'add', data: {} })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center mb-4"><Plus size={16} className="mr-2" /> Tambah Kamar Baru</button>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
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
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4 text-sm text-yellow-800">
               <span className="font-bold">Info Sistem:</span> Tagihan otomatis mengunci sidik jari penghuni jika belum lunas &gt; 7 hari dari tanggal rilis. User baru yg tidak bayar dalam 10 menit otomatis dibatalkan.
            </div>
            <button onClick={handleGenerateBills} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center mb-4"><Plus size={16} className="mr-2" /> Generate Tagihan Bulan Ini</button>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
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
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg flex items-center"><History className="mr-2 text-blue-600"/> Riwayat Pembayaran (Lunas)</h3>
               <p className="text-sm text-slate-500">Pencatatan 6 bulan terakhir</p>
            </div>
            <table className="w-full text-left text-sm">
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
                  {bills.filter(b => b.status === 'lunas').length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">Belum ada riwayat pembayaran yang lunas.</td></tr>
                  )}
                </tbody>
            </table>
          </div>
        )}

        {view === 'admin_devices' && (
          <div className="space-y-4">
             <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4 text-sm text-blue-800 flex items-start">
               <Wifi className="mr-3 mt-0.5 flex-shrink-0"/> 
               <div><strong className="block mb-1">Manajemen Perangkat IoT Pintu</strong> Hubungkan alat Fingerprint (ESP32/Arduino) ke sistem dengan memasukkan IP Address atau ID Perangkat (MAC Address) yang terpasang di masing-masing pintu kamar.</div>
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
                           <input type="text" name="device_id" defaultValue={r.device_id || ''} placeholder="Ex: 192.168.1.10" className="flex-1 p-2 text-sm border rounded bg-slate-50 outline-none focus:border-blue-400" />
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
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <h3 className="font-bold text-lg flex items-center"><FileText className="mr-2 text-blue-600"/> Log Buka Pintu (Fingerprint)</h3>
               <div className="flex gap-2 items-center">
                 <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-2 rounded-lg font-medium">Log &gt; 7 Hari terhapus otomatis</span>
                 <button onClick={handleClearLogs} className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center shadow-sm"><Trash2 size={14} className="mr-1"/> Kosongkan Log</button>
               </div>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b"><tr><th className="p-4">Waktu</th><th className="p-4">User</th><th className="p-4">Aksi / Pesan Sistem</th></tr></thead>
                <tbody className="divide-y">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-4 whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                      <td className="p-4 font-bold">{users.find(u => u.id === l.user_id)?.name || 'Unknown'}</td>
                      <td className="p-4 text-slate-600">{l.action}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-500">Tidak ada log yang tersimpan.</td></tr>
                  )}
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
                <p className="text-xs text-red-500 font-bold mb-4 bg-red-50 p-3 rounded">PENTING: Pastikan URL di bawah ini dimasukkan ke Pengaturan "Webhook / Callback" di Dashboard TokoPay kamu:<br/><br/><span className="font-mono bg-white border border-red-200 px-2 py-1 rounded text-red-700">https://smart-kos-two.vercel.app/api/payment/callback</span></p>
                <button type="submit" className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold flex items-center hover:bg-slate-900"><Save size={18} className="mr-2"/> Simpan Konfigurasi</button>
              </div>
            </form>

            <div className="pt-6 border-t border-slate-200">
               <h4 className="font-bold mb-2">Uji Coba Sistem Pembayaran</h4>
               <p className="text-sm text-slate-600 mb-4">Klik tombol di bawah ini untuk memastikan sistem berhasil membuat QRIS dari TokoPay.</p>
               <button onClick={handleTestTokoPay} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow hover:bg-green-700 transition">
                  <Activity size={18} className="mr-2"/> Test Koneksi TokoPay
               </button>
            </div>
          </div>
        )}

        {roomModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSaveRoom} className="bg-white p-6 rounded-xl w-full max-w-sm">
              <h3 className="font-bold text-lg mb-4">{roomModal.type === 'add' ? 'Tambah Kamar' : 'Edit Kamar'}</h3>
              <input type="text" name="number" defaultValue={roomModal.data.number} placeholder="Nomor Kamar (ex: A1)" className="w-full p-2 border rounded mb-3" required />
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
        <div className="min-h-screen bg-slate-100 p-8">
          <nav className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border">
             <div className="font-black text-xl flex items-center"><Fingerprint className="mr-2 text-blue-600" /> SmartKos</div>
             <button onClick={logout} className="text-red-600 font-bold flex items-center hover:bg-red-50 px-3 py-2 rounded transition"><LogOut size={16} className="mr-2"/> Keluar Akun</button>
          </nav>
          <div className="max-w-4xl mx-auto">
             <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border text-center">
               <h2 className="text-2xl font-black mb-2">Selamat Datang, {currentUser.name}!</h2>
               <p className="text-slate-600">Silakan pilih kamar kosong di bawah ini untuk mulai menyewa.</p>
               <p className="text-sm text-red-500 font-bold mt-2 bg-red-50 inline-block px-3 py-1 rounded">*Kamar yang tidak dibayar dalam 10 Menit akan dibatalkan otomatis.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {rooms.filter(r => r.status === 'available').map(room => (
                 <div key={room.id} className="bg-white p-6 rounded-xl shadow border border-slate-200 text-center hover:border-blue-400 transition">
                   <h3 className="text-3xl font-black text-slate-800 mb-2">{room.number}</h3>
                   <p className="text-sm text-slate-500 mb-4">{room.name}</p>
                   <p className="text-xl font-bold text-blue-600 mb-6">Rp {room.price.toLocaleString()}/bln</p>
                   <button onClick={() => handleChooseRoom(room.id)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow hover:bg-blue-700">Pilih Kamar Ini</button>
                 </div>
               ))}
               {rooms.filter(r => r.status === 'available').length === 0 && (
                 <div className="col-span-3 text-center p-8 text-slate-500 bg-white rounded-xl border">Maaf, saat ini tidak ada kamar kosong yang tersedia.</div>
               )}
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
        <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="font-black text-xl flex items-center"><Fingerprint className="mr-2 text-blue-600" /> SmartKos</div>
          <button onClick={logout} className="text-red-600 font-bold flex items-center hover:bg-red-50 px-3 py-2 rounded transition"><LogOut size={18} className="mr-2"/> Keluar</button>
        </nav>

        <div className="bg-white border-b px-6 flex space-x-2 md:space-x-6 justify-center text-sm font-bold shadow-sm">
           <button onClick={() => setView('resident_dashboard')} className={`py-4 px-2 md:px-4 border-b-4 transition ${view === 'resident_dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Beranda</button>
           <button onClick={() => setView('resident_fingerprint')} className={`py-4 px-2 md:px-4 border-b-4 transition ${view === 'resident_fingerprint' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Sidik Jari</button>
           <button onClick={() => setView('resident_history')} className={`py-4 px-2 md:px-4 border-b-4 transition ${view === 'resident_history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Riwayat Pembayaran</button>
        </div>

        <div className="max-w-4xl mx-auto p-6 w-full flex-1 space-y-6">
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
                      <div>
                        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                        <span className="text-green-700 font-black text-xl block">Semua Tagihan Lunas</span>
                        <p className="text-slate-500 mt-2 text-sm">Terima kasih telah membayar tepat waktu.</p>
                      </div>
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
                <h3 className="text-xl font-black mb-6 flex items-center justify-center border-b pb-4"><Fingerprint className="mr-2 text-blue-600" size={28}/> Pendaftaran Sidik Jari</h3>
                {!isActive ? (
                    <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
                      <XCircle className="mx-auto mb-3 text-red-500" size={40}/>
                      <p className="font-bold">Akses Ditolak</p>
                      <p className="text-sm mt-2">Anda belum bisa mendaftar sidik jari. Silakan lunasi tagihan sewa kamar Anda terlebih dahulu pada menu Beranda.</p>
                    </div>
                ) : currentUser.fingerprint_id ? (
                    <div className="p-6">
                       <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                       <h4 className="font-bold text-2xl text-slate-800">Sidik Jari Terdaftar</h4>
                       <p className="text-slate-500 mt-2">ID Sensor Anda: <span className="font-mono bg-slate-100 p-2 rounded text-slate-800 font-bold">{currentUser.fingerprint_id}</span></p>
                       <p className="text-sm mt-6 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 font-medium">Anda sudah bisa membuka pintu kamar menggunakan sidik jari Anda.</p>
                    </div>
                ) : (
                    <div className="p-6 flex flex-col items-center">
                       <Fingerprint size={80} className={`mb-6 ${isScanningFP ? 'text-blue-500 animate-pulse' : 'text-slate-300'}`} />
                       {isScanningFP ? (
                           <div className="text-blue-600">
                             <p className="font-bold text-lg mb-2">Memindai...</p>
                             <p className="text-sm">Tahan jari Anda pada sensor pintu kamar.</p>
                           </div>
                       ) : (
                           <>
                             <p className="text-slate-600 mb-8 font-medium">Letakkan jari Anda pada sensor mesin di pintu kamar untuk mendaftarkan akses masuk.</p>
                             <button onClick={handleRegisterFingerprint} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition transform">Mulai Pindai Sidik Jari</button>
                           </>
                       )}
                    </div>
                )}
             </div>
          )}

          {view === 'resident_history' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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
              <div className="bg-slate-100 p-2 rounded-xl mb-6 min-h-[250px] flex justify-center items-center border-2 border-dashed border-slate-300">
                 {qrisData ? <img src={qrisData} alt="QRIS" className="w-full rounded-lg" /> : <div className="text-slate-500 font-bold flex flex-col items-center"><Activity className="animate-spin mb-2"/> Memproses QR...</div>}
              </div>
              <p className="text-xs text-slate-500 mb-4 bg-yellow-50 p-2 rounded border border-yellow-200">Akses sidik jari dan kamar akan otomatis aktif setelah pembayaran berhasil.</p>
              <button onClick={() => {setPaymentModal(null); fetchDashboardData(true);}} className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-bold hover:bg-slate-300">Tutup & Cek Status</button>
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