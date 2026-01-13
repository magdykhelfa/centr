import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus, Search, MoreVertical, Phone, MapPin,
  Briefcase, Trash2, UserPen, Wifi, WifiOff, Settings, Save
} from 'lucide-react';
import AddClientDialog from '@/components/dialogs/AddClientDialog';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function Clients() {
  const [currentIp, setCurrentIp] = useState(() => localStorage.getItem('server_ip') || '192.168.1.5');
  const BASE_URL = `http://${currentIp}:3000`;

  const [clientsList, setClientsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('lawyer_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isNet, setIsNet] = useState(false);

  const [lastEventId, setLastEventId] = useState<number>(
    Number(localStorage.getItem('clients_last_event') || 0)
  );

  const handleConfigIp = () => {
    const newIp = window.prompt('أدخل عنوان IP السيرفر الرئيسي:', currentIp);
    if (newIp && newIp !== currentIp) {
      localStorage.setItem('server_ip', newIp);
      setCurrentIp(newIp);
      window.location.reload();
    }
  };

  // وظيفة الحفظ السريع للـ IP من الخانة الجديدة
  const saveIp = (val: string) => {
    if (!val) return;
    localStorage.setItem('server_ip', val);
    setCurrentIp(val);
    toast.success('تم حفظ وتثبيت عنوان الربط');
    setTimeout(() => window.location.reload(), 300);
  };

  // ===== Listen Events =====
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/events?since=${lastEventId}`);
        if (!res.ok) { setIsNet(false); return; }
        const data = await res.json();

        if (data.events.length > 0) {
          let updated = [...clientsList];

          data.events.forEach((ev: any) => {
            if (ev.type === 'clients:add') {
              if (!updated.find(c => c.id === ev.payload.id)) {
                updated.unshift(ev.payload);
              }
            }
            if (ev.type === 'clients:update') {
              updated = updated.map(c => c.id === ev.payload.id ? ev.payload : c);
            }
            if (ev.type === 'clients:delete') {
              updated = updated.filter(c => c.id !== ev.payload.id);
            }
          });

          setClientsList(updated);
          localStorage.setItem('lawyer_clients', JSON.stringify(updated));
          setLastEventId(data.lastId);
          localStorage.setItem('clients_last_event', data.lastId.toString());
          setIsNet(true);
        } else {
          setIsNet(true); // متصل ولكن لا توجد أحداث جديدة
        }
      } catch {
        setIsNet(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [clientsList, lastEventId, BASE_URL]);

  // ===== Add / Edit =====
  const handleAddOrEdit = useCallback(async (data: any) => {
    try {
      if (selectedClient) {
        const updated = { ...selectedClient, ...data };
        await fetch(`${BASE_URL}/clients/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        toast.success('تم تحديث العميل');
      } else {
        const client = {
          ...data,
          id: Date.now(),
          status: 'active',
          casesCount: 0,
          totalDue: 0
        };
        await fetch(`${BASE_URL}/clients/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client)
        });
        toast.success('تم إضافة العميل');
      }
    } catch {
      toast.error('فشل الاتصال بالسيرفر');
    }

    setIsAddDialogOpen(false);
    setSelectedClient(null);
  }, [selectedClient, BASE_URL]);

  // ===== Delete =====
  const handleDelete = async (id: number) => {
    if (!window.confirm('حذف العميل؟')) return;
    try {
      await fetch(`${BASE_URL}/clients/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      toast.error('تم حذف العميل');
    } catch {
      toast.error('فشل الاتصال بالسيرفر');
    }
  };

  const filteredClients = useMemo(() => {
    return clientsList.filter(c =>
      (c.name || '').includes(searchTerm) ||
      (c.phone || '').includes(searchTerm)
    );
  }, [clientsList, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border/50">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              إدارة العملاء {isNet ? <Wifi className="w-5 h-5 text-success animate-pulse" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
            </h1>
            <div className="flex items-center gap-2 mt-1 bg-muted/30 p-1 rounded-md border border-border/20">
              <input 
                type="text"
                value={currentIp}
                onChange={(e) => setCurrentIp(e.target.value)}
                placeholder="IP السيرفر"
                className="bg-transparent text-[10px] outline-none w-24 text-primary font-mono px-1"
              />
              <button onClick={() => saveIp(currentIp)} className="hover:text-gold transition-colors">
                <Save className="w-3 h-3" />
              </button>
              <span className="text-[9px] text-muted-foreground border-r pr-1 mr-1">{isNet ? 'متصل' : 'محلي'}</span>
            </div>
          </div>
          <button onClick={handleConfigIp} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => { setSelectedClient(null); setIsAddDialogOpen(true); }} 
          className="btn-gold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> عميل جديد
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-4 border border-border/40">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            placeholder="بحث باسم العميل أو رقم الهاتف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pr-10 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#D4AF37]"></div>
            <div className="flex justify-between">
              <h3 className="text-lg font-bold text-foreground">{client.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 hover:bg-muted rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border shadow-xl rounded-xl min-w-[150px]">
                  <DropdownMenuItem onClick={() => {
                    setSelectedClient(client);
                    setIsAddDialogOpen(true);
                  }} className="flex items-center gap-2 p-2.5 cursor-pointer text-primary hover:bg-primary/5">
                    <UserPen className="w-4 h-4" /> تعديل البيانات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(client.id)} className="flex items-center gap-2 p-2.5 cursor-pointer text-destructive hover:bg-destructive/5">
                    <Trash2 className="w-4 h-4" /> حذف العميل
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-3 mt-4">
              <div className="text-sm flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4" /> {client.phone}
              </div>
              <div className="text-sm flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4" /> {client.address}
              </div>
              <div className="pt-4 mt-2 border-t border-border/40 flex justify-between items-center">
                <div className="text-sm flex items-center gap-2 font-medium text-foreground/70">
                  <Briefcase className="w-4 h-4 text-[#D4AF37]" /> {client.casesCount} قضايا
                </div>
                <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-md font-bold">نشط</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddClientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialData={selectedClient}
        onAdd={handleAddOrEdit}
      />
    </div>
  );
}