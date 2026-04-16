'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Stellar Payment Dashboard</h1>
                <p className="text-blue-100/70 text-xs">Kenya Testnet Interface</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100/70 hover:text-white text-xs transition-colors"
              >
                Stellar Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100/70 hover:text-white text-xs transition-colors"
              >
                Source
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        {!isConnected && (
          <div className="mb-6 bg-gradient-to-r from-blue-500/15 to-purple-600/15 border border-blue-400/25 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Stellar Payments for Kenya
            </h2>
            <p className="text-blue-100/80 max-w-2xl mx-auto text-sm">
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
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
                <div className="text-2xl mb-2 text-blue-400">⚡</div>
                <h3 className="text-white font-medium mb-1 text-sm">Fast Settlement</h3>
                <p className="text-blue-100/70 text-xs">
                  Transactions confirm in 3-5 seconds on Stellar
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
                <div className="text-2xl mb-2 text-purple-400">💱</div>
                <h3 className="text-white font-medium mb-1 text-sm">KES Conversion</h3>
                <p className="text-blue-100/70 text-xs">
                  Auto-convert M-Pesa amounts to XLM at live rates
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
                <div className="text-2xl mb-2 text-indigo-400">📱</div>
                <h3 className="text-white font-medium mb-1 text-sm">2G Optimized</h3>
                <p className="text-blue-100/70 text-xs">
                  Lightweight design for low-bandwidth networks
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started - Only show when not connected */}
        {!isConnected && (
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
              <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center mb-3 text-sm font-bold text-blue-300">
                1
              </div>
              <h3 className="text-white font-medium mb-1 text-sm">Install Wallet</h3>
              <p className="text-blue-100/70 text-xs">
                Use Freighter, xBull, or Lobstr for Stellar testnet
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
              <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center mb-3 text-sm font-bold text-purple-300">
                2
              </div>
              <h3 className="text-white font-medium mb-1 text-sm">Connect</h3>
              <p className="text-blue-100/70 text-xs">
                Approve the connection request in your wallet extension
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
              <div className="w-8 h-8 bg-pink-500/20 rounded flex items-center justify-center mb-3 text-sm font-bold text-pink-300">
                3
              </div>
              <h3 className="text-white font-medium mb-1 text-sm">Fund Account</h3>
              <p className="text-blue-100/70 text-xs">
                Use Friendbot to get free testnet XLM for testing
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
              <div className="w-8 h-8 bg-indigo-500/20 rounded flex items-center justify-center mb-3 text-sm font-bold text-indigo-300">
                4
              </div>
              <h3 className="text-white font-medium mb-1 text-sm">Send Payments</h3>
              <p className="text-blue-100/70 text-xs">
                Transfer XLM to farmers, suppliers, or markets instantly
              </p>
            </div>
          </div>
        )}

        {/* Kenyan Farmer Profiles */}
        {!isConnected && (
          <div className="mt-8 bg-gradient-to-r from-blue-800/30 to-purple-800/30 rounded-xl p-6 border border-blue-400/20">
            <h3 className="text-white font-semibold mb-4 text-sm">Sample Use Cases</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-300 font-bold">
                    J
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">John Mwangi</p>
                    <p className="text-blue-100/60 text-xs">Nyeri Coffee Farmer</p>
                  </div>
                </div>
                <p className="text-blue-100/70 text-xs">
                  Receives XLM payments from international buyers. Converts to KES via M-Pesa for local expenses.
                </p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-300 font-bold">
                    W
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Wangari Ochieng</p>
                    <p className="text-blue-100/60 text-xs">Kisumu Maize Trader</p>
                  </div>
                </div>
                <p className="text-blue-100/70 text-xs">
                  Sends XLM to suppliers for seed purchases. Tracks all transactions in real-time on mobile.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-blue-100/50 text-xs">
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