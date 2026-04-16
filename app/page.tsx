'use client';

import { useState, useEffect } from 'react';
import WalletConnection from '@/components/WalletConnection';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';
import TransactionHistory from '@/components/TransactionHistory';

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
  };

  const handlePaymentSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen relative">
      {/* Dot grid background is applied via globals.css */}
      
      {/* Header */}
      <header className="border-b border-yellow-500/10 backdrop-blur-md bg-plum-dark/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo with S + star */}
              <div className="w-12 h-12 plum-gradient rounded-xl flex items-center justify-center relative plum-glow">
                <span className="text-white font-bold text-xl">S</span>
                <span className="absolute -top-1 -right-1 text-[#f0e442] text-xs">✦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold hype-plum">Stellar Payment Dashboard</h1>
                <p className="text-[#fdf2ff]/60 text-xs">Kenya Testnet Interface</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fdf2ff]/60 hover:text-[#f0e442] text-xs transition-colors"
              >
                Stellar Docs
              </a>
              <a
                href="https://www.risein.com/en/home"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fdf2ff]/60 hover:text-[#f0e442] text-xs transition-colors"
              >
                Source
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {/* Welcome Banner */}
        {!isConnected && (
          <div className="mb-6 bg-plum-card border border-[#f0e442]/20 rounded-xl p-6 text-center plum-glow">
            <h2 className="text-2xl font-bold hype-plum mb-2">
              Stellar Payments for Kenya
            </h2>
            <p className="text-[#fdf2ff]/80 max-w-2xl mx-auto text-sm">
              Connect your wallet to send and receive XLM payments. Built for farmers and traders across Kenya with M-Pesa integration and 2G network optimization.
            </p>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="mb-6">
          <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
        </div>

        {/* Dashboard Content - Only show when connected */}
        {isConnected && publicKey && (
          <div className="space-y-6">
            {/* Balance Section */}
            <div key={`balance-${refreshKey}`}>
              <BalanceDisplay publicKey={publicKey} />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Payment Form */}
              <div>
                <PaymentForm publicKey={publicKey} onSuccess={handlePaymentSuccess} />
              </div>

              {/* Transaction History */}
              <div key={`history-${refreshKey}`}>
                <TransactionHistory publicKey={publicKey} />
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-plum-card backdrop-blur-md rounded-lg p-5 border border-[#f0e442]/10 hover:border-[#f0e442]/30 transition-colors">
                <div className="text-2xl mb-2 text-[#f0e442]">⚡</div>
                <h3 className="text-[#fdf2ff] font-medium mb-1 text-sm">Fast Settlement</h3>
                <p className="text-[#fdf2ff]/70 text-xs">
                  Transactions confirm in 3-5 seconds on Stellar
                </p>
              </div>

              <div className="bg-plum-card backdrop-blur-md rounded-lg p-5 border border-[#f0e442]/10 hover:border-[#f0e442]/30 transition-colors">
                <div className="text-2xl mb-2 text-[#d846d8]">💱</div>
                <h3 className="text-[#fdf2ff] font-medium mb-1 text-sm">KES Conversion</h3>
                <p className="text-[#fdf2ff]/70 text-xs">
                  Auto-convert M-Pesa amounts to XLM at live rates
                </p>
              </div>

              <div className="bg-plum-card backdrop-blur-md rounded-lg p-5 border border-[#f0e442]/10 hover:border-[#f0e442]/30 transition-colors">
                <div className="text-2xl mb-2 text-[#f0e442]">📱</div>
                <h3 className="text-[#fdf2ff] font-medium mb-1 text-sm">2G Optimized</h3>
                <p className="text-[#fdf2ff]/70 text-xs">
                  Lightweight design for low-bandwidth networks
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started - Only show when not connected */}
        {!isConnected && (
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '1', title: 'Install Wallet', desc: 'Use Freighter, xBull, or Lobstr for Stellar testnet' },
              { num: '2', title: 'Connect', desc: 'Approve the connection request in your wallet extension' },
              { num: '3', title: 'Fund Account', desc: 'Use Friendbot to get free testnet XLM for testing' },
              { num: '4', title: 'Send Payments', desc: 'Transfer XLM to farmers, suppliers, or markets instantly' },
            ].map((step) => (
              <div key={step.num} className="bg-plum-card backdrop-blur-md rounded-lg p-5 border border-[#f0e442]/10">
                <div className="w-8 h-8 plum-gradient rounded flex items-center justify-center mb-3 text-sm font-bold text-white">
                  {step.num}
                </div>
                <h3 className="text-[#fdf2ff] font-medium mb-1 text-sm">{step.title}</h3>
                <p className="text-[#fdf2ff]/70 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Kenyan Farmer Profiles */}
        {!isConnected && (
          <div className="mt-8 bg-plum-card rounded-xl p-6 border border-[#f0e442]/20">
            <h3 className="text-[#fdf2ff] font-semibold mb-4 text-sm hype-plum">Sample Use Cases</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#1a051a]/60 rounded-lg p-4 border border-[#f0e442]/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#f0e442]/20 rounded-full flex items-center justify-center text-[#f0e442] font-bold">
                    J
                  </div>
                  <div>
                    <p className="text-[#fdf2ff] font-medium text-sm">John Mwangi</p>
                    <p className="text-[#fdf2ff]/60 text-xs">Nyeri Coffee Farmer</p>
                  </div>
                </div>
                <p className="text-[#fdf2ff]/70 text-xs">
                  Receives XLM payments from international buyers. Converts to KES via M-Pesa for local expenses.
                </p>
              </div>
              
              <div className="bg-[#1a051a]/60 rounded-lg p-4 border border-[#f0e442]/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#d846d8]/20 rounded-full flex items-center justify-center text-[#d846d8] font-bold">
                    W
                  </div>
                  <div>
                    <p className="text-[#fdf2ff] font-medium text-sm">Wangari Ochieng</p>
                    <p className="text-[#fdf2ff]/60 text-xs">Kisumu Maize Trader</p>
                  </div>
                </div>
                <p className="text-[#fdf2ff]/70 text-xs">
                  Sends XLM to suppliers for seed purchases. Tracks all transactions in real-time on mobile.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#f0e442]/10 mt-12 bg-plum-dark/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-[#fdf2ff]/50 text-xs">
            <p className="mb-1">
              Built with Stellar SDK | Testnet Environment
            </p>
            <p>
              Warning: This is a testnet application. Do not use real funds.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}