
"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  PlusCircle, Wallet, Target, Calendar, TrendingUp, TrendingDown, 
  Info, Trash2, DollarSign, ArrowUpRight, Filter, Edit3, Save, 
  Download, FileText, ChevronLeft, ChevronRight, CreditCard, 
  AlertTriangle, RefreshCcw, LogOut, Activity, Search
} from "lucide-react";

// Define Transaction Interface
interface Transaction {
  id: string;
  type: string;
  amount: number;
  month: string;
  note: string;
  transaction_date: string;
  usd_rate: number;
}

export default function FinancialReport() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // FIX: Tambahkan Type Transaction[]
  const [selectedMonth, setSelectedMonth] = useState(new Intl.DateTimeFormat('en-US', {month: 'long'}).format(new Date()));
  const [targetPercentage, setTargetPercentage] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [usdRate, setUsdRate] = useState(16385);
  const [lastUpdate, setLastUpdate] = useState("Loading...");

  const [form, setForm] = useState({ 
    type: 'profit', customType: '', nature: 'add', amount: '', 
    transaction_date: new Date().toISOString().split('T')[0], note: '' 
  });

  const [ledgerFilter, setLedgerFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setItemToDelete] = useState<string | null>(null);

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MONTHS_MAP:any = { January: 31, February: 28, March: 31, April: 30, May: 31, June: 30, July: 31, August: 31, September: 30, October: 31, November: 30, December: 31 };
  const EXPENSE_KEYWORDS = ['biaya', 'penarikan', 'operasional', 'loss', '[EXPENSE]'];

  // --- 1. CORE LOGIC ---
  useEffect(() => {
    setIsClient(true);
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/loginpage");
    };
    checkAuth();
    reloadData();
    fetchLiveRate();
  }, [router]);

  const fetchLiveRate = async () => {
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      if(data.rates.IDR) setUsdRate(data.rates.IDR);
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));
    } catch (e) { setLastUpdate("Fixed Mode"); }
  };

  const reloadData = async () => {
    const { data, error } = await supabase.from('financial_transactions').select('*').order('transaction_date', { ascending: true });
    if (data) setTransactions(data as Transaction[]); // Type assertion
    if (error) toast.error("Database Error: " + error.message);
  };

  const summary = useMemo(() => {
    const categories: any = {};
    let netBalance = 0;
    const chartData = transactions.map((t) => {
      const amt = parseFloat(t.amount as any) || 0;
      const type = t.type.toLowerCase();
      const isExpense = EXPENSE_KEYWORDS.some(k => type.includes(k) || t.note?.includes('[EXPENSE]'));
      if (!categories[type]) categories[type] = 0;
      categories[type] += amt;
      netBalance = isExpense ? netBalance - amt : netBalance + amt;
      return { date: t.transaction_date, balance: netBalance };
    });
    const modal = categories['modal'] || 0;
    const targetAmt = modal * (targetPercentage / 100);
    const days = MONTHS_MAP[selectedMonth] || 30;
    return { categories, netBalance, chartData, modal, targetAmt, daily: Math.round(targetAmt / days) };
  }, [transactions, targetPercentage, selectedMonth, usdRate]);

  const filteredData = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.transaction_date);
      const mName = MONTHS[d.getMonth()];
      const matchMonth = (t.month === selectedMonth) || (!t.month && mName === selectedMonth);
      const matchCat = ledgerFilter === "all" || t.type === ledgerFilter;
      const matchSearch = t.note?.toLowerCase().includes(searchQuery.toLowerCase()) || t.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMonth && matchCat && matchSearch;
    }).reverse();
  }, [transactions, selectedMonth, ledgerFilter, searchQuery]);

  const ledgerTotals = useMemo(() => {
    const idr = filteredData.reduce((acc, t) => acc + (parseFloat(t.amount as any) || 0), 0);
    return { idr, usd: idr / usdRate };
  }, [filteredData, usdRate]);

  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // --- 2. HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return toast.error("Nominal Kosong!");
    const isCustom = form.type === 'custom';
    const finalType = isCustom ? form.customType.toLowerCase() : form.type;
    const naturePrefix = form.nature === 'sub' ? '[EXPENSE]' : '[INCOME]';
    const payload = { 
      type: finalType, amount: parseFloat(form.amount.replace(/\./g, "")), 
      transaction_date: form.transaction_date, note: `${naturePrefix} ${form.note}`,
      usd_rate: usdRate, month: selectedMonth 
    };

    const { error } = editingId ? await supabase.from('financial_transactions').update(payload).eq('id', editingId) : await supabase.from('financial_transactions').insert([payload]);
    if (!error) { 
      toast.success("Saved Successfully"); 
      setForm({ ...form, amount: '', note: '', customType: '', type: 'profit' }); 
      setEditingId(null); reloadData(); 
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(t => ({ Date: t.transaction_date, Category: t.type.toUpperCase(), IDR: t.amount, USD: (t.amount/usdRate).toFixed(2), Note: t.note })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, `Financial_Ledger_${selectedMonth}.xlsx`);
  };

  const formatIDR = (val: number | string) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(val));
  const toUSD = (val: number) => (val / usdRate).toLocaleString("en-US", { style: "currency", currency: "USD" });

  if (!isClient) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 p-4 md:p-8 space-y-8 font-sans print:bg-white print:text-black">
      <Toaster theme="dark" richColors position="top-center" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent italic uppercase tracking-tighter leading-none">Report Trading</h1>
          <p className="text-zinc-500 text-[10px] tracking-[0.4em] font-black mt-2 flex items-center gap-2 uppercase">
            <Activity size={12} className="text-green-500 animate-pulse"/> Love By Ado
          </p>
        </div>
        <div className="flex gap-3">
          <HeaderCard label="Live USD" value={`Rp ${formatIDR(usdRate)}`} sub={lastUpdate} icon={<DollarSign size={14} className="text-green-400"/>} onRefresh={fetchLiveRate} />
          <div className="bg-zinc-900/50 border border-white/5 p-3 px-4 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-inner">
            <Target size={16} className="text-emerald-400" />
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] text-zinc-500 uppercase font-black">Target %</span>
              <input type="number" value={targetPercentage} onChange={(e) => setTargetPercentage(parseFloat(e.target.value) || 0)} className="bg-transparent text-sm font-bold outline-none w-10 text-white" />
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/"); }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 font-black text-xs hover:bg-red-500/20 transition-all flex items-center gap-2 uppercase tracking-tighter"><LogOut size={16}/> Logout</button>
        </div>
      </div>

      {/* STATS GRID 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Net Balance" value={summary.netBalance} usd={toUSD(summary.netBalance)} color="purple" icon={<Info />} />
        <StatCard label="Target Profit" value={summary.targetAmt} usd={toUSD(summary.targetAmt)} color="emerald" icon={<Target />} />
        <StatCard label="Daily Target" value={summary.daily} usd={toUSD(summary.daily)} color="yellow" icon={<Calendar />} />
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Trading Win Rate</p>
          <h2 className="text-4xl font-black italic text-white mb-3">{Math.round(calculateWinRate(transactions))}%</h2>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
             <div className="bg-green-500 h-full transition-all duration-1000" style={{width: `${calculateWinRate(transactions)}%`}}></div>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem] h-[400px] backdrop-blur-xl shadow-2xl relative overflow-hidden">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={summary.chartData}>
             <defs><linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
             <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
             <XAxis dataKey="date" hide /><YAxis hide domain={['auto', 'auto']} />
             <Tooltip contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid #ffffff10', fontSize: '10px' }} />
             <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={4} fill="url(#colorBal)" />
           </AreaChart>
         </ResponsiveContainer>
      </div>

      {/* MINI PANELS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
        <MiniStat label="Total Modal" value={summary.modal} color="text-blue-400" />
        {Object.keys(summary.categories).filter(c => c !== 'modal').map(cat => (
          <MiniStat key={cat} label={cat} value={summary.categories[cat]} color={EXPENSE_KEYWORDS.some(k => cat.toLowerCase().includes(k)) ? "text-red-400" : "text-green-400"} />
        ))}
      </div>

      {/* FORM INPUT */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md shadow-2xl print:hidden">
        <div className="grid grid-cols-1 md:flex md:flex-wrap gap-4 items-end">
          <FormInput label="Category" component={
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-green-500/50">
              <option value="modal">MODAL</option><option value="profit">PROFIT</option><option value="biaya">BIAYA</option>
              <option value="pendapatan">PENDAPATAN</option><option value="penarikan">PENARIKAN</option>
              <option value="custom" className="text-yellow-400 font-bold">+ NEW CATEGORY</option>
            </select>
          }/>
          {form.type === 'custom' && (
            <>
              <FormInput label="Name" component={<input type="text" value={form.customType} onChange={e => setForm({...form, customType: e.target.value})} placeholder="Name..." className="w-full bg-black border border-yellow-500/30 rounded-xl p-3 text-white outline-none" />}/>
              <FormInput label="Nature" component={<select value={form.nature} onChange={e => setForm({...form, nature: e.target.value})} className="w-full bg-black border border-yellow-500/30 rounded-xl p-3 text-white outline-none"><option value="add">Add (+)</option><option value="sub">Sub (-)</option></select>}/>
            </>
          )}
          <FormInput label="Amount IDR" component={<input type="text" value={form.amount} onChange={e => setForm({...form, amount: e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")})} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none font-mono" />}/>
          <FormInput label="Date" component={<input type="date" value={form.transaction_date} onChange={e => setForm({...form, transaction_date: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none" />}/>
          <FormInput label="Note" component={<input type="text" value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="..." className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none flex-1" />}/>
          <button type="submit" className="h-[50px] bg-green-500 text-black rounded-xl font-black px-10 hover:bg-green-400 transition-all shadow-lg flex items-center gap-2 uppercase tracking-tighter"><PlusCircle size={18}/> Simpan</button>
        </div>
      </form>

      {/* LEDGER TABLE */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center bg-white/[0.02] gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-sm uppercase tracking-widest italic flex items-center gap-2"><FileText size={16}/> Ledger Data</h3>
            <div className="flex gap-2">
              <button onClick={exportExcel} className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg"><Download size={14}/></button>
              <button onClick={() => window.print()} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg"><FileText size={14}/></button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={12}/><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-black border border-white/10 rounded-xl pl-8 pr-3 py-2 text-[10px] outline-none w-[150px] focus:border-green-500/50"/></div>
             <select value={selectedMonth} onChange={e => {setSelectedMonth(e.target.value); setCurrentPage(1);}} className="bg-black border border-white/10 rounded-xl p-2 text-[10px] font-bold uppercase outline-none">{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
             <select value={ledgerFilter} onChange={e => {setLedgerFilter(e.target.value); setCurrentPage(1);}} className="bg-black border border-white/10 rounded-xl p-2 text-[10px] font-bold uppercase outline-none"><option value="all">All Categories</option>{Object.keys(summary.categories).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}</select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left print:text-black">
            <thead className="bg-white/5 text-zinc-500 text-[10px] uppercase font-black">
              <tr><th className="p-6">Waktu</th><th className="p-6">Kategori</th><th className="p-6 text-right">Nominal IDR</th><th className="p-6 text-right">Nominal USD</th><th className="p-6 text-right print:hidden">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-gray-200">
              {paginatedData.map((t: any) => {
                const isExpense = EXPENSE_KEYWORDS.some(k => t.type.toLowerCase().includes(k) || t.note?.includes('[EXPENSE]'));
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-6 text-xs text-zinc-400 font-mono print:text-black">{t.transaction_date}</td>
                    <td className="p-6 font-bold text-[10px] uppercase">{t.type}</td>
                    <td className={`p-6 text-right font-mono font-bold text-sm ${isExpense ? 'text-red-400' : 'text-green-400'}`}>Rp {formatIDR(t.amount)}</td>
                    <td className="p-6 text-right font-mono text-zinc-400 text-sm italic">${(parseFloat(t.amount) / usdRate).toFixed(2)}</td>
                    <td className="p-6 text-right flex justify-end gap-1 print:hidden">
                      <button onClick={() => { setEditingId(t.id); setForm({ ...form, type: t.type, amount: formatIDR(t.amount), transaction_date: t.transaction_date, note: t.note?.replace('[EXPENSE]','').replace('[INCOME]','').trim() || '' }); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 text-zinc-600 hover:text-blue-400 transition-all"><Edit3 size={15}/></button>
                      <button onClick={() => { setItemToDelete(t.id); setShowDeleteModal(true); }} className="p-2 text-zinc-600 hover:text-red-500 transition-all"><Trash2 size={15}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-white/[0.03] font-black print:bg-gray-100">
              <tr>
                <td colSpan={2} className="p-6 text-[10px] uppercase text-zinc-500">Summary ({selectedMonth})</td>
                <td className="p-6 text-right font-mono text-white border-t border-white/10 print:text-black">Rp {formatIDR(ledgerTotals.idr)}</td>
                <td className="p-6 text-right font-mono text-zinc-400 border-t border-white/10 print:text-black">USD {(ledgerTotals.usd).toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="p-4 flex justify-between items-center border-t border-white/5">
           <p className="text-[10px] text-zinc-600 font-bold uppercase">Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage) || 1}</p>
           <div className="flex gap-2">
             <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-2 bg-white/5 rounded-lg"><ChevronLeft size={14}/></button>
             <button onClick={() => setCurrentPage(p => p+1)} className="p-2 bg-white/5 rounded-xl"><ChevronRight size={14}/></button>
           </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4"><AlertTriangle size={32}/></div>
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter italic">Hapus Transaksi?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-zinc-800 p-3 rounded-xl font-bold text-xs uppercase tracking-widest">Batal</button>
              <button onClick={async () => { if(pendingDeleteId) { await supabase.from('financial_transactions').delete().eq('id', pendingDeleteId); setShowDeleteModal(false); reloadData(); toast.error("Deleted"); } }} className="flex-1 bg-red-500 p-3 rounded-xl font-bold text-black text-xs uppercase tracking-widest">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPERS ---
function calculateWinRate(tx: any[]) {
  const trades = tx.filter(t => ['profit','loss'].includes(t.type.toLowerCase()));
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.type.toLowerCase() === 'profit').length;
  return (wins / trades.length) * 100;
}

function HeaderCard({ label, value, sub, icon, onRefresh }: any) {
  return (
    <div className="bg-zinc-900/50 border border-white/5 p-3 px-4 rounded-2xl flex items-center gap-3 backdrop-blur-sm shadow-inner relative group">
      {icon}
      <div className="flex flex-col leading-tight"><span className="text-[9px] text-zinc-500 font-black uppercase">{label}</span><span className="text-sm font-bold tracking-tight">{value}</span><span className="text-[8px] text-zinc-600 font-bold italic">{sub}</span></div>
      {onRefresh && <button onClick={onRefresh} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-600 hover:text-white"><RefreshCcw size={10}/></button>}
    </div>
  );
}

function StatCard({ label, value, usd, color, icon }: any) {
  const colors:any = { blue: "from-blue-500/20 border-blue-500/10", purple: "from-purple-500/20 border-purple-500/10", yellow: "from-yellow-500/20 border-yellow-500/10", emerald: "from-emerald-500/20 border-emerald-500/10" };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} bg-zinc-900/40 border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group h-full flex flex-col justify-center`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-widest">{label}</p>
      <h2 className="text-2xl font-black italic text-white leading-none">Rp {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value || 0)}</h2>
      <p className="text-zinc-500 text-xs mt-3 font-bold italic opacity-60 border-t border-white/5 pt-2">USD {usd}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: any) {
  return (
    <div className="bg-zinc-900/20 border border-white/5 p-5 rounded-3xl border-l-4 border-l-current transition-all hover:bg-white/[0.03] group shadow-md flex flex-col gap-1">
      <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-mono font-bold ${color}`}>Rp {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value || 0)}</p>
    </div>
  );
}

function FormInput({ label, component }: any) {
  return <div className="flex flex-col gap-2 flex-1 min-w-[150px]"><label className="text-[9px] uppercase font-black text-zinc-500 ml-2 tracking-widest">{label}</label>{component}</div>;
}