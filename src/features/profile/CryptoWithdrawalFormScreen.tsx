import React, { useState } from 'react';

type CryptoWithdrawalFormScreenProps = {
  networkName?: string;
  coinSymbol?: string;
  onClose: () => void;
  onWithdraw: (amount: string, address: string) => void;
};

export const CryptoWithdrawalFormScreen: React.FC<CryptoWithdrawalFormScreenProps> = ({ 
  networkName = 'Tron', 
  coinSymbol = 'USDT', 
  onClose,
  onWithdraw
}) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  // Proper React state for input focus
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const availableBalance = 1750.00;
  const exchangeRate = 0.999625;
  const minAmount = 10.00;

  const numAmount = parseFloat(amount) || 0;
  const isAddressValid = address.trim().length > 10; 
  const isAmountValid = numAmount >= minAmount && numAmount <= availableBalance;
  const isValid = isAddressValid && isAmountValid;

  const handlePercentClick = (percent: number) => {
    const calculated = (availableBalance * (percent / 100));
    setAmount(calculated.toFixed(2));
  };

  // Safe handler to allow only numbers and a single decimal point
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d*\$/.test(val)) {
      setAmount(val);
    }
  };

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
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ width: '32px' }}></div>
          
          <div style={{ background: 'linear-gradient(90deg, rgb(237, 235, 255), rgb(255, 233, 243))', borderRadius: '20px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: 'rgb(91, 61, 189)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13.2 2.6 15 8l5.4 1.8L15 11.6 13.2 17l-1.8-5.4L6 9.8 11.4 8l1.8-5.4Z" fill="url(#spg)"></path>
              <path d="M6.2 15.4 7.1 18l2.6.9-2.6.9-.9 2.6-.9-2.6L2.7 19l2.6-.9.9-2.6Z" fill="#7FD5FF"></path>
              <defs>
                <linearGradient id="spg" x1="6" y1="3" x2="20" y2="17">
                  <stop stopColor="#8FE1FF"></stop>
                  <stop offset=".5" stopColor="#C3A6FF"></stop>
                  <stop offset="1" stopColor="#FFB0D6"></stop>
                </linearGradient>
              </defs>
            </svg>
            Ask Amy
          </div>
          
          <div role="button" aria-label="Close" tabIndex={0} onClick={onClose} style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, width: '32px', height: '32px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#414652" strokeWidth="1.7" strokeLinecap="round" strokeLineJoin="round" width="16" height="16">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"></path>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginBottom: '12px' }}>
          Withdraw {coinSymbol} ({networkName})
        </div>
        <div style={{ fontSize: '13.5px', color: 'rgb(92, 97, 109)', marginBottom: '18px' }}>
          Min: {minAmount.toFixed(2)} {coinSymbol}
        </div>

        {/* Address Input */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgb(65, 70, 82)', marginBottom: '6px' }}>
            Withdrawal Address
          </div>
          <input 
            type="text" 
            placeholder={`Enter your ${coinSymbol} address`} 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => setIsAddressFocused(true)}
            onBlur={() => setIsAddressFocused(false)}
            style={{ 
              width: '100%', 
              background: 'rgb(255, 255, 255)', 
              color: 'rgb(48, 53, 65)',          // <--- CRITICAL FIX: Forces text to be dark grey instead of white
              border: isAddressFocused ? '1px solid rgb(48, 53, 65)' : '1px solid rgb(235, 236, 239)', 
              borderRadius: '10px', 
              padding: '12px 14px', 
              fontSize: '15.5px', 
              outline: 'none', 
              fontFamily: 'inherit', 
              boxSizing: 'border-box', 
              transition: 'border 0.2s',
              userSelect: 'text',
              WebkitUserSelect: 'text'
            }}
          />
        </div>

        {/* Amount Input */}
        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'rgb(65, 70, 82)', marginBottom: '6px' }}>
          Amount
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgb(255, 255, 255)', 
          border: isAmountFocused ? '1.5px solid rgb(48, 53, 65)' : '1.5px solid rgb(235, 236, 239)', 
          borderRadius: '12px', 
          padding: '4px 16px', 
          transition: 'border 0.2s' 
        }}>
          <input 
            type="text" 
            inputMode="decimal" 
            placeholder="0.00" 
            value={amount}
            onChange={handleAmountChange}
            onFocus={() => setIsAmountFocused(true)}
            onBlur={() => setIsAmountFocused(false)}
            style={{ 
              flex: '1 1 0%', 
              borderWidth: 'medium', 
              borderStyle: 'none', 
              borderColor: 'currentcolor', 
              borderImage: 'none', 
              outline: 'none', 
              fontSize: '18px', 
              fontWeight: 700, 
              color: 'rgb(48, 53, 65)',          // <--- Matches text color
              padding: '10px 0px', 
              fontFamily: 'inherit', 
              background: 'transparent',
              userSelect: 'text',
              WebkitUserSelect: 'text'
            }} 
          />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(120, 125, 136)' }}>{coinSymbol}</span>
        </div>

        {/* Percentages Row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', marginBottom: '20px' }}>
          {[25, 50, 75, 100].map((pct) => (
            <div 
              key={pct}
              role="button" 
              tabIndex={0} 
              onClick={() => handlePercentClick(pct)}
              style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, flex: '1 1 0%', textAlign: 'center', padding: '9px 0px', borderRadius: '20px', border: '1px solid rgb(235, 236, 239)', fontSize: '14px', fontWeight: 600, color: 'rgb(65, 70, 82)' }}
            >
              {pct}%
            </div>
          ))}
        </div>

        {/* Balance */}
        <div style={{ fontSize: '14.5px', color: 'rgb(56, 61, 74)', marginBottom: '18px' }}>
          Available balance: <b>{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {coinSymbol}</b>
        </div>

        {/* Breakdowns */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0px', borderTop: '1px solid rgb(235, 236, 239)', borderBottom: '1px solid rgb(235, 236, 239)', marginBottom: '18px' }}>
          <span style={{ fontSize: '14px', color: 'rgb(120, 125, 136)' }}>Withdrawal adjustment</span>
          <span style={{ fontSize: '14px', color: 'rgb(48, 53, 65)' }}>0.00 {coinSymbol}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'rgb(120, 125, 136)' }}>You'll receive</div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginTop: '2px' }}>
              {numAmount.toFixed(2)} {coinSymbol}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: 'rgb(120, 125, 136)' }}>Equivalent to</div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginTop: '2px' }}>
              {(numAmount * exchangeRate).toFixed(2)} USD
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12.5px', color: 'rgb(148, 152, 162)', marginTop: '6px', marginBottom: '20px' }}>
          Exchange rate: 1 {coinSymbol} = {exchangeRate} USD
        </div>

        {/* Submit Button */}
        <div 
          role="button" 
          tabIndex={isValid ? 0 : -1} 
          onClick={() => isValid && onWithdraw(numAmount.toFixed(2), address)}
          style={{ cursor: isValid ? 'pointer' : 'default', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: isValid ? 1 : 0.55, background: isValid ? 'rgb(255, 68, 79)' : 'rgb(248, 196, 199)', color: 'rgb(255, 255, 255)', textAlign: 'center', padding: '16px 0px', borderRadius: '26px', fontSize: '17px', fontWeight: 700, transition: 'all 0.2s ease' }}
        >
          Withdraw
        </div>

        {/* Warning Note */}
        <div style={{ display: 'flex', gap: '10px', margin: '22px 0 100px 0' }}>
          <span style={{ flex: '0 0 auto', marginTop: '1px' }}>⚠️</span>
          <span style={{ fontSize: '13.5px', color: 'rgb(65, 70, 82)', lineHeight: 1.5 }}>
            Make sure you're sending {coinSymbol} via {networkName} to the correct address. Cryptocurrency transactions are irreversible.
          </span>
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