import React, { useState, useEffect } from 'react';
import { 
  Home, Users, DoorOpen, CreditCard, Settings, LogOut, 
  CheckCircle, XCircle, Fingerprint, Activity, FileText, Bell, Plus, Edit, Trash2, RefreshCcw 
} from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Database State
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bills, setBills] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI State
  const [toast, setToast] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [qrisData, setQrisData] = useState(null);
  const [roomModal, setRoomModal] = useState(null);
  const [billModal, setBillModal] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [resUsers, resRooms, resBills, resLogs] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/rooms'),
        axios.get('/api/bills'),
        axios.get('/api/logs')
      ]);
      
      setUsers(resUsers.data);
      setRooms(resRooms.data);
      setBills(resBills.data);
      setLogs(resLogs.data);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data dari database Vercel Postgres.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'login') fetchDashboardData();
  }, [view]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      if (response.data.success) {
        const user = response.data.user;
        setCurrentUser(user);
        setView(user.role === 'admin' ? 'admin_dashboard' : 'resident_dashboard');
        showToast(`Selamat datang, ${user.name}`, 'success');
      } else {
        showToast(response.data.message || 'Login gagal', 'error');
      }
    } catch (error) {
      showToast('Koneksi ke server gagal. Pastikan API berjalan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setView('login');
  };

  // Fungsi Kamar
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
       number: fd.get('number'),
       name: fd.get('name'),
       price: parseInt(fd.get('price'), 10)
    };
    setIsLoading(true);
    try {
      if (roomModal.type === 'add') {
         await axios.post('/api/rooms', payload);
         showToast('Kamar berhasil ditambahkan', 'success');
      } else {
         await axios.put(`/api/rooms/${roomModal.data.id}`, payload);
         showToast('Kamar berhasil diupdate', 'success');
      }
      setRoomModal(null);
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal menyimpan kamar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`/api/rooms/${id}`);
      showToast('Kamar dihapus', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal menghapus kamar. Pastikan kosong.', 'error');
    }
  };

  // Fungsi Penghuni
  const handleChooseRoom = async (roomId) => {
    try {
      await axios.post('/api/users/choose-room', { userId: currentUser.id, roomId });
      showToast('Berhasil menyewa kamar! Silakan cek tagihan Anda.', 'success');
      setCurrentUser({ ...currentUser, roomId });
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal memilih kamar', 'error');
    }
  };

  // Fungsi Tagihan
  const handleGenerateBills = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/bills/generate-monthly');
      showToast(response.data.message, 'success');
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal membuat tagihan otomatis', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayQRIS = async (bill) => {
    setPaymentModal(bill);
    setQrisData(null);
    try {
      const response = await axios.post('/api/payment/request-qris', {
        refId: bill.ref_id,
        nominal: bill.nominal
      });
      if (response.data.success) {
        setQrisData(response.data.qris_url);
      } else {
        showToast('Gagal men-generate QRIS', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan koneksi API Payment', 'error');
    }
  };

  // Tampilan Login
  const renderLogin = () => (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full text-white mb-4 shadow-md"><Fingerprint size={36} /></div>
          <h1 className="text-2xl font-black text-slate-800">SmartKos System</h1>
          <p className="text-slate-500 text-sm mt-1">Sistem Manajemen Kos Pintar & QRIS</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input type="text" name="username" placeholder="Masukkan username..." className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            {isLoading ? 'Memproses...' : 'Masuk Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );

  // Tampilan Dashboard Admin
  const renderAdminDashboard = () => (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Admin Kiri */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <Fingerprint className="text-blue-400" size={28} />
          <span className="font-bold text-xl">AdminKos</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* MENU 1: DASHBOARD */}
          <button onClick={() => setView('admin_dashboard')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_dashboard' ? 'bg-blue-600 font-bold shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Activity size={20} /> <span>Dashboard</span>
          </button>
          
          {/* MENU 2: DATA PENGHUNI (BARU DITAMBAHKAN) */}
          <button onClick={() => setView('admin_users')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_users' ? 'bg-blue-600 font-bold shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Users size={20} /> <span>Data Penghuni</span>
          </button>
          
          {/* MENU 3: DATA KAMAR */}
          <button onClick={() => setView('admin_rooms')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_rooms' ? 'bg-blue-600 font-bold shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}>
            <DoorOpen size={20} /> <span>Data Kamar</span>
          </button>
          
          {/* MENU 4: TAGIHAN */}
          <button onClick={() => setView('admin_bills')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_bills' ? 'bg-blue-600 font-bold shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}>
            <CreditCard size={20} /> <span>Tagihan QRIS</span>
          </button>
          
          {/* MENU 5: LOG AKSES (BARU DITAMBAHKAN) */}
          <button onClick={() => setView('admin_logs')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_logs' ? 'bg-blue-600 font-bold shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}>
            <FileText size={20} /> <span>Log Akses Pintu</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition text-slate-300 hover:text-white">
            <LogOut size={20} /> <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Konten Kanan */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {view === 'admin_dashboard' && 'Dashboard Overview'}
            {view === 'admin_users' && 'Manajemen Data Penghuni'}
            {view === 'admin_rooms' && 'Manajemen Data Kamar'}
            {view === 'admin_bills' && 'Manajemen Pembayaran & Tagihan'}
            {view === 'admin_logs' && 'Catatan Log Akses Pintu'}
          </h2>
          <button onClick={fetchDashboardData} className="flex items-center text-blue-600 hover:text-blue-800 font-medium px-4 py-2 bg-blue-50 rounded-lg transition">
            <RefreshCcw size={18} className="mr-2"/> Segarkan Data
          </button>
        </header>

        {isLoading && <div className="p-4 bg-blue-50 text-blue-700 rounded-lg mb-6 animate-pulse font-bold flex items-center"><Activity className="animate-spin mr-2"/> Sinkronisasi dengan Database Vercel...</div>}

        {/* --- TAMPILAN: DASHBOARD OVERVIEW --- */}
        {view === 'admin_dashboard' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><Activity className="mr-2 text-slate-500" size={20}/> Peta Kamar (Real-time)</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rooms.map(room => (
                  <div key={room.id} className={`p-5 rounded-xl border-2 transition ${room.status === 'available' ? 'border-green-200 bg-green-50 hover:bg-green-100' : 'border-red-200 bg-red-50 hover:bg-red-100'}`}>
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-2xl text-slate-800">{room.number}</span>
                        {room.status === 'available' ? (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">KOSONG</span>
                        ) : (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-bold">TERISI</span>
                        )}
                     </div>
                     <p className="text-sm text-slate-600 font-medium truncate">{room.name}</p>
                     <p className="text-xs text-slate-500 mt-2">Rp {room.price.toLocaleString('id-ID')}/bln</p>
                  </div>
                ))}
                {rooms.length === 0 && <div className="col-span-4 p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">Belum ada data kamar dibuat.</div>}
             </div>
          </div>
        )}

        {/* --- TAMPILAN: DATA PENGHUNI (BARU) --- */}
        {view === 'admin_users' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold text-slate-700">Username</th>
                    <th className="p-4 font-bold text-slate-700">Nama Lengkap</th>
                    <th className="p-4 font-bold text-slate-700">Kamar Terpilih</th>
                    <th className="p-4 font-bold text-slate-700">Status Sidik Jari</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono text-sm text-slate-600">{u.username}</td>
                      <td className="p-4 font-bold text-slate-800">{u.name}</td>
                      <td className="p-4">
                        {u.room_id ? (
                           <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">Kamar {u.room_id}</span>
                        ) : (
                           <span className="text-slate-400 text-sm italic">Belum Pilih Kamar</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.is_fingerprint_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {u.is_fingerprint_active ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada data penghuni yang mendaftar.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAMPILAN: DATA KAMAR --- */}
        {view === 'admin_rooms' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setRoomModal({ type: 'add', data: {} })} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center hover:bg-blue-700 transition shadow-sm">
                <Plus size={18} className="mr-2" /> Tambah Kamar Baru
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold text-slate-700">Nomor Kamar</th>
                    <th className="p-4 font-bold text-slate-700">Tipe/Nama Kamar</th>
                    <th className="p-4 font-bold text-slate-700">Harga/Bulan</th>
                    <th className="p-4 font-bold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rooms.map(room => (
                    <tr key={room.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-black text-lg text-slate-800">{room.number}</td>
                      <td className="p-4 font-medium text-slate-600">{room.name}</td>
                      <td className="p-4 font-bold text-blue-600">Rp {room.price.toLocaleString('id-ID')}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {room.status === 'available' ? 'KOSONG' : 'TERISI'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {rooms.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada data kamar dibuat.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAMPILAN: TAGIHAN --- */}
        {view === 'admin_bills' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={handleGenerateBills} className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center hover:bg-green-700 transition shadow-sm">
                <Plus size={18} className="mr-2" /> Generate Tagihan Bulan Ini
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold text-slate-700">ID Referensi</th>
                    <th className="p-4 font-bold text-slate-700">ID Penghuni</th>
                    <th className="p-4 font-bold text-slate-700">Nominal Tagihan</th>
                    <th className="p-4 font-bold text-slate-700">Jatuh Tempo</th>
                    <th className="p-4 font-bold text-slate-700">Status Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bills.map(bill => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-xs font-mono text-slate-500">{bill.ref_id}</td>
                      <td className="p-4 text-sm font-bold text-slate-700">User #{bill.user_id}</td>
                      <td className="p-4 text-sm font-bold text-red-600">Rp {bill.nominal.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-sm font-medium text-slate-600">{bill.due_date}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${bill.status === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {bill.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bills.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada tagihan yang dibuat.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAMPILAN: LOG AKSES (BARU) --- */}
        {view === 'admin_logs' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
               <p className="text-sm text-slate-500 flex items-center"><Bell size={16} className="mr-2"/> Log pintu otomatis terhapus setelah 7 hari oleh database.</p>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-700">Waktu & Tanggal</th>
                  <th className="p-4 font-bold text-slate-700">ID User / Penghuni</th>
                  <th className="p-4 font-bold text-slate-700">Keterangan Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-sm text-slate-600 font-medium">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">User #{log.user_id}</td>
                    <td className="p-4 text-sm text-blue-600 font-medium">{log.action}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada catatan aktivitas buka pintu.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="font-sans text-slate-800 relative bg-slate-100 min-h-screen">
      {view === 'login' && renderLogin()}
      {view.startsWith('admin') && renderAdminDashboard()}

      {/* Toast Notifikasi (Pesan Pop up di bawah) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
           <div className={`px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
             {toast.type === 'error' ? <XCircle className="mr-3" /> : <CheckCircle className="mr-3 text-green-400" />}
             {toast.msg}
           </div>
        </div>
      )}
    </div>
  );
}