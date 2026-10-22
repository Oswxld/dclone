import React, { useState } from 'react';

// Coin imports based on the exact filenames you provided
import aptosImg from './tether/Aptos.webp';
import arbitrumImg from './tether/Arbitum.webp';
import avalancheImg from './tether/Avalanche.webp';
import bscImg from './tether/Bnb_smart_chain.webp';
import ethereumImg from './tether/Ethereum.webp';
import opbnbImg from './tether/opBnb.webp';
import polygonImg from './tether/polygon.webp';
import solanaImg from './tether/Solana.webp';
import tronImg from './tether/Tron.webp';

type UsdtNetworkScreenProps = {
  onBack: () => void;
  onSelectNetwork: (networkId: string) => void; // <-- ADDED THIS PROP
};

// Updated to exact minimum withdrawal amounts
const networks = [
  { id: 'usdt_tron', name: 'Tron', minWithdrawal: '10 USDT (10 USD)', arrival: '~1m', img: tronImg },
  { id: 'usdt_bsc', name: 'BNB Smart Chain', minWithdrawal: '5 USDT (5 USD)', arrival: '~5m', img: bscImg },
  { id: 'usdt_aptos', name: 'Aptos', minWithdrawal: '5 USDT (5 USD)', arrival: '~5m', img: aptosImg },
  { id: 'usdt_solana', name: 'Solana', minWithdrawal: '5 USDT (5 USD)', arrival: '~1m', img: solanaImg },
  { id: 'usdt_polygon', name: 'Polygon', minWithdrawal: '5 USDT (5 USD)', arrival: '~10m', img: polygonImg },
  { id: 'usdt_ethereum', name: 'Ethereum', minWithdrawal: '20 USDT (20 USD)', arrival: '~10m', img: ethereumImg },
  { id: 'usdt_avalanche', name: 'Avalanche', minWithdrawal: '5 USDT (5 USD)', arrival: '~2m', img: avalancheImg },
  { id: 'usdt_arbitrum', name: 'Arbitrum', minWithdrawal: '5 USDT (5 USD)', arrival: '~10m', img: arbitrumImg },
  { id: 'usdt_opbnb', name: 'opBNB', minWithdrawal: '5 USDT (5 USD)', arrival: '~2m', img: opbnbImg },
];

export const UsdtNetworkScreen: React.FC<UsdtNetworkScreenProps> = ({ onBack, onSelectNetwork }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'cheap'>('all');

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
            style={{ display: 'flex', height: '32px', width: '32px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" fill="currentColor" style={{ color: '#404040' }}>
              <path d="m7.602 15.64 6.25-6.25a1.205 1.205 0 0 1 1.757 0c.508.47.508 1.29 0 1.758l-4.101 4.102H23.5c.664 0 1.25.586 1.25 1.25 0 .703-.586 1.25-1.25 1.25H11.508l4.101 4.14c.508.47.508 1.29 0 1.758a1.205 1.205 0 0 1-1.757 0l-6.25-6.25a1.205 1.205 0 0 1 0-1.757"></path>
            </svg>
          </button>

          {/* Ask Amy Live Chat */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button 
              type="button" 
              style={{ display: 'flex', flexShrink: 0, height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              <img alt="Live chat" width="32" height="32" src="/dashboard/images/livechat_button.svg" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '0 16px', flex: 1, overflowY: 'auto' }}>
          <h1 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 700, color: '#171717', margin: '0 0 20px 0' }}>Choose USDT network</h1>
          
          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', overflowX: 'auto', marginBottom: '24px' }}>
            <button 
              type="button" 
              onClick={() => setActiveFilter('all')}
              style={{ flexShrink: 0, cursor: 'pointer', borderRadius: '9999px', border: activeFilter === 'all' ? '1px solid #171717' : '1px solid #e5e5e5', padding: '6px 16px', fontSize: '14px', fontWeight: 500, backgroundColor: activeFilter === 'all' ? 'rgba(0,0,0,0.04)' : 'transparent', color: activeFilter === 'all' ? '#171717' : '#525252', transition: 'all 0.2s' }}
            >
              All
            </button>
            <button 
              type="button" 
              onClick={() => setActiveFilter('cheap')}
              style={{ flexShrink: 0, cursor: 'pointer', borderRadius: '9999px', border: activeFilter === 'cheap' ? '1px solid #171717' : '1px solid #e5e5e5', padding: '6px 16px', fontSize: '14px', fontWeight: 500, backgroundColor: activeFilter === 'cheap' ? 'rgba(0,0,0,0.04)' : 'transparent', color: activeFilter === 'cheap' ? '#171717' : '#525252', transition: 'all 0.2s' }}
            >
              Lower fees
            </button>
          </div>

          {/* Network List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>
            {networks.map((network) => (
              <button 
                key={network.id}
                type="button" 
                onClick={() => onSelectNetwork(network.id)} // <-- FIRE THE CALLBACK HERE
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '16px', borderRadius: '12px', backgroundColor: '#f9fafb', padding: '16px', textAlign: 'left', border: '1px solid transparent', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                <div style={{ flexShrink: 0 }}>
                  <img src={network.img} alt={network.name} width="48" height="48" style={{ flexShrink: 0, objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#171717', margin: '0 0 2px 0' }}>{network.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)', margin: '0 0 2px 0' }}>Min withdrawal: {network.minWithdrawal}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)', margin: 0 }}>Withdrawal arrival {network.arrival}</p>
                </div>
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