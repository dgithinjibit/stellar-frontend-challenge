'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaWallet, FaCopy, FaCheck } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';

interface WalletConnectionProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    // We use the helper's method instead of accessing private 'kit'
    const address = await stellar.getPublicKey();
    if (address) {
      setPublicKey(address);
      setIsConnected(true);
      onConnect(address);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const key = await stellar.connectWallet();
      setPublicKey(key);
      setIsConnected(true);
      onConnect(key);
    } catch (error: any) {
      console.error('Connection error:', error);
      if (!error.message?.includes('cancelled') && !error.message?.includes('rejected')) {
        alert(`Failed to connect wallet:\n${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
    onDisconnect();
  };

  const handleCopyAddress = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="bg-plum-card backdrop-blur-md rounded-xl p-6 border border-[#f0e442]/20">
        <h2 className="text-lg font-bold hype-plum mb-4">🔐 Connect Your Wallet</h2>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full plum-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 plum-glow"
        >
          {loading ? 'Connecting...' : <><FaWallet /> Connect Wallet</>}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-plum-card backdrop-blur-md rounded-xl p-6 border border-[#f0e442]/20">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[#fdf2ff]/70 text-sm">Connected</span>
        <button onClick={handleDisconnect} className="text-[#d846d8] text-sm flex items-center gap-2">
          <MdLogout /> Disconnect
        </button>
      </div>
      <div className="bg-[#1a051a]/60 rounded-xl p-4 border border-[#f0e442]/10 flex items-center justify-between">
        <p className="text-[#fdf2ff] font-mono text-sm truncate mr-2">{publicKey}</p>
        <button onClick={handleCopyAddress} className="text-[#d846d8] hover:text-[#f0e442]">
          {copied ? <FaCheck className="text-[#f0e442]" /> : <FaCopy />}
        </button>
      </div>
    </div>
  );
}