'use client';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useState, useEffect, useMemo } from 'react';
import { FaMoon, FaSun, FaQrcode, FaSearch, FaPlus, FaTrash, FaChevronDown, FaChartLine } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { stellar } from '@/lib/stellar-helper';

// ============================================
// 1. Dark/Light Mode Toggle
// ============================================
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-400" />}
    </button>
  );
}

// ============================================
// 2. QR Code for Address
// ============================================
export function AddressQRCode({ address }: { address: string }) {
  const [show, setShow] = useState(false);
  if (!address) return null;
  return (
    <div className="relative inline-block">
      <button onClick={() => setShow(!show)} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm">
        <FaQrcode /> {show ? 'Hide QR' : 'Show QR'}
      </button>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-full left-0 mt-2 z-50 p-3 bg-gray-900 rounded-xl border border-white/10 shadow-xl">
            <QRCodeSVG value={address} size={128} level="H" includeMargin />
            <p className="text-xs text-center text-white/50 mt-2 font-mono truncate max-w-[140px]">{address}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 3. Balance Chart (REAL DATA - FIXED LOGIC)
// ============================================
export function BalanceChart({ publicKey }: { publicKey: string }) {
  const [chartData, setChartData] = useState<Array<{ date: string; balance: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        // 1. Get Current Balance
        const balanceData = await stellar.getBalance(publicKey);
        const currentBalance = parseFloat(balanceData.xlm);

        // 2. Get Transactions (Newest -> Oldest from API)
        let transactions = await stellar.getRecentTransactions(publicKey, 50);
        
        // Reverse to process Oldest -> Newest
        transactions = [...transactions].reverse();

        if (transactions.length === 0) {
          setChartData([{ date: 'Now', balance: currentBalance }]);
          setLoading(false);
          return;
        }

        // 3. Calculate Net Flow of fetched transactions
        let netFlow = 0;
        transactions.forEach(tx => {
          const amount = parseFloat(tx.amount || '0');
          const isXlm = tx.asset === 'XLM' || !tx.asset || tx.asset === 'native';
          
          if (isXlm) {
            if (tx.to === publicKey) netFlow += amount; // Received
            if (tx.from === publicKey) netFlow -= amount; // Sent
          }
        });

        // Estimate Start Balance: Current - NetFlow
        let estimatedStartBalance = currentBalance - netFlow;
        if (estimatedStartBalance < 0) estimatedStartBalance = 0; // Clamp negative estimates

        // 4. Build Chronological Points
        const historyPoints: Array<{ date: string; balance: number }> = [];
        let runningBalance = estimatedStartBalance;

        transactions.forEach((tx) => {
          const amount = parseFloat(tx.amount || '0');
          const isXlm = tx.asset === 'XLM' || !tx.asset || tx.asset === 'native';

          if (isXlm) {
            if (tx.to === publicKey) runningBalance += amount;
            if (tx.from === publicKey) runningBalance -= amount;
          }

          historyPoints.push({
            date: new Date(tx.createdAt).toLocaleDateString(undefined, { 
              month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
            }),
            balance: parseFloat(runningBalance.toFixed(4))
          });
        });

        setChartData(historyPoints);
      } catch (error) {
        console.error('Chart error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [publicKey]);

  if (loading) {
    return (
      <div className="bg-plum-card backdrop-blur-md rounded-xl p-5 border border-[#f0e442]/10 h-80 flex items-center justify-center">
        <div className="animate-pulse text-[#fdf2ff]/60 text-sm">Loading history...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-plum-card backdrop-blur-md rounded-xl p-5 border border-[#f0e442]/10 h-80 flex items-center justify-center">
        <p className="text-[#fdf2ff]/40 text-sm">No transaction history</p>
      </div>
    );
  }

  return (
    <div className="bg-plum-card backdrop-blur-md rounded-xl p-5 border border-[#f0e442]/10">
      <h3 className="text-[#fdf2ff] font-semibold mb-4 text-sm flex items-center gap-2">
        <FaChartLine className="text-purple-400" /> XLM Balance History
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              minTickGap={20}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a051a', border: '1px solid #5c1a5c', borderRadius: '8px', color: '#fdf2ff' }}
              formatter={(value: any) => [`${Number(value ?? 0).toFixed(4)} XLM`, 'Balance']}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#d846d8" 
              strokeWidth={2} 
              dot={{ r: 2, fill: '#1a051a', strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: '#f0e442' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// 4. Transaction Filter
// ============================================
export function TransactionFilter({ onFilter }: { onFilter: (q: string) => void }) {
  const [q, setQ] = useState('');
  return (
    <div className="relative mb-4">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#fdf2ff]/40" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); onFilter(e.target.value); }}
        placeholder="Search by address, memo, or hash..."
        className="w-full bg-white/5 border border-[#f0e442]/20 rounded-lg pl-10 pr-4 py-2 text-[#fdf2ff] placeholder-[#fdf2ff]/40 focus:outline-none focus:border-[#d846d8] transition-colors"
      />
    </div>
  );
}

// ============================================
// 5. Transaction Confirmation Modal
// ============================================
export function TransactionConfirmation({ isOpen, onConfirm, onCancel, recipient, amount }: {
  isOpen: boolean; onConfirm: () => void; onCancel: () => void; recipient: string; amount: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-plum-dark rounded-2xl max-w-md w-full border border-[#f0e442]/20 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-bold hype-plum mb-4">Confirm Transaction</h3>
              <div className="space-y-3 mb-6">
                <div className="bg-white/5 rounded-lg p-3"><p className="text-[#fdf2ff]/60 text-sm">Recipient</p><p className="text-[#fdf2ff] font-mono text-sm break-all">{recipient}</p></div>
                <div className="bg-white/5 rounded-lg p-3"><p className="text-[#fdf2ff]/60 text-sm">Amount</p><p className="text-[#fdf2ff] text-2xl font-bold">{amount} XLM</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition">Cancel</button>
                <button onClick={onConfirm} className="flex-1 plum-gradient hover:opacity-90 text-white font-bold py-3 rounded-lg transition">Confirm Send</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// 6. Address Book
// ============================================
export function AddressBook({ onSelect }: { onSelect?: (addr: string) => void }) {
  const [addrs, setAddrs] = useState<Array<{ id: string; name: string; address: string }>>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('stellar-addr-book');
    if (saved) try { setAddrs(JSON.parse(saved)); } catch {}
  }, []);

  const save = (updated: typeof addrs) => { setAddrs(updated); localStorage.setItem('stellar-addr-book', JSON.stringify(updated)); };

  const handleAdd = () => {
    if (!name.trim() || !addr.trim().startsWith('G')) return alert('Valid name & G-address required');
    if (addrs.some(a => a.address === addr.trim())) return alert('Address already saved');
    save([...addrs, { id: crypto.randomUUID(), name: name.trim(), address: addr.trim() }]);
    setName(''); setAddr(''); setShowAdd(false);
  };

  return (
    <div className="bg-plum-card backdrop-blur-md rounded-xl p-5 border border-[#f0e442]/10">
      <button onClick={() => setShowAdd(!showAdd)} className="text-[#d846d8] hover:text-[#f0e442] text-sm flex items-center gap-2 mb-4 transition">
        <FaPlus /> {showAdd ? 'Close' : 'Add Contact'}
      </button>
      {showAdd && (
        <div className="mb-4 p-4 bg-white/5 rounded-lg space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full bg-black/30 border border-[#f0e442]/20 rounded px-3 py-2 text-[#fdf2ff] placeholder-[#fdf2ff]/40 focus:outline-none focus:border-[#d846d8]" />
          <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="Stellar Address (G...)" className="w-full bg-black/30 border border-[#f0e442]/20 rounded px-3 py-2 text-[#fdf2ff] placeholder-[#fdf2ff]/40 focus:outline-none focus:border-[#d846d8] font-mono text-sm" />
          <button onClick={handleAdd} className="w-full plum-gradient hover:opacity-90 text-white font-bold py-2 rounded transition">Save</button>
        </div>
      )}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {addrs.length === 0 ? <p className="text-center py-6 text-[#fdf2ff]/40 text-sm">No saved addresses</p> :
          addrs.map(c => (
            <div key={c.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center group transition hover:bg-white/10">
              <button onClick={() => onSelect?.(c.address)} className="flex-1 text-left">
                <p className="text-[#fdf2ff] font-semibold text-sm">{c.name}</p>
                <p className="text-[#fdf2ff]/50 text-xs font-mono">{c.address.slice(0, 10)}...{c.address.slice(-6)}</p>
              </button>
              <button onClick={() => save(addrs.filter(a => a.id !== c.id))} className="p-2 text-[#fdf2ff]/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><FaTrash /></button>
            </div>
          ))}
      </div>
    </div>
  );
}

// ============================================
// 7. Multiple Asset Selector
// ============================================
export function AssetSelector({ assets, selected, onSelect }: {
  assets: Array<{ code: string; issuer: string; balance: string }>;
  selected: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="relative">
      <select value={selected} onChange={e => onSelect(e.target.value)}
        className="w-full appearance-none bg-black/30 border border-[#f0e442]/20 rounded px-4 py-2 pr-10 text-[#fdf2ff] focus:outline-none focus:border-[#d846d8] cursor-pointer">
        <option value="native">XLM (Native)</option>
        {assets.filter(a => a.code !== 'XLM').map((a, i) => (
          <option key={i} value={a.issuer} className="bg-plum-dark">{a.code} (Issuer: {a.issuer.slice(0,6)}...)</option>
        ))}
      </select>
      <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#fdf2ff]/50 pointer-events-none" />
    </div>
  );
}

// ============================================
// 8. Animated Card Wrapper
// ============================================
export function AnimatedCard({ children, delay = 0, className = "" }: { 
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}