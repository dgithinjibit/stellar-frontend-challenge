'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import WalletConnection from '@/components/WalletConnection';
import BalanceDisplay from '@/components/BalanceDisplay';
import PaymentForm from '@/components/PaymentForm';
import TransactionHistory from '@/components/TransactionHistory';
import { ThemeToggle, BalanceChart, AddressBook, AnimatedCard } from '@/components/BonusFeatures';

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [assets, setAssets] = useState<Array<{ code: string; issuer: string; balance: string }>>([]);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
    setAssets([]);
    setSelectedAddress('');
  };

  const handlePaymentSuccess = () => {
    setRefreshKey(prev => prev + 1);
    if (publicKey) fetchAssets(publicKey);
  };

  const fetchAssets = async (key: string) => {
    try {
      const data = await stellar.getBalance(key);
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchAssets(publicKey);
    }
  }, [publicKey, refreshKey]);

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="border-b border-yellow-500/10 backdrop-blur-md bg-plum-dark/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              <ThemeToggle />
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-[#fdf2ff]/60 hover:text-[#f0e442] text-xs transition-colors hidden sm:inline">Stellar Docs</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {!isConnected && (
          <AnimatedCard>
            <div className="mb-6 bg-plum-card border border-[#f0e442]/20 rounded-xl p-6 text-center plum-glow">
              <h2 className="text-2xl font-bold hype-plum mb-2">Stellar Payments for Kenya</h2>
              <p className="text-[#fdf2ff]/80 max-w-2xl mx-auto text-sm">
                Connect your wallet to send and receive XLM payments. Built for farmers and traders across Kenya.
              </p>
            </div>
          </AnimatedCard>
        )}

        <AnimatedCard delay={50}>
          <div className="mb-6">
            <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </div>
        </AnimatedCard>

        {isConnected && publicKey && (
          <div className="space-y-6">
            <AnimatedCard delay={100}>
              <div key={`balance-${refreshKey}`} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BalanceDisplay publicKey={publicKey} />
                </div>
                <div className="lg:col-span-1">
                  {/* ✅ PASSING PUBLIC KEY FOR REAL DATA */}
                  <BalanceChart publicKey={publicKey} />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={150}>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <PaymentForm 
                    publicKey={publicKey} 
                    onSuccess={handlePaymentSuccess}
                    prefillAddress={selectedAddress}
                    assets={assets}
                  />
                </div>
                <div>
                  <AddressBook onSelect={setSelectedAddress} />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div key={`history-${refreshKey}`}>
                <TransactionHistory publicKey={publicKey} />
              </div>
            </AnimatedCard>

            <AnimatedCard delay={250}>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', title: 'Fast Settlement', desc: 'Transactions confirm in 3-5 seconds on Stellar', color: 'text-[#f0e442]' },
                  { icon: '💱', title: 'KES Conversion', desc: 'Auto-convert M-Pesa amounts to XLM at live rates', color: 'text-[#d846d8]' },
                  { icon: '📱', title: '2G Optimized', desc: 'Lightweight design for low-bandwidth networks', color: 'text-[#f0e442]' },
                ].map((f, i) => (
                  <div key={i} className="bg-plum-card backdrop-blur-md rounded-lg p-5 border border-[#f0e442]/10 hover:border-[#f0e442]/30 transition-colors">
                    <div className={`text-2xl mb-2 ${f.color}`}>{f.icon}</div>
                    <h3 className="text-[#fdf2ff] font-medium mb-1 text-sm">{f.title}</h3>
                    <p className="text-[#fdf2ff]/70 text-xs">{f.desc}</p>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>
        )}

        {!isConnected && (
          <AnimatedCard delay={100}>
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
          </AnimatedCard>
        )}
      </main>

      <footer className="border-t border-[#f0e442]/10 mt-12 bg-plum-dark/50">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-[#fdf2ff]/50 text-xs">
          <p>Built with Stellar SDK | Testnet Environment</p>
          <p>Warning: This is a testnet application. Do not use real funds.</p>
        </div>
      </footer>
    </div>
  );
}