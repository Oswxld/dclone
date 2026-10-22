import React, { useState, useEffect } from 'react';

type ReviewWithdrawalScreenProps = {
  amount: string;
  coinSymbol: string;
  networkName: string;
  destination: string;
  onBack: () => void;
  onConfirm: () => void;
};

export const ReviewWithdrawalScreen: React.FC<ReviewWithdrawalScreenProps> = ({
  amount,
  coinSymbol,
  networkName,
  destination,
  onBack,
  onConfirm
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      // Simulate network processing delay for 2 seconds
      const timer = setTimeout(() => {
        onConfirm();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, onConfirm]);

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
        
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 24px 0', textAlign: 'center', flex: 1 }}>
            <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '24px' }}>
              <svg viewBox="0 0 64 64" width="64" height="64" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255, 68, 79, 0.2)" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#ff444f" strokeWidth="4" strokeDasharray="44 176" strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#ff444f', fontSize: '32px', fontWeight: 900, fontFamily: 'system-ui, -apple-system, sans-serif', transform: 'skewX(-18deg)', marginTop: '-4px', marginLeft: '-2px' }}>
                  d
                </span>
              </div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginBottom: '12px' }}>
              Processing your withdrawal...
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '22px', gap: '14px' }}>
              <div role="button" aria-label="Back" tabIndex={0} onClick={onBack} style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, width: '40px', height: '40px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" width="20" height="20">
                  <path d="M20 12H4.5M10.5 5.5 4 12l6.5 6.5"></path>
                </svg>
              </div>
              <div style={{ fontSize: '21px', fontWeight: 700, color: 'rgb(56, 61, 74)' }}>
                Review Withdrawal
              </div>
            </div>

            <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '0px' }}>
              <div style={{ background: 'rgb(246, 247, 248)', borderRadius: '14px', padding: '6px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 0px' }}>
                  <span style={{ fontSize: '14px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Withdrawal Amount</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'inherit' }}>{amount} {coinSymbol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 0px' }}>
                  <span style={{ fontSize: '14px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Withdrawal Method</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'inherit' }}>Crypto</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 0px' }}>
                  <span style={{ fontSize: '14px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Network</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'inherit' }}>{networkName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 0px' }}>
                  <span style={{ fontSize: '14px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Destination</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'monospace' }}>{destination}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 0px', borderBottomWidth: 'medium', borderBottomStyle: 'none', borderBottomColor: 'currentcolor' }}>
                  <span style={{ fontSize: '14px', color: 'rgb(92, 97, 109)', flex: '0 0 auto' }}>Fee</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(48, 53, 65)', textAlign: 'right', wordBreak: 'break-all', fontFamily: 'inherit' }}>\$0.00 USD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0px', borderTop: '1.5px solid rgb(177, 180, 188)' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(48, 53, 65)' }}>Total</span>
                  <span style={{ fontSize: '17px', fontWeight: 700, color: 'rgb(48, 53, 65)' }}>{amount} {coinSymbol}</span>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'rgb(92, 97, 109)', marginTop: '14px', textAlign: 'center' }}>
                Please verify your withdrawal details before confirming.
              </div>

              <div 
                role="button" 
                tabIndex={0} 
                onClick={() => setIsProcessing(true)}
                style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, marginTop: '18px', background: 'rgb(255, 68, 79)', color: 'rgb(255, 255, 255)', textAlign: 'center', padding: '16px 0px', borderRadius: '26px', fontSize: '17px', fontWeight: 700 }}
              >
                Confirm Withdrawal
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
};