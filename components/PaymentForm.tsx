'use client';

import { useState, useCallback } from 'react';
import { stellar } from '@/lib/stellar-helper';

interface PaymentFormProps {
  publicKey: string;
  onSuccess: () => void;
}

// Conversion constants - replace with live API in production
const KES_TO_XLM_RATE = 0.085;
const XLM_TO_KES_RATE = 1 / KES_TO_XLM_RATE;
const STELLAR_DECIMALS = 7;

export default function PaymentForm({ publicKey, onSuccess }: PaymentFormProps) {
  const [destination, setDestination] = useState('');
  const [amountKES, setAmountKES] = useState('');
  const [amountXLM, setAmountXLM] = useState('');
  const [inputMode, setInputMode] = useState<'KES' | 'XLM'>('KES');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  // Parse errors from stellar-helper.ts responses
  const parseHelperError = (err: any): string => {
    const message = err?.message?.toLowerCase() || '';
    
    // Common error patterns from Stellar Wallets Kit + Horizon
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
    
    // Fallback: extract helpful parts from error message
    if (err?.message) {
      return `Transaction failed: ${err.message}`;
    }
    
    return 'Transaction failed. Check console for details and try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!destination.trim()) {
      setError('Please enter a recipient address');
      return;
    }
    
    if (!isValidStellarAddress(destination)) {
      setError('Invalid address. Must be 56 chars starting with "G"');
      return;
    }
    
    const finalAmount = inputMode === 'KES' ? amountXLM : amountXLM;
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    const formattedAmount = formatStellarAmount(finalAmount);
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // ✅ CORRECT CALL PATTERN FOR stellar-helper.ts
      const result = await stellar.sendPayment({
        from: publicKey,
        to: destination.trim(),
        amount: formattedAmount,
        // memo: optional (uncomment if needed)
      });
      
      if (result.success) {
        setSuccessMessage(`Sent ${formattedAmount} XLM successfully!`);
        onSuccess(); // Refresh parent components
        
        // Reset form
        setDestination('');
        setAmountKES('');
        setAmountXLM('');
      } else {
        throw new Error('Transaction not confirmed on network');
      }
      
    } catch (err: any) {
      console.error('Payment error:', err);
      const userMessage = parseHelperError(err);
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
      <h3 className="text-white font-semibold mb-4 text-sm">Send Payment</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Address */}
        <div>
          <label className="block text-blue-100/80 text-xs mb-1">Recipient Address</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setError('');
            }}
            placeholder="GABC...XYZ"
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 font-mono"
            required
            maxLength={56}
          />
        </div>
        
        {/* Bidirectional Amount Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-blue-100/80 text-xs mb-1">
              Amount (KES) {inputMode === 'KES' && '●'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amountKES}
              onChange={(e) => handleKESChange(e.target.value)}
              onFocus={() => setInputMode('KES')}
              placeholder="0.00"
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-blue-100/80 text-xs mb-1">
              Equivalent (XLM) {inputMode === 'XLM' && '●'}
            </label>
            <input
              type="number"
              step="0.0000001"
              min="0"
              value={amountXLM}
              onChange={(e) => handleXLMChange(e.target.value)}
              onFocus={() => setInputMode('XLM')}
              placeholder="0.0000000"
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
        
        {/* Rate Display */}
        <div className="flex items-center justify-between text-xs text-blue-100/60 bg-black/20 rounded px-3 py-2">
          <span>1 KES ≈ {KES_TO_XLM_RATE} XLM</span>
          <span>1 XLM ≈ {XLM_TO_KES_RATE.toFixed(2)} KES</span>
        </div>
        
        {/* Status Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded px-3 py-2">
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-500/10 border border-green-400/30 rounded px-3 py-2">
            <p className="text-green-300 text-xs">{successMessage}</p>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !destination || !amountXLM || parseFloat(amountXLM) <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
        >
          {loading ? 'Processing...' : 'Send Payment'}
        </button>
      </form>
      
      {/* Helper Notes */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-blue-100/60 text-xs space-y-1">
          <p>• Fee: ~0.00001 XLM • Reserve: 1 XLM minimum</p>
          <p>• Testnet only • <a href="https://friendbot.stellar.org" target="_blank" rel="noopener" className="text-blue-300 hover:underline">Get test XLM</a></p>
        </p>
      </div>
    </div>
  );
}