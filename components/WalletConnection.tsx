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
    try {
      const { address } = await stellar.kit.getAddress();
      if (address) {
        setPublicKey(address);
        setIsConnected(true);
        onConnect(address);
      }
    } catch (error) {
      console.log('No existing wallet connection');
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
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="bg-plum-card backdrop-blur-md rounded-xl p-6 border border-[#f0e442]/20">
        <h2 className="text-lg font-bold hype-plum mb-4">🔐 Connect Your Wallet</h2>
        <p className="text-[#fdf2ff]/70 mb-6 text-sm">
          Connect your Stellar wallet to view your balance and make transactions.
        </p>
        
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full plum-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 plum-glow"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
              Connecting...
            </>
          ) : (
            <>
              <FaWallet className="text-xl" />
              Connect Wallet
            </>
          )}
        </button>

        <div className="mt-6 p-4 bg-[#f0e442]/10 border border-[#f0e442]/30 rounded-lg">
          <p className="text-[#fdf2ff]/70 text-sm mb-3">
            💡 <strong className="text-[#f0e442]">Supported Wallets</strong>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#fdf2ff]/60">
            <div>✓ Freighter</div>
            <div>✓ xBull</div>
            <div>✓ Albedo</div>
            <div>✓ Rabet</div>
            <div>✓ Lobstr</div>
            <div>✓ Hana</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-plum-card backdrop-blur-md rounded-xl p-6 border border-[#f0e442]/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#f0e442] rounded-full animate-pulse"></div>
          <span className="text-[#fdf2ff]/70 text-sm">Connected</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-[#d846d8] hover:text-[#f0e442] text-sm flex items-center gap-2 transition-colors"
        >
          <MdLogout /> Disconnect
        </button>
      </div>

      <div className="bg-[#1a051a]/60 rounded-xl p-4 border border-[#f0e442]/10">
        <p className="text-[#fdf2ff]/60 text-xs mb-2">Your Address</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[#fdf2ff] font-mono text-sm break-all">
            {publicKey}
          </p>
          <button
            onClick={handleCopyAddress}
            className="text-[#d846d8] hover:text-[#f0e442] text-xl flex-shrink-0 transition-colors"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? <FaCheck className="text-[#f0e442]" /> : <FaCopy />}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <a
          href={stellar.getExplorerLink(publicKey, 'account')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#d846d8] hover:text-[#f0e442] text-sm underline"
        >
          View on Stellar Expert →
        </a>
      </div>
    </div>
  );
}