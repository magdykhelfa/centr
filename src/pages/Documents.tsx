import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Search, Folder, FileText, Image, File, Download, Trash2, Eye, Grid, List, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Documents() {
  // القاعدة الثابتة: سحب الـ IP المركزي
  const currentIp = localStorage.getItem('server_ip') || '192.168.1.5';
  const BASE_URL = `http://${currentIp}:3000`;

  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('جميع الأنواع');
  const [isNet, setIsNet] = useState(false);
  const [docs, setDocs] = useState(() => { const saved = localStorage.getItem('lawyer_docs'); return saved ? JSON.parse(saved) : []; });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // وظيفة المزامنة المركزية للمستندات
  const syncDocs = useCallback(async (dataToPost?: any) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3000); // وقت أطول شوية للمستندات
      if (dataToPost) {
        await fetch(`${BASE_URL}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...JSON.parse(localStorage.getItem('full_db') || '{}'), docs: dataToPost })
        });
      }
      const res = await fetch(`${BASE_URL}/sync`, { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) {
        const full = await res.json();
        setDocs(full.docs || []);
        localStorage.setItem('lawyer_docs', JSON.stringify(full.docs || []));
        localStorage.setItem('full_db', JSON.stringify(full));
        setIsNet(true);
      }
    } catch { setIsNet(false); }
  }, [BASE_URL]);

  useEffect(() => { syncDocs(); }, [syncDocs]);

  const folders = Array.from(new Set(docs.map((d: any) => d.folderName))).filter(Boolean);

  const handleFiles = async (files: FileList | null, isFolder = false) => {
    if (!files) return;
    const newEntries: any[] = [];
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      const fileData = await new Promise((resolve) => { reader.onload = () => resolve(reader.result); reader.readAsDataURL(file); });
      const type = file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'صور' : file.name.endsWith('.doc') || file.name.endsWith('.docx') ? 'Word' : 'أخرى';
      const folderPath = (file as any).webkitRelativePath;
      const folderName = isFolder && folderPath ? folderPath.split('/')[0] : 'ملفات عامة';
      newEntries.push({ id: Date.now() + Math.random(), name: file.name, type, size: (file.size / 1024 / 1024).toFixed(2) + ' MB', uploadDate: new Date().toISOString().split('T')[0], data: fileData, folderName });
    }
    const updatedDocs = [...newEntries, ...docs];
    setDocs(updatedDocs);
    localStorage.setItem('lawyer_docs', JSON.stringify(updatedDocs));
    await syncDocs(updatedDocs);
    toast.success(isFolder ? 'تم رفع المجلد ومزامنته' : 'تم رفع الملفات ومزامنتها');
  };

  const deleteDoc = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      const updatedDocs = docs.filter((d: any) => d.id !== id);
      setDocs(updatedDocs);
      localStorage.setItem('lawyer_docs', JSON.stringify(updatedDocs));
      await syncDocs(updatedDocs);
      toast.error('تم حذف المستند');
    }
  };

  const downloadFile = (file: any) => { const link = document.createElement('a'); link.href = file.data; link.download = file.name; link.click(); };
  const filteredDocs = docs.filter((d: any) => (filterType === 'جميع الأنواع' || d.type === filterType) && d.name.includes(searchTerm));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-arabic flex items-center gap-2">
            إدارة المستندات {isNet ? <Wifi className="w-5 h-5 text-green-500 animate-pulse" /> : <WifiOff className="w-5 h-5 text-slate-300" />}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-bold">الموقع المركزي: {currentIp} | السعة المستخدمة: {docs.length} ملف</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => folderInputRef.current?.click()} className="bg-navy-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold border-2 border-gold/50 hover:bg-gold hover:text-navy-dark transition-all"><Folder className="w-4 h-4" /> رفع مجلد</button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-gold px-6 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg active:scale-95 transition-all"><Upload className="w-4 h-4" /> رفع ملفات</button>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} className="hidden" multiple />
      <input type="file" ref={folderInputRef} onChange={(e) => handleFiles(e.target.files, true)} className="hidden" {...({ webkitdirectory: "", directory: "" } as any)} />

      <div onClick={() => fileInputRef.current?.click()} className="bg-card rounded-xl p-8 border-2 border-dashed border-gold/30 hover:border-gold hover:bg-gold/5 transition-all cursor-pointer text-center group">
        <Upload className="w-10 h-10 text-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
        <h3 className="text-lg font-bold">اسحب الملفات هنا أو انقر للرفع المباشر</h3>
        <p className="text-xs text-muted-foreground">سيتم تشفير الملفات وحفظها في قاعدة البيانات المركزية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border p-4 shadow-sm h-fit">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-gold"><Folder className="w-4 h-4" /> الأرشيف الشجري</h3>
          <div className="space-y-1">
            <button onClick={() => setSearchTerm('')} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs font-bold border border-transparent">
               <div className="flex items-center gap-2"><File className="w-4 h-4 text-slate-400" /> <span>كل الملفات</span></div>
            </button>
            {folders.length > 0 ? folders.map((f: any, i) => (
              <button key={i} onClick={() => setSearchTerm(f)} className={`w-full flex items-center justify-between p-2 rounded-lg transition-all text-xs font-bold border ${searchTerm === f ? 'bg-gold/10 border-gold/30 text-gold' : 'hover:bg-muted border-transparent'}`}>
                <div className="flex items-center gap-2"><Folder className={`w-4 h-4 ${searchTerm === f ? 'text-gold' : 'text-gold/60'}`} /> <span>{f}</span></div>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-600">{docs.filter((d: any) => d.folderName === f).length}</span>
              </button>
            )) : <p className="text-[10px] text-muted-foreground text-center py-4 italic">لا يوجد مجلدات مرفوعة</p>}
          </div>
        </div>

        <div className="lg:col-span-3 bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex gap-4 items-center justify-between bg-muted/5">
            <div className="relative flex-1 max-w-sm"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="ابحث في اسم الملف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-9 py-1.5 text-xs w-full border" /></div>
            <div className="flex items-center gap-2">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field py-1 text-xs border w-28"><option>جميع الأنواع</option><option>PDF</option><option>Word</option><option>صور</option></select>
              <div className="flex border rounded-lg overflow-hidden"><button onClick={() => setView('grid')} className={`p-1.5 ${view === 'grid' ? 'bg-gold text-white' : ''}`}><Grid className="w-4 h-4" /></button><button onClick={() => setView('list')} className={`p-1.5 ${view === 'list' ? 'bg-gold text-white' : ''}`}><List className="w-4 h-4" /></button></div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead><tr className="bg-muted/30 text-[10px] font-bold border-b text-navy-dark"><th className="px-4 py-3">اسم المستند</th><th className="px-4 py-3">المجلد الأصلي</th><th className="px-4 py-3 text-center">الحجم</th><th className="px-4 py-3 text-center">إجراءات</th></tr></thead>
              <tbody className="divide-y divide-border">
                {filteredDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gold/5 transition-colors group">
                    <td className="px-4 py-3"><div className="flex items-center gap-2 text-sm font-bold text-slate-700"><FileText className={`w-4 h-4 ${doc.type === 'PDF' ? 'text-red-500' : doc.type === 'صور' ? 'text-blue-500' : 'text-blue-700'}`} /> {doc.name}</div></td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-400">{doc.folderName}</td>
                    <td className="px-4 py-3 text-center text-[10px] font-mono font-bold text-slate-500">{doc.size}</td>
                    <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1">
                      <button onClick={() => downloadFile(doc)} className="p-2 hover:bg-gold/20 rounded-lg text-gold transition-colors" title="تحميل"><Download className="w-4 h-4" /></button>
                      <button onClick={() => deleteDoc(doc.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocs.length === 0 && <div className="p-12 text-center text-slate-400 font-bold italic text-sm">لا توجد ملفات تطابق بحثك حالياً</div>}
          </div>
        </div>
      </div>
    </div>
  );
}