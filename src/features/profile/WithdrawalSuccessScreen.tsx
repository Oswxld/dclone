import React from 'react';
import moneyImg from './money/money.webp';

type WithdrawalSuccessScreenProps = {
  amount: string;
  coinSymbol: string;
  networkName: string;
  destination: string;
  onDone: () => void;
};

export const WithdrawalSuccessScreen: React.FC<WithdrawalSuccessScreenProps> = ({
  amount,
  coinSymbol,
  networkName,
  destination,
  onDone
}) => {
  // Format current date exactly like your mockup: 10/22/2026, 5:19:57 AM
  const currentDate = new Date().toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

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
      <div style={{ width: '100%', maxWidth: '608px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'rgb(255, 255, 255)', padding: '16px 18px 34px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(48, 53, 65)' }}>
            Withdraw {coinSymbol} ({networkName})
          </div>
          <div role="button" aria-label="Close" tabIndex={0} onClick={onDone} style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, width: '34px', height: '34px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#5c616d" strokeWidth="1.7" strokeLinecap="round" strokeLineJoin="round" width="18" height="18">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"></path>
            </svg>
          </div>
        </div>

        <div style={{ textAlign: 'center', flex: '1 1 0%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '0px' }}>
          <div style={{ width: '160px', margin: '0px auto' }}>
            <img src={moneyImg} alt="Success" style={{ width: '100%', display: 'block' }} />
          </div>
          <div style={{ fontSize: '27px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginTop: '18px' }}>
            -{amount} {coinSymbol}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(48, 53, 65)' }}>
            Withdrawal Initiated
          </div>

          <div style={{ background: 'rgb(246, 247, 248)', borderRadius: '14px', padding: '16px 18px', marginTop: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 0px' }}>
              <span style={{ fontSize: '13.5px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Status</span>
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'inherit' }}>Initiated</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 0px' }}>
              <span style={{ fontSize: '13.5px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Destination Address</span>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'monospace' }}>{destination}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 0px', borderBottomWidth: 'medium', borderBottomStyle: 'none', borderBottomColor: 'currentcolor' }}>
              <span style={{ fontSize: '13.5px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Date</span>
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'inherit' }}>{currentDate}</span>
            </div>
          </div>
        </div>

        <div 
          role="button" 
          tabIndex={0} 
          onClick={onDone}
          style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, marginTop: '0px', flex: '0 0 auto', background: 'rgb(255, 68, 79)', color: 'rgb(255, 255, 255)', textAlign: 'center', padding: '16px 0px', borderRadius: '26px', fontSize: '17px', fontWeight: 700 }}
        >
          Done
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