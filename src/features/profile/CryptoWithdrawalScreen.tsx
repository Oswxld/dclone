import React, { useState } from 'react';
// Coin imports matching your exact filenames
import tetherImg from './coins/tether.webp';
import usdcImg from './coins/USDC.webp';
import ltcImg from './coins/Litecoin.webp';
import btcImg from './coins/Bitcoin.webp';
import trxImg from './coins/TRX.webp';
import bnbImg from './coins/BNB.webp';
import solImg from './coins/Solana.webp';
import dogeImg from './coins/DodgeCoin.webp';
import adaImg from './coins/Cardano.webp';
import avaxImg from './coins/Avax.webp';
import polImg from './coins/pol.webp';

type CryptoWithdrawalScreenProps = {
  onBack: () => void;
  onSelectCoin: (coinId: string) => void; // <-- ADDED THIS
};

const cryptoOptions = [
  { id: 'USDT', name: 'Tether', symbol: 'USDT', img: tetherImg, recommended: true },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC', img: usdcImg, recommended: true },
  { id: 'LTC', name: 'Litecoin', symbol: 'LTC', img: ltcImg },
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', img: btcImg },
  { id: 'TRX', name: 'TRX', symbol: 'TRX', img: trxImg },
  { id: 'BNB', name: 'BNB', symbol: 'BNB', img: bnbImg },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', img: solImg },
  { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE', img: dogeImg },
  { id: 'ADA', name: 'Cardano', symbol: 'ADA', img: adaImg },
  { id: 'AVAX', name: 'AVAX (Avalanche C-Chain)', symbol: 'AVAX', img: avaxImg },
  { id: 'POL', name: 'POL (Polygon Network)', symbol: 'POL', img: polImg },
];

export const CryptoWithdrawalScreen: React.FC<CryptoWithdrawalScreenProps> = ({ onBack, onSelectCoin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cheap'>('all');

  // Filter logic based on search input
  const filteredOptions = cryptoOptions.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      animation: '0.3s ease-out 0s 1 normal none running slideInRight',
      fontFamily: 'Inter, "IBM Plex Sans", sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '608px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {/* Sticky Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#ffffff', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            type="button" 
            onClick={onBack}
            style={{ display: 'flex', height: '32px', width: '32px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="#404040" strokeWidth="2.5" strokeLinecap="round" strokeLineJoin="round">
              <path d="M20 12H4.5M10.5 5.5 4 12l6.5 6.5"></path>
            </svg>
          </button>

          {/* Ask Amy Live Chat */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button 
              type="button" 
              style={{ display: 'flex', flexShrink: 0, height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#404040" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5 8.5 8.5 0 0 1 8.5 8.5z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '0 16px', flex: 1, overflowY: 'auto' }}>
          <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 800, color: '#171717', margin: '0 0 20px 0' }}>Select crypto</h1>
          
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a3a3a3', pointerEvents: 'none' }} fill="currentColor">
              <path d="M21 14.625c0-2.422-1.328-4.687-3.437-5.937-2.149-1.211-4.766-1.211-6.875 0a6.87 6.87 0 0 0-3.438 5.937 6.89 6.89 0 0 0 3.438 5.977c2.109 1.21 4.726 1.21 6.874 0 2.11-1.25 3.438-3.516 3.438-5.977m-1.602 6.172c-1.406 1.25-3.28 1.953-5.273 1.953A8.12 8.12 0 0 1 6 14.625C6 10.172 9.633 6.5 14.125 6.5c4.453 0 8.125 3.672 8.125 8.125 0 2.031-.742 3.867-1.953 5.313l5.508 5.507a.66.66 0 0 1 0 .899.66.66 0 0 1-.899 0z"></path>
            </svg>
            <input 
              type="search" 
              placeholder="Search by name or network" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', borderRadius: '12px', border: '1px solid #e5e5e5', backgroundColor: '#ffffff', padding: '10px 10px 10px 40px', fontSize: '16px', color: '#171717', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
            <button 
              type="button" 
              onClick={() => setActiveFilter('all')}
              style={{ flexShrink: 0, cursor: 'pointer', borderRadius: '9999px', border: activeFilter === 'all' ? '1px solid #171717' : '1px solid #e5e5e5', padding: '6px 16px', fontSize: '14px', fontWeight: 500, backgroundColor: activeFilter === 'all' ? 'rgba(0,0,0,0.04)' : 'transparent', color: activeFilter === 'all' ? '#171717' : '#737373' }}
            >
              All
            </button>
            <button 
              type="button" 
              onClick={() => setActiveFilter('cheap')}
              style={{ flexShrink: 0, cursor: 'pointer', borderRadius: '9999px', border: activeFilter === 'cheap' ? '1px solid #171717' : '1px solid #e5e5e5', padding: '6px 16px', fontSize: '14px', fontWeight: 500, backgroundColor: activeFilter === 'cheap' ? 'rgba(0,0,0,0.04)' : 'transparent', color: activeFilter === 'cheap' ? '#171717' : '#737373' }}
            >
              Lower fees
            </button>
          </div>

          {/* Crypto Grid/List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>
            {filteredOptions.map((coin) => (
              <button 
                key={coin.id}
                type="button" 
                onClick={() => onSelectCoin(coin.id)} // <-- TRIGGER THE FUNCTION HERE
                style={{ position: 'relative', display: 'flex', width: '100%', alignItems: 'center', gap: '12px', borderRadius: '12px', backgroundColor: '#f9fafb', padding: '16px', textAlign: 'left', border: 'none', cursor: 'pointer' }}
              >
                <img src={coin.img} alt={coin.name} width="32" height="32" style={{ flexShrink: 0, objectFit: 'contain' }} />
                <div style={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', gap: '2px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#171717' }}>{coin.name}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', fontSize: '14px', color: '#737373' }}>{coin.symbol}</span>
                </div>
                {coin.recommended && (
                  <span style={{ flexShrink: 0, borderRadius: '6px', backgroundColor: '#e6fce5', padding: '2px 8px', fontSize: '12px', fontWeight: 600, color: '#008a00' }}>
                    Recommended
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
};