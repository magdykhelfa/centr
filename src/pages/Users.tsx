import { useState, useEffect, useCallback } from 'react'; import { Plus, Search, Shield, Edit, Trash2, Mail, Key, X, Info, Wifi, WifiOff } from 'lucide-react'; import { toast } from 'sonner';

export default function Users() {
  // القاعدة الثابتة: سحب الـ IP المركزي
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  const [users, setUsers] = useState<any[]>([]); const [searchTerm, setSearchTerm] = useState(''); const [selectedRole, setSelectedRole] = useState('all'); const [isModalOpen, setIsModalOpen] = useState(false); const [currentUser, setCurrentUser] = useState<any>(null); const [isNet, setIsNet] = useState(false);

  const syncUsers = useCallback(async (dataToPost?: any) => { 
    try { 
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 1500); 
      if (dataToPost) { 
        await fetch(`${BASE_URL}/update`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ...JSON.parse(localStorage.getItem('full_db') || '{}'), users: dataToPost }) 
        }); 
      } 
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal }); 
      clearTimeout(t); 
      if (res.ok) { 
        const full = await res.json(); 
        const serverUsers = full.users || [];
        setUsers(serverUsers); 
        localStorage.setItem('lawyer_users', JSON.stringify(serverUsers)); 
        localStorage.setItem('full_db', JSON.stringify(full));
        setIsNet(true); 
      } 
    } catch (e) { setIsNet(false); } 
  }, [BASE_URL]);

  useEffect(() => { 
    const saved = JSON.parse(localStorage.getItem('lawyer_users') || '[]'); 
    if (saved.length === 0) { 
      const initial = [{ id: 1, name: 'admin', email: 'admin@law.com', phone: '01000', role: 'admin', status: 'active', password: '123' }]; 
      localStorage.setItem('lawyer_users', JSON.stringify(initial)); 
      setUsers(initial); 
    } else setUsers(saved); 
    syncUsers(); 
    const interval = setInterval(() => syncUsers(), 10000); 
    return () => clearInterval(interval); 
  }, [syncUsers]);

  const saveUser = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    const formData = new FormData(e.currentTarget); 
    const userData = { id: currentUser?.id || Date.now(), name: formData.get('name'), email: formData.get('email'), phone: formData.get('phone'), role: formData.get('role'), status: formData.get('status'), password: formData.get('password') || '123' }; 
    const updated = currentUser ? users.map(u => u.id === currentUser.id ? userData : u) : [...users, userData]; 
    setUsers(updated); 
    localStorage.setItem('lawyer_users', JSON.stringify(updated)); 
    await syncUsers(updated); 
    toast.success('تم الحفظ ومزامنة الصلاحيات على الشبكة'); 
    closeModal(); 
  };

  const closeModal = () => { setIsModalOpen(false); setCurrentUser(null); };

  const deleteUser = async (id: number) => { 
    if (id === 1) return toast.error('لا يمكن حذف المدير الرئيسي'); 
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم منعه من الدخول فوراً')) { 
      const updated = users.filter(u => u.id !== id); 
      setUsers(updated); 
      localStorage.setItem('lawyer_users', JSON.stringify(updated)); 
      await syncUsers(updated); 
      toast.error('تم الحذف بنجاح'); 
    } 
  };

  const filteredUsers = users.filter(u => (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())) && (selectedRole === 'all' || u.role === selectedRole));

  return (
    <div className="space-y-6 text-right font-arabic" dir="rtl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-navy-dark flex items-center gap-2">
            إدارة الفريق {isNet ? <Wifi className="w-5 h-5 text-green-500 animate-pulse" /> : <WifiOff className="w-5 h-5 text-slate-300" />}
          </h1>
          <p className="text-sm text-muted-foreground font-bold">{isNet ? `متصل بالقاعدة المركزية: ${currentIp}` : 'وضع الأوفلاين - التعديلات محلية فقط'}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-amber-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-slate-900 hover:scale-105 transition-all shadow-md"><Plus className="w-5 h-5" /> إضافة موظف جديد</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border-b-4 border-amber-500 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10"><Shield className="w-20 h-20" /></div>
            <h3 className="font-bold flex items-center gap-2 mb-4 text-sm relative z-10"><Info className="w-4 h-4 text-amber-500" /> دليل الصلاحيات الذكي</h3>
            <div className="space-y-3 text-[10px] relative z-10">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5"><p className="text-amber-500 font-black">المدير (Admin):</p><p className="text-slate-300">تحكم كامل في السيستم والمالية.</p></div>
              <div className="p-2 bg-white/5 rounded-lg border border-white/5"><p className="text-blue-400 font-black">المحامي (Lawyer):</p><p className="text-slate-300">إدارة القضايا والعملاء والجلسات.</p></div>
              <div className="p-2 bg-white/5 rounded-lg border border-white/5"><p className="text-green-400 font-black">السكرتير (Secretary):</p><p className="text-slate-300">إضافة عملاء، مواعيد، وتنبيهات.</p></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
            <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="بحث باسم الموظف..." className="w-full pr-9 p-2.5 border rounded-xl text-xs font-bold bg-slate-50 focus:bg-white transition-all outline-none focus:border-amber-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <select className="w-full p-2.5 border rounded-xl text-xs font-black bg-slate-50 outline-none cursor-pointer" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}><option value="all">كل الرتب</option><option value="admin">مدير</option><option value="lawyer">محامي</option><option value="secretary">سكرتير</option></select>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
          {filteredUsers.map((user) => (
            <div key={user.id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all group ${user.status === 'inactive' ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all">{user.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800">{user.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${user.role === 'admin' ? 'bg-red-50 text-red-600' : user.role === 'lawyer' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{user.role.toUpperCase()}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">{user.status === 'active' ? 'متصل/نشط' : 'معطل'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteUser(user.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex items-center justify-between text-[11px] font-black">
                <div className="flex items-center gap-1.5 text-slate-400"><Key className="w-3.5 h-3.5 text-amber-500" /> <span className="tracking-widest">****</span> ( {user.password} )</div>
                <div className="text-slate-300 font-mono">{user.phone || 'بدون هاتف'}</div>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 font-bold text-slate-400">لا يوجد موظفين بهذا الاسم</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-t-8 border-amber-500">
            <div className="bg-slate-50 p-5 flex justify-between items-center border-b">
               <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-amber-500" /><h2 className="font-black text-slate-800">{currentUser ? 'تحديث صلاحيات الموظف' : 'تسجيل موظف جديد'}</h2></div>
               <button onClick={closeModal} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveUser} className="p-8 space-y-5 text-right">
              <div className="space-y-1"><label className="text-xs font-black text-slate-500 mr-1">الاسم الكامل</label><input name="name" defaultValue={currentUser?.name} required className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-amber-500 outline-none transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 mr-1">البريد الإلكتروني</label><input name="email" type="email" defaultValue={currentUser?.email} className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-amber-500 outline-none" /></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 mr-1">رقم الهاتف</label><input name="phone" defaultValue={currentUser?.phone} className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-amber-500 outline-none" /></div>
              </div>
              <div className="space-y-1"><label className="text-xs font-black text-amber-600 mr-1">كلمة المرور للدخول</label><input name="password" defaultValue={currentUser?.password || '123'} required className="w-full p-4 border-2 border-amber-200 bg-amber-50/30 rounded-2xl font-black text-center text-lg tracking-widest focus:border-amber-500 outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 mr-1">الرتبة / الصلاحية</label><select name="role" defaultValue={currentUser?.role || 'lawyer'} className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-amber-500 outline-none cursor-pointer"><option value="admin">مدير (Admin)</option><option value="lawyer">محامي (Lawyer)</option><option value="secretary">سكرتير (Secretary)</option></select></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-500 mr-1">حالة الحساب</label><select name="status" defaultValue={currentUser?.status || 'active'} className="w-full p-3 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-amber-500 outline-none cursor-pointer"><option value="active">نشط (Active)</option><option value="inactive">معطل (Inactive)</option></select></div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-amber-500 transition-all shadow-lg active:scale-95 mt-2">حفظ ومزامنة الصلاحيات</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}