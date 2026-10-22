import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

type PasskeyVerificationScreenProps = {
  onBack: () => void;
  onComplete?: () => void;
};

export const PasskeyVerificationScreen: React.FC<PasskeyVerificationScreenProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState<'loading' | 'failed' | 'email_otp'>('loading');
  const [isMethodSheetOpen, setIsMethodSheetOpen] = useState(false);
  
  // OTP State
  const [userEmail, setUserEmail] = useState('guest.wallace@example.com');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false); // NEW: Controls the error shake
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      } else {
        const fallback = localStorage.getItem('admin_overrideEmail');
        if (fallback) setUserEmail(fallback);
      }
    });
  }, []);

  useEffect(() => {
    if (step === 'loading') {
      const timer = setTimeout(() => {
        setStep('failed');
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle auto-submit & Validation
  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      const enteredCode = otp.join('');
      const savedCode = localStorage.getItem('deriv_verification_code');

      if (enteredCode === savedCode) {
        // Success
        if (onComplete) {
          const timer = setTimeout(() => {
            onComplete();
          }, 400);
          return () => clearTimeout(timer);
        }
      } else {
        // Failed - Trigger Shake
        setIsShaking(true);
        const timer = setTimeout(() => {
          setOtp(['', '', '', '', '', '']);
          setIsShaking(false);
          inputRefs.current[0]?.focus();
        }, 500); // Wait for shake animation to finish before clearing
        return () => clearTimeout(timer);
      }
    }
  }, [otp, onComplete]);

  const handleGetEmailCode = async () => {
    setIsMethodSheetOpen(false);
    setStep('email_otp');
    setOtp(['', '', '', '', '', '']);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('deriv_verification_code', code);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        await supabase.from('g_messages').insert({
          owner_id: userId,
          sender_name: 'Deriv',
          sender_address: '', 
          subject: `Your one-time code for your account is ${code}`,
          preview: `Your one-time code for your account is ${code}`,
          body: `Your one-time code for your account is ${code}`,
          category: 'primary',
          kind: 'demo_code',
          avatar_letter: 'D',
          avatar_color: '#FF444F',
          code: code
        });
      }
    } catch (err) {
      console.error('Failed to send OTP to g_messages:', err);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    if (!cleanedValue && value !== '') return;

    if (cleanedValue.length > 1) {
      const newOtp = [...otp];
      const digits = cleanedValue.split('').slice(0, 6);
      digits.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanedValue.slice(-1);
    setOtp(newOtp);

    if (cleanedValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
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
      <div style={{ width: '100%', maxWidth: '608px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {step === 'loading' ? (
          <>
            {/* --- LOADING SCREEN HEADER --- */}
            <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button 
                type="button" 
                onClick={onBack}
                style={{ display: 'flex', height: '32px', width: '32px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="#404040" strokeWidth="2.5" strokeLinecap="round" strokeLineJoin="round">
                  <path d="M20 12H4.5M10.5 5.5 4 12l6.5 6.5"></path>
                </svg>
              </button>

              <button 
                type="button" 
                style={{ display: 'flex', height: '32px', width: '32px', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor" color="#525252">
                  <path d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4zm0 21a9 9 0 1 1 9-9 9 9 0 0 1-9 9zm0-4.5a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 20.5zm1.5-3.5v1.5a1.5 1.5 0 0 1-3 0v-1.5a3 3 0 0 1 3-3 1.5 1.5 0 0 0 0-3 3 3 0 0 0-3 3 1.5 1.5 0 0 1-3 0 6 6 0 1 1 6 6z"></path>
                </svg>
              </button>
            </div>

            {/* --- LOADING SCREEN CONTENT --- */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 0', textAlign: 'center' }}>
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
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1a2236', marginBottom: '12px', marginTop: 0 }}>
                Verify with passkey
              </h1>
              <p style={{ fontSize: '15px', color: '#525252', margin: 0, lineHeight: 1.5, padding: '0 8px' }}>
                Complete verification using your passkey by following the instructions on your browser.
              </p>
            </div>
          </>
        ) : step === 'failed' ? (
          /* --- FAILED / TRY AGAIN SCREEN --- */
          <div style={{ flex: '1 1 0%', overflowY: 'auto', background: 'rgb(255, 255, 255)', padding: '16px 18px 34px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div 
                role="button" aria-label="Back" tabIndex={0} onClick={onBack}
                style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', width: '32px', height: '32px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" width="18" height="18">
                  <path d="M20 12H4.5M10.5 5.5 4 12l6.5 6.5"></path>
                </svg>
              </div>
              <div 
                role="button" aria-label="Help" tabIndex={0} 
                style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', width: '32px', height: '32px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#414652" strokeWidth="1.7" strokeLinecap="round" strokeLineJoin="round" width="20" height="20">
                  <circle cx="12" cy="12" r="8.5"></circle>
                  <path d="M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1 .8-1 1.6"></path>
                  <circle cx="12" cy="16.3" r=".15" fill="currentColor"></circle>
                </svg>
              </div>
            </div>

            {/* Body */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginBottom: '10px' }}>
                Verify with passkey
              </div>
              <div style={{ fontSize: '15px', color: 'rgb(92, 97, 109)', lineHeight: 1.5, padding: '0px' }}>
                Complete verification using your passkey by following the instructions on your browser.
              </div>
              
              <div 
                role="button" 
                tabIndex={0} 
                onClick={() => setStep('loading')}
                style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', marginTop: '26px', background: 'rgb(255, 68, 79)', color: 'rgb(255, 255, 255)', textAlign: 'center', padding: '16px 0px', borderRadius: '26px', fontSize: '16px', fontWeight: 700 }}
              >
                Try again
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0px', color: 'rgb(92, 97, 109)', fontSize: '14px' }}>
                <div style={{ flex: '1 1 0%', height: '1px', background: 'rgb(235, 236, 239)' }}></div>
                or
                <div style={{ flex: '1 1 0%', height: '1px', background: 'rgb(235, 236, 239)' }}></div>
              </div>
              
              <div 
                role="button" 
                tabIndex={0} 
                onClick={() => setIsMethodSheetOpen(true)}
                style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', border: '1.5px solid rgb(48, 53, 65)', borderRadius: '26px', textAlign: 'center', padding: '15px 0px', fontSize: '15.5px', fontWeight: 700, color: 'rgb(48, 53, 65)' }}
              >
                Try another verification method
              </div>
            </div>
          </div>
        ) : (
          /* --- OTP EMAIL VERIFICATION SCREEN --- */
          <div style={{ flex: '1 1 0%', overflowY: 'auto', background: 'rgb(255, 255, 255)', padding: '16px 18px 34px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div 
                role="button" aria-label="Back" tabIndex={0} onClick={() => setStep('failed')}
                style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', width: '32px', height: '32px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" width="18" height="18">
                  <path d="M20 12H4.5M10.5 5.5 4 12l6.5 6.5"></path>
                </svg>
              </div>
              <div 
                role="button" aria-label="Help" tabIndex={0} 
                style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', width: '32px', height: '32px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#414652" strokeWidth="1.7" strokeLinecap="round" strokeLineJoin="round" width="20" height="20">
                  <circle cx="12" cy="12" r="8.5"></circle>
                  <path d="M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1 .8-1 1.6"></path>
                  <circle cx="12" cy="16.3" r=".15" fill="currentColor"></circle>
                </svg>
              </div>
            </div>
            
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(56, 61, 74)', marginBottom: '8px' }}>
              Check your email
            </div>
            <div style={{ fontSize: '15px', color: 'rgb(92, 97, 109)' }}>
              Enter the 6-digit code sent to
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(56, 61, 74)', marginBottom: '26px' }}>
              {userEmail}
            </div>
            
            {/* OTP Input Row with Dynamic Shake Animation */}
            <div style={{ 
              display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px',
              animation: isShaking ? 'shake 0.4s ease-in-out' : 'none'
            }}>
              {otp.map((digit, index) => {
                const isActive = digit !== '' || focusedIndex === index;
                
                // Determine border color: Red if shaking, Dark grey if active, Light grey if inactive
                const borderColor = isShaking 
                  ? 'rgb(255, 68, 79)' 
                  : isActive 
                    ? 'rgb(48, 53, 65)' 
                    : 'rgb(235, 236, 239)';

                return (
                  <input 
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric" 
                    aria-label={`Digit ${index + 1}`} 
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    style={{ 
                      width: '42px', height: '50px', textAlign: 'center', fontSize: '20px', fontWeight: 700, 
                      color: isShaking ? 'rgb(255, 68, 79)' : 'rgb(48, 53, 65)', background: '#ffffff',
                      border: `1.5px solid ${borderColor}`, 
                      borderRadius: '10px', outline: 'none', fontFamily: 'inherit', transition: 'border 0.2s',
                      boxShadow: 'none'
                    }}
                  />
                );
              })}
            </div>
            
            <div style={{ textAlign: 'center', fontSize: '13.5px', color: 'rgb(92, 97, 109)' }}>
              Didn't get the code? Check your spam folder or <span onClick={handleGetEmailCode} style={{ color: 'rgb(255, 68, 79)', fontWeight: 700, cursor: 'pointer' }}>resend code.</span>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM SHEET FOR ALTERNATIVE METHODS --- */}
      {isMethodSheetOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setIsMethodSheetOpen(false)} />
          
          <div style={{ position: 'relative', width: '100%', maxHeight: '48%', background: 'rgb(255, 255, 255)', borderRadius: '20px 20px 0px 0px', animation: '0.26s cubic-bezier(0.2, 0.9, 0.3, 1) 0s 1 normal none running sheetUp', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ width: '44px', height: '4px', borderRadius: '2px', background: 'rgb(214, 214, 214)', margin: '10px auto 4px', flex: '0 0 auto' }} />
            
            <div style={{ overflowY: 'auto', flex: '1 1 0%', minHeight: '0px' }}>
              <div style={{ padding: '6px 20px 20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginBottom: '22px', lineHeight: 1.25 }}>
                  Select another verification method
                </div>
                
                <div role="button" tabIndex={0} style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, background: 'rgb(255, 255, 255)', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px', fontSize: '15.5px', color: 'rgb(48, 53, 65)' }}>
                  Get code via phone
                </div>
                <div 
                  role="button" 
                  tabIndex={0} 
                  onClick={handleGetEmailCode}
                  style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, background: 'rgb(255, 255, 255)', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px', fontSize: '15.5px', color: 'rgb(48, 53, 65)' }}
                >
                  Get code via email
                </div>
                <div role="button" tabIndex={0} style={{ cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', opacity: 1, background: 'rgb(255, 255, 255)', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px', fontSize: '15.5px', color: 'rgb(48, 53, 65)' }}>
                  Get code via authenticator app
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        /* CSS keyframes for the red error shake */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </main>
  );
};