import React, { useState, useEffect } from 'react';
import { 
  Home, Users, DoorOpen, CreditCard, Settings, LogOut, 
  CheckCircle, XCircle, Fingerprint, Activity, FileText, Bell, Plus, Edit, Trash2, RefreshCcw 
} from 'lucide-react';
import axios from 'axios';

// Ini adalah antarmuka untuk Typescript. Jika error, ganti ekstensi file menjadi App.jsx
export default function App() {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [toast, setToast] = useState<any>(null);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [qrisData, setQrisData] = useState<any>(null);
  const [roomModal, setRoomModal] = useState<any>(null);
  const [billModal, setBillModal] = useState<any>(null);

  const showToast = (msg: string, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Pastikan endpoint ini nanti mengarah ke Vercel Serverless Function Anda
      const [resUsers, resRooms, resBills, resLogs] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/rooms'),
        axios.get('/api/bills'),
        axios.get('/api/logs')
      ]);
      
      setUsers(resUsers.data || []);
      setRooms(resRooms.data || []);
      setBills(resBills.data || []);
      setLogs(resLogs.data || []);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data dari server. (Mode Vercel: Pastikan API aktif)', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'login') fetchDashboardData();
  }, [view]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
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
      showToast('Koneksi ke server gagal. (Apakah Anda sudah setup backend?)', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setView('login');
  };

  const handleSaveRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
       number: fd.get('number'),
       name: fd.get('name'),
       price: parseInt(fd.get('price') as string, 10)
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

  const handleDeleteRoom = async (id: number) => {
    if(!window.confirm("Yakin hapus kamar ini?")) return;
    try {
      await axios.delete(`/api/rooms/${id}`);
      showToast('Kamar dihapus', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal menghapus kamar. Pastikan kosong.', 'error');
    }
  };

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

  const handleSaveBill = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const fd = new FormData(e.currentTarget);
     const nominal = parseInt(fd.get('nominal') as string, 10);
     try {
       await axios.put(`/api/bills/${billModal.id}`, { nominal });
       showToast('Tagihan berhasil diupdate', 'success');
       setBillModal(null);
       fetchDashboardData();
     } catch (error) {
       showToast('Gagal update tagihan', 'error');
     }
  };

  const handleChooseRoom = async (roomId: number) => {
    try {
      await axios.post('/api/users/choose-room', { userId: currentUser.id, roomId });
      showToast('Berhasil menyewa kamar! Silakan cek tagihan Anda.', 'success');
      setCurrentUser({ ...currentUser, roomId });
      fetchDashboardData();
    } catch (error) {
      showToast('Gagal memilih kamar', 'error');
    }
  };

  const handlePayQRIS = async (bill: any) => {
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

  // --- RENDERING ---
  const renderLogin = () => (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full text-white mb-4"><Fingerprint size={32} /></div>
          <h1 className="text-2xl font-bold text-slate-800">SmartKos System</h1>
          <p className="text-slate-500 text-sm mt-2 text-center">Login untuk mencoba (Pastikan API Vercel sudah aktif)</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input type="text" name="username" className="w-full p-3 border border-slate-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" name="password" className="w-full p-3 border border-slate-300 rounded-lg" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <Fingerprint className="text-blue-400" />
          <span className="font-bold text-xl">AdminKos</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setView('admin_dashboard')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Activity size={20} /> <span>Dashboard</span></button>
          <button onClick={() => setView('admin_rooms')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_rooms' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><DoorOpen size={20} /> <span>Data Kamar</span></button>
          <button onClick={() => setView('admin_bills')} className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${view === 'admin_bills' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><CreditCard size={20} /> <span>Tagihan</span></button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition">
            <LogOut size={20} /> <span>Keluar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Kos (Vercel Build)</h2>
          <button onClick={fetchDashboardData} className="flex items-center text-blue-600 hover:text-blue-800">
            <RefreshCcw size={18} className="mr-2"/> Segarkan Data
          </button>
        </header>

        {isLoading && <div className="p-4 bg-blue-50 text-blue-700 rounded-lg mb-6 animate-pulse">Menghubungi Server...</div>}

        {view === 'admin_dashboard' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><Activity className="mr-2 text-slate-500" size={20}/> Peta Kamar (Real-time)</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {rooms.map(room => (
                  <div key={room.id} className={`p-4 rounded-lg border-2 ${room.status === 'available' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                     <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">{room.number}</span>
                        {room.status === 'available' ? (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">KOSONG</span>
                        ) : (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-bold">TERISI</span>
                        )}
                     </div>
                     <p className="text-sm text-slate-600 truncate">{room.name}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'admin_rooms' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setRoomModal({ type: 'add', data: {} })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center">
                <Plus size={18} className="mr-2" /> Tambah Kamar
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4">Nomor</th>
                    <th className="p-4">Nama Kamar</th>
                    <th className="p-4">Harga/Bulan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td className="p-4 font-bold">{room.number}</td>
                      <td className="p-4">{room.name}</td>
                      <td className="p-4">Rp {room.price.toLocaleString('id-ID')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {room.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 flex space-x-2">
                        <button onClick={() => setRoomModal({ type: 'edit', data: room })} className="text-blue-600 p-2"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteRoom(room.id)} className="text-red-600 p-2"><Trash2 size={16} /></button>
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
            <div className="flex justify-end">
              <button onClick={handleGenerateBills} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center">
                <Plus size={18} className="mr-2" /> Buat Tagihan Otomatis
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4">ID Ref</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Jatuh Tempo</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bills.map(bill => (
                    <tr key={bill.id}>
                      <td className="p-4 text-sm font-mono">{bill.ref_id}</td>
                      <td className="p-4 text-sm">Rp {bill.nominal.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-sm">{bill.due_date}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {bill.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <button onClick={() => setBillModal(bill)} className="text-blue-600"><Edit size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResidentDashboard = () => {
    if (!currentUser.room_id) {
      return (
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="flex justify-between mb-8 max-w-5xl mx-auto">
             <h2 className="text-3xl font-bold">Pilih Kamar Anda</h2>
             <button onClick={logout} className="text-red-600">Keluar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {rooms.filter(r => r.status === 'available').map(room => (
              <div key={room.id} className="bg-white p-6 rounded-xl shadow border text-center">
                <h3 className="text-2xl font-black mb-2">{room.number}</h3>
                <p className="text-slate-600 mb-4">{room.name}</p>
                <p className="text-xl font-bold text-blue-600 mb-6">Rp {room.price.toLocaleString()}/bln</p>
                <button onClick={() => handleChooseRoom(room.id)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Pilih Kamar Ini</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const myBills = bills.filter(b => b.user_id === currentUser.id);
    const pendingBill = myBills.find(b => b.status === 'pending');
    
    // Status akses fingerprint (berdasarkan db)
    const isActive = currentUser.is_fingerprint_active === 1 || currentUser.is_fingerprint_active === true;

    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-xl flex items-center"><Fingerprint className="mr-2 text-blue-600" /> SmartKos</div>
          <button onClick={logout} className="text-red-600 flex items-center"><LogOut size={18} className="mr-2"/> Keluar</button>
        </nav>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold mb-4 flex items-center"><DoorOpen className="mr-2"/> Akses Kamar & Solenoid</h3>
              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-slate-500">Masa Aktif</span>
                  <span className={`font-medium ${!isActive ? 'text-red-600' : 'text-green-600'}`}>{currentUser.active_until || '-'}</span>
                </div>
                <div className="pt-4 text-center">
                  {isActive ? (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200">AKSES AKTIF - BISA SCAN SIDIK JARI</div>
                  ) : (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg font-bold border border-red-200">AKSES TERKUNCI - HARAP LUNASI TAGIHAN (LEWAT 7 HARI)</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold mb-4 flex items-center"><CreditCard className="mr-2"/> Tagihan Bulan Ini</h3>
              {pendingBill ? (
                <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-red-600 font-bold mb-1">Tagihan Belum Lunas</span>
                  <h2 className="text-4xl font-bold text-slate-800 my-4">Rp {pendingBill.nominal.toLocaleString()}</h2>
                  <button onClick={() => handlePayQRIS(pendingBill)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Bayar via QRIS</button>
                </div>
              ) : (
                <div className="text-center p-4 bg-green-50 border border-green-100 rounded-xl">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <span className="text-green-700 font-bold">Semua Tagihan Lunas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-slate-800 relative">
      {view === 'login' && renderLogin()}
      {view.startsWith('admin') && renderAdminDashboard()}
      {view.startsWith('resident') && renderResidentDashboard()}

      {paymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold mb-2">Scan QRIS (Tokopay)</h3>
            <p className="text-sm text-slate-500 mb-4">Ref: {paymentModal.ref_id}</p>
            
            <div className="bg-slate-100 p-4 rounded-lg mb-6 min-h-[200px] flex justify-center items-center border">
               {qrisData ? (
                  <img src={qrisData} alt="QRIS Code" className="w-full h-auto" />
               ) : (
                  <span className="text-slate-400">Memuat QR dari Server...</span>
               )}
            </div>
            
            <button onClick={() => setPaymentModal(null)} className="w-full bg-slate-200 text-slate-700 py-3 rounded-lg font-bold">Tutup</button>
          </div>
        </div>
      )}

      {/* Modal Edit Kamar */}
      {roomModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{roomModal.type === 'add' ? 'Tambah Kamar' : 'Edit Kamar'}</h3>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nomor Kamar</label>
                <input type="text" name="number" defaultValue={roomModal.data.number} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama Kamar</label>
                <input type="text" name="name" defaultValue={roomModal.data.name} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                <input type="number" name="price" defaultValue={roomModal.data.price} className="w-full p-2 border rounded" required />
              </div>
              <div className="flex space-x-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded">Simpan</button>
                <button type="button" onClick={() => setRoomModal(null)} className="flex-1 bg-slate-200 p-2 rounded">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Tagihan */}
      {billModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Edit Tagihan (Manual)</h3>
            <form onSubmit={handleSaveBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nominal Baru (Rp)</label>
                <input type="number" name="nominal" defaultValue={billModal.nominal} className="w-full p-2 border rounded" required />
              </div>
              <div className="flex space-x-2 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded">Simpan</button>
                <button type="button" onClick={() => setBillModal(null)} className="flex-1 bg-slate-200 p-2 rounded">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg">
          {toast.msg}
        </div>
      )}
    </div>
  );
}