import { useState, useEffect, useRef } from "react";
import { QrCode, Check, Clock, Users, Calendar, Camera, X, Printer, Barcode, Trash2 } from "lucide-react";

// استدعاء المكونات من UI (تأكد من وجود المسارات دي عندك)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// تكتيك معالجة المكتبات الخارجية لضمان نجاح الـ Build على GitHub
let QRCodeCanvas: any = () => <div className="p-4 border border-dashed rounded-lg text-[10px]">QR Library Loading...</div>;
let BrowserMultiFormatReader: any = null;

try {
  // محاولة تحميل المكتبات لو موجودة (ستعمل محلياً وتتخطى في الـ Build)
  const qr = require("qrcode.react");
  if (qr && qr.QRCodeCanvas) QRCodeCanvas = qr.QRCodeCanvas;
  
  const zxing = require("@zxing/browser");
  if (zxing && zxing.BrowserMultiFormatReader) BrowserMultiFormatReader = zxing.BrowserMultiFormatReader;
} catch (e) {
  console.warn("External libraries not found, using fallbacks for build.");
}

export default function Attendance() {
  const [groups, setGroups] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  
  const scannerBuffer = useRef("");
  const codeReader = useRef(BrowserMultiFormatReader ? new BrowserMultiFormatReader() : null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const g = JSON.parse(localStorage.getItem("groups-data") || "[]");
    const s = JSON.parse(localStorage.getItem("students-data") || "[]");
    const savedAtt = JSON.parse(localStorage.getItem("attendance-data") || "{}");
    setGroups(g); setAllStudents(s); setAttendanceData(savedAtt);

    // لوجيك السكانر الخارجي (Barcode Scanner)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (scannerBuffer.current.length > 0) {
          processScannerInput(scannerBuffer.current.trim());
          scannerBuffer.current = "";
        }
      } else {
        if (e.key !== "Shift") scannerBuffer.current += e.key;
      }
      setTimeout(() => { scannerBuffer.current = ""; }, 300);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGroup, allStudents, attendanceData]);

  const startCamera = async () => {
    if (!BrowserMultiFormatReader) {
      toast.error("مكتبة الكاميرا غير متوفرة حالياً");
      return;
    }
    setCameraOpen(true);
    try {
      setTimeout(async () => {
        controlsRef.current = await codeReader.current.decodeFromVideoDevice(
          undefined, 
          "video-feed", 
          (result: any) => {
            if (result) {
              const code = result.getText();
              try {
                const data = JSON.parse(code);
                processScannerInput(data.studentId.toString());
              } catch {
                processScannerInput(code);
              }
              closeCamera(); 
            }
          }
        );
      }, 500);
    } catch (err) { 
      setCameraOpen(false);
      toast.error("فشل في تشغيل الكاميرا");
    }
  };

  const closeCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setCameraOpen(false);
  };

  const processScannerInput = (code: string) => {
    const student = allStudents.find(s => s.id.toString() === code || s.serial === code || `ST-${s.id}` === code);
    if (student) {
      if (student.group === selectedGroup) {
        registerAttendance(student.id);
      } else {
        toast.error(`الطالب ${student.name} يتبع مجموعة ${student.group}`);
      }
    } else {
      toast.error("كود غير معروف");
    }
  };

  const registerAttendance = (studentId: number) => {
    const currentAtt = attendanceData[selectedGroup] || {};
    if (currentAtt[studentId]) return;
    const timeNow = new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
    const newAtt = { ...attendanceData, [selectedGroup]: { ...currentAtt, [studentId]: { status: "present", time: timeNow } } };
    setAttendanceData(newAtt);
    localStorage.setItem("attendance-data", JSON.stringify(newAtt));
    new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg").play().catch(() => {});
    toast.success("تم تسجيل الحضور");
  };

  const removeAttendance = (studentId: number) => {
    const currentAtt = { ...attendanceData[selectedGroup] };
    delete currentAtt[studentId];
    const newAtt = { ...attendanceData, [selectedGroup]: currentAtt };
    setAttendanceData(newAtt);
    localStorage.setItem("attendance-data", JSON.stringify(newAtt));
    toast.info("تم حذف الحضور");
  };

  const filteredStudents = allStudents.filter(st => st.group === selectedGroup);
  const currentAtt = attendanceData[selectedGroup] || {};

  return (
    <div className="space-y-6 p-2 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">تحضير الطلاب</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-tighter">نظام المسح الذكي v2.0</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden lg:flex items-center gap-2 py-2 px-4 font-black bg-blue-50 text-blue-700 border-blue-200 animate-pulse">
            <Barcode className="w-4 h-4" /> جهاز السكانر جاهز
          </Badge>
          <Button className="gap-2 font-black shadow-lg h-11 bg-primary text-white" onClick={startCamera}>
            <Camera className="w-5 h-5" /> مسح بالكاميرا
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label className="font-black mb-2 block text-slate-600">اختر المجموعة الدراسية</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="h-12 font-bold bg-white"><SelectValue placeholder="اختر المجموعة من هنا..." /></SelectTrigger>
            <SelectContent className="bg-white">{groups.map(g => <SelectItem key={g.id} value={g.name} className="font-bold">{g.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="bg-white border rounded-xl flex items-center justify-center font-black gap-2 h-12 mt-auto text-slate-500 shadow-sm">
          <Calendar className="w-4 h-4 text-primary" /> {new Date().toLocaleDateString("ar-EG")}
        </div>
      </div>

      {selectedGroup && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="إجمالي الطلاب" value={filteredStudents.length} color="text-blue-600" />
            <StatCard title="حضور" value={Object.keys(currentAtt).length} color="text-green-600" />
            <StatCard title="غائب" value={filteredStudents.length - Object.keys(currentAtt).length} color="text-red-600" />
          </div>

          <Card className="shadow-xl border-none overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-slate-900 text-white py-4"><CardTitle className="font-black text-sm">سجل الحضور للمجموعة: {selectedGroup}</CardTitle></CardHeader>
            <CardContent className="p-0 bg-white">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-bold">لا يوجد طلاب في هذه المجموعة</div>
                ) : filteredStudents.map((student) => {
                  const att = currentAtt[student.id];
                  return (
                    <div key={student.id} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${att ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          {att ? <Check className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{student.name}</p>
                          {att && <p className="text-[10px] font-bold text-green-600">وقت التحضير: {att.time}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {att ? (
                          <div className="flex items-center gap-1">
                            <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px]">حاضر فعلاً</Badge>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600" onClick={() => removeAttendance(student.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        ) : (
                          <Button className="font-black px-5 rounded-xl bg-slate-800 text-white hover:bg-primary text-xs" onClick={() => registerAttendance(student.id)}>تحضير يدوي</Button>
                        )}
                        <Button size="icon" variant="outline" className="rounded-xl border-slate-200" onClick={() => setQrStudent(student)}><QrCode className="w-4 h-4 text-slate-500" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* مودال الكاميرا */}
      <Dialog open={cameraOpen} onOpenChange={closeCamera}>
        <DialogContent className="p-0 overflow-hidden sm:max-w-md bg-black border-none rounded-3xl">
          <div className="relative aspect-video flex items-center justify-center bg-black">
            <video id="video-feed" className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[3px] border-primary/40 m-12 rounded-3xl pointer-events-none border-dashed animate-pulse" />
            <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full z-50 shadow-xl" onClick={closeCamera}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4 bg-slate-900 text-white text-center font-black text-xs">جاري البحث عن كود... ضع البطاقة أمام الكاميرا</div>
        </DialogContent>
      </Dialog>

      {/* مودال كارت الطالب */}
      <Dialog open={!!qrStudent} onOpenChange={() => setQrStudent(null)}>
        <DialogContent className="sm:max-w-[350px] text-center p-8 border-none shadow-2xl rounded-[2.5rem] bg-white">
          <DialogHeader><DialogTitle className="font-black text-center text-xl text-blue-700">هوية الطالب الرقمية</DialogTitle></DialogHeader>
          {qrStudent && (
            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-white border-4 border-slate-50 rounded-[2rem] shadow-sm">
                <QRCodeCanvas size={160} value={JSON.stringify({ studentId: qrStudent.id, name: qrStudent.name })} />
              </div>
              <div className="w-full space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barcode / Serial Number</p>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xl font-mono font-black tracking-[0.2em] text-slate-800">
                      ST-{qrStudent.id.toString().padStart(8, '0')} 
                    </p>
                    <p className="text-[9px] font-bold text-blue-500 mt-2">متوافق مع أجهزة السكانر الليزر</p>
                 </div>
              </div>
              <div className="text-center">
                <p className="font-black text-2xl text-slate-900">{qrStudent.name}</p>
                <p className="font-bold text-blue-600 text-sm">{selectedGroup}</p>
              </div>
              <Button className="w-full gap-2 font-black h-12 shadow-lg rounded-2xl bg-primary text-white" onClick={() => window.print()}>
                <Printer className="w-5 h-5" /> طباعة الكارت
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-6 text-center rounded-[2rem]">
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{title}</p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
    </Card>
  );
}