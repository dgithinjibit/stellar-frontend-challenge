'use client';

import { useState, useCallback, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionConfirmation, AssetSelector } from '@/components/BonusFeatures';

interface PaymentFormProps {
  publicKey: string;
  onSuccess: () => void;
  prefillAddress?: string; // 📒 AddressBook auto-fill support
  assets?: Array<{ code: string; issuer: string; balance: string }>; // 💱 Multi-asset support
}

// Conversion constants - replace with live API in production
const KES_TO_XLM_RATE = 0.085;
const XLM_TO_KES_RATE = 1 / KES_TO_XLM_RATE;
const STELLAR_DECIMALS = 7;

export default function PaymentForm({ 
  publicKey, 
  onSuccess, 
  prefillAddress,
  assets = [] 
}: PaymentFormProps) {
  const [destination, setDestination] = useState('');
  const [amountKES, setAmountKES] = useState('');
  const [amountXLM, setAmountXLM] = useState('');
  const [inputMode, setInputMode] = useState<'KES' | 'XLM'>('KES');
  const [selectedAsset, setSelectedAsset] = useState('native'); // 💱 Asset selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 🔐 Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTx, setPendingTx] = useState<{ to: string; amount: string; asset: string } | null>(null);

  // 📒 Auto-fill recipient when AddressBook selection changes
  useEffect(() => {
    if (prefillAddress) {
      setDestination(prefillAddress);
      setError('');
    }
  }, [prefillAddress]);

  const formatStellarAmount = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return '0';
    return num.toFixed(STELLAR_DECIMALS).replace(/\.?0+$/, '') || '0';
  };

  const kesToXlm = useCallback((kes: string): string => {
    const value = parseFloat(kes);
    if (isNaN(value) || value <= 0) return '';
    return formatStellarAmount((value * KES_TO_XLM_RATE).toString());
  }, []);

  const xlmToKes = useCallback((xlm: string): string => {
    const value = parseFloat(xlm);
    if (isNaN(value) || value <= 0) return '';
    return (value * XLM_TO_KES_RATE).toFixed(2);
  }, []);

  const handleKESChange = (value: string) => {
    setInputMode('KES');
    setAmountKES(value);
    setAmountXLM(value ? kesToXlm(value) : '');
    setError('');
    setSuccessMessage('');
  };

  const handleXLMChange = (value: string) => {
    setInputMode('XLM');
    setAmountXLM(value);
    setAmountKES(value ? xlmToKes(value) : '');
    setError('');
    setSuccessMessage('');
  };

  const isValidStellarAddress = (address: string): boolean => {
    return /^G[A-Z0-9]{55}$/.test(address.trim());
  };

  const parseHelperError = (err: any): string => {
    const message = err?.message?.toLowerCase() || '';
    if (message.includes('user rejected') || message.includes('cancelled')) {
      return 'Transaction cancelled in wallet. Please approve to proceed.';
    }
    if (message.includes('tx_bad_seq')) {
      return 'Sequence number mismatch. Refresh the page and try again.';
    }
    if (message.includes('insufficient_balance') || message.includes('underfunded')) {
      return 'Insufficient balance. Keep at least 1 XLM for network reserves.';
    }
    if (message.includes('no_account') || message.includes('account not found')) {
      return 'Recipient not found on testnet. Fund them via Friendbot first.';
    }
    if (message.includes('bad_auth')) {
      return 'Wallet authentication failed. Ensure Freighter is set to Testnet.';
    }
    if (message.includes('timeout') || message.includes('network error')) {
      return 'Network timeout. Check your connection and try again.';
    }
    if (err?.message) return `Transaction failed: ${err.message}`;
    return 'Transaction failed. Check console for details and try again.';
  };

  // 🔐 Show confirmation modal instead of sending directly
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination.trim()) { setError('Please enter a recipient address'); return; }
    if (!isValidStellarAddress(destination)) { setError('Invalid address. Must be 56 chars starting with "G"'); return; }
    
    const finalAmount = inputMode === 'KES' ? amountXLM : amountXLM;
    if (!finalAmount || parseFloat(finalAmount) <= 0) { setError('Please enter a valid amount'); return; }
    
    const formattedAmount = formatStellarAmount(finalAmount);
    
    // 🔐 Store pending transaction and show modal
    setPendingTx({ to: destination.trim(), amount: formattedAmount, asset: selectedAsset });
    setShowConfirm(true);
  };

  // 🔐 Execute transaction after user confirms
  const handleConfirmSend = async () => {
    if (!pendingTx) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const result = await stellar.sendPayment({
        from: publicKey,
        to: pendingTx.to,
        amount: pendingTx.amount,
        // asset: pendingTx.asset !== 'native' ? { code: pendingTx.asset.split(':')[0], issuer: pendingTx.asset.split(':')[1] } : undefined
      });
      
      if (result.success) {
        setSuccessMessage(`✅ Sent ${pendingTx.amount} XLM successfully!`);
        onSuccess();
        setDestination('');
        setAmountKES('');
        setAmountXLM('');
        setPendingTx(null);
      } else {
        throw new Error('Transaction not confirmed on network');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(parseHelperError(err));
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
      >
        <motion.h3 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-white font-semibold mb-4 text-sm"
        >
          Send Payment
        </motion.h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Address */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-blue-100/80 text-xs mb-1">Recipient Address</label>
            <motion.input
              whileFocus={{ scale: 1.01, borderColor: "rgba(96, 165, 250, 0.5)" }}
              type="text"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setError(''); }}
              placeholder="GABC...XYZ"
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 font-mono transition-colors"
              required
              maxLength={56}
            />
          </motion.div>
          
          {/* 💱 Asset Selector (Bonus: Multiple Assets - 15 pts) */}
          {assets.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-blue-100/80 text-xs mb-1">Asset</label>
              <AssetSelector 
                assets={assets} 
                selected={selectedAsset} 
                onSelect={setSelectedAsset} 
              />
            </motion.div>
          )}
          
          {/* Bidirectional Amount Inputs */}
          <motion.div 
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <label className="block text-blue-100/80 text-xs mb-1">
                Amount (KES) {inputMode === 'KES' && '●'}
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: "rgba(96, 165, 250, 0.5)" }}
                type="number"
                step="0.01"
                min="0"
                value={amountKES}
                onChange={(e) => handleKESChange(e.target.value)}
                onFocus={() => setInputMode('KES')}
                placeholder="0.00"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-blue-100/80 text-xs mb-1">
                Equivalent (XLM) {inputMode === 'XLM' && '●'}
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: "rgba(168, 85, 247, 0.5)" }}
                type="number"
                step="0.0000001"
                min="0"
                value={amountXLM}
                onChange={(e) => handleXLMChange(e.target.value)}
                onFocus={() => setInputMode('XLM')}
                placeholder="0.0000000"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>
          </motion.div>
          
          {/* Rate Display */}
          <motion.div 
            className="flex items-center justify-between text-xs text-blue-100/60 bg-black/20 rounded px-3 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span>1 KES ≈ {KES_TO_XLM_RATE} XLM</span>
            <span>1 XLM ≈ {XLM_TO_KES_RATE.toFixed(2)} KES</span>
          </motion.div>
          
          {/* Status Messages with Animation */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-400/30 rounded px-3 py-2 overflow-hidden"
              >
                <p className="text-red-300 text-xs">{error}</p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-400/30 rounded px-3 py-2 overflow-hidden"
              >
                <p className="text-green-300 text-xs">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Submit Button with Hover/Tap Animation */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !destination || !amountXLM || parseFloat(amountXLM) <= 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ⏳ Processing...
              </motion.span>
            ) : (
              'Review & Send'
            )}
          </motion.button>
        </form>
        
        {/* Helper Notes */}
        <motion.div 
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-blue-100/60 text-xs space-y-1">
            <p>• Fee: ~0.00001 XLM • Reserve: 1 XLM minimum</p>
            <p>• Testnet only • <a href="https://friendbot.stellar.org" target="_blank" rel="noopener" className="text-blue-300 hover:underline">Get test XLM</a></p>
          </p>
        </motion.div>
      </motion.div>

      {/* 🔐 Transaction Confirmation Modal */}
      <TransactionConfirmation
        isOpen={showConfirm}
        onConfirm={handleConfirmSend}
        onCancel={() => { setShowConfirm(false); setPendingTx(null); }}
        recipient={pendingTx?.to || ''}
        amount={pendingTx?.amount || '0'}
      />
    </>
  );
}