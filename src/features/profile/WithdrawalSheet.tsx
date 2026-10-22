import React, { useState } from 'react';
import usdIcon from '../../assets/USDOLLAR.webp';

type WithdrawalSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (method: string) => void; // <-- ADDED THIS
};

export const WithdrawalSheet: React.FC<WithdrawalSheetProps> = ({ isOpen, onClose, onContinue }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (!isOpen) return null;

  const MethodRow = ({ id, title, subtitle, iconSvg }: { id: string, title: string, subtitle: string, iconSvg: React.ReactNode }) => {
    const isSelected = selectedMethod === id;
    
    return (
      <div 
        role="button" 
        tabIndex={0} 
        onClick={() => setSelectedMethod(id)}
        style={{ 
          cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', 
          display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', marginBottom: '12px', 
          borderRadius: '14px', border: isSelected ? '1.5px solid rgb(48, 53, 65)' : '1.5px solid rgb(235, 236, 239)', 
          background: 'rgb(255, 255, 255)', transition: 'border 0.2s ease'
        }}
      >
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {iconSvg}
        </div>
        <div style={{ flex: '1 1 0%' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgb(48, 53, 65)', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>
            {title}
          </div>
          <div style={{ fontSize: '13px', color: 'rgb(92, 97, 109)', marginTop: '2px', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>
            {subtitle}
          </div>
        </div>
        
        {/* Deriv's authentic dark-grey radio button */}
        <div style={{ 
          width: '22px', height: '22px', borderRadius: '50%', 
          border: isSelected ? '2px solid rgb(48, 53, 65)' : '2px solid rgb(235, 236, 239)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease'
        }}>
          {isSelected && (
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgb(48, 53, 65)' }} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', 
      justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      {/* Invisible backdrop click area to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      <div style={{ 
        position: 'relative', width: '100%', maxHeight: '85vh', background: 'rgb(255, 255, 255)', 
        borderRadius: '20px 20px 0px 0px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: '0.26s cubic-bezier(0.2, 0.9, 0.3, 1) 0s 1 normal none running slideUp'
      }}>
        
        {/* Handle */}
        <div style={{ width: '44px', height: '4px', borderRadius: '2px', background: 'rgb(214, 214, 214)', margin: '10px auto 4px', flexShrink: 0 }} />

        <div style={{ overflowY: 'auto', flex: '1 1 0%', minHeight: 0 }}>
          <div style={{ padding: isExpanded ? '16px 18px 34px' : '8px 18px 24px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header Area */}
            {isExpanded ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                  <div 
                    role="button" aria-label="Back" tabIndex={0} onClick={() => setIsExpanded(false)}
                    style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', background: 'rgb(246, 247, 248)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#181c25" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" width="20" height="20">
                      <path d="M20 12H4.5M10.5 5.5 4 12l6.5 6.5"></path>
                    </svg>
                  </div>
                  <div style={{ fontSize: '21px', fontWeight: 700, color: 'rgb(56, 61, 74)', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>Withdraw</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(56, 61, 74)', marginBottom: '16px', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>Select Withdrawal Method</div>
              </>
            ) : (
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'rgb(48, 53, 65)', marginBottom: '18px', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>Withdraw</div>
            )}

            {/* USD Display Card (Unselectable Header) */}
            <div 
              style={{ 
                userSelect: 'none', position: 'relative', overflow: 'hidden', borderRadius: '16px', padding: '16px', marginBottom: '14px', 
                background: 'radial-gradient(105% 90% at 2% 4%, rgba(239, 0, 39, 0.4) 0%, rgba(239, 0, 39, 0) 52%), rgb(24, 28, 37)', 
                border: '1.5px solid transparent'
              }}
            >
              {isExpanded && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', borderRadius: '4px', padding: '2px 6px', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>Suggested</span>
              )}
              <img src={usdIcon} width="34" height="34" alt="USD" style={{ objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: isExpanded ? '15px' : '16px', marginTop: '8px', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>US Dollar</div>
              {!isExpanded && (
                <span style={{ display: 'inline-block', marginTop: '8px', background: 'rgba(255, 255, 255, 0.12)', color: 'rgba(255, 255, 255, 0.85)', fontSize: '12.5px', borderRadius: '6px', padding: '3px 9px', fontFamily: 'Inter, "IBM Plex Sans", sans-serif' }}>Suggested</span>
              )}
            </div>

            {/* Standard Selectable Methods */}
            <MethodRow 
              id="usd_method" 
              title="USD" 
              subtitle="Withdraw via bank, card, e-wallet, and crypto."
              iconSvg={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30" width="20" height="20" role="img">
                  <path fill="#414652" d="M18.75 15.5c0-3.125-1.68-5.977-4.375-7.54-2.734-1.6-6.055-1.6-8.75 0A8.63 8.63 0 0 0 1.25 15.5c0 3.164 1.64 6.016 4.375 7.578 2.695 1.602 6.016 1.602 8.75 0A8.73 8.73 0 0 0 18.75 15.5M0 15.5a9.93 9.93 0 0 1 5-8.633c3.086-1.797 6.875-1.797 10 0 3.086 1.797 5 5.078 5 8.633 0 3.594-1.914 6.875-5 8.672-3.125 1.797-6.914 1.797-10 0-3.125-1.797-5-5.078-5-8.672m10.625-5.312v.898c.508.039 1.016.195 1.523.351.079 0 .118.04.196.04.312.078.508.43.43.78-.079.313-.43.509-.782.43-.078-.039-.195-.039-.273-.078-.274-.078-.586-.195-.899-.234-.742-.078-1.406 0-1.914.195-.508.235-.742.547-.781.782-.078.39.078.625.39.859.43.234 1.055.43 1.797.625v.039c.704.195 1.524.43 2.149.82.742.508 1.055 1.328.898 2.227-.156.82-.742 1.406-1.484 1.68a3.3 3.3 0 0 1-1.29.273v.938a.617.617 0 0 1-.624.625.64.64 0 0 1-.625-.625v-.977c-.313-.078-.82-.234-1.25-.352l-.82-.234a.654.654 0 0 1-.391-.82c.117-.313.469-.47.781-.39.274.077.508.194.782.273.43.117.898.234 1.093.273.781.117 1.446.039 1.875-.117.43-.196.664-.469.742-.782.04-.43-.078-.742-.43-.976-.468-.313-1.015-.469-1.6-.625a.6.6 0 0 1-.235-.078c-.703-.156-1.445-.39-2.031-.781-.313-.196-.625-.47-.82-.82-.196-.391-.235-.821-.157-1.29.156-.82.781-1.367 1.523-1.68.274-.117.625-.234.938-.273v-.976c0-.313.273-.626.625-.626.351 0 .625.313.625.626z" />
                </svg>
              }
            />

            <MethodRow 
              id="agent" 
              title="Payment agent" 
              subtitle="Deposit and withdraw in your local currency via a verified local agent."
              iconSvg={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 30" width="20" height="20" role="img">
                  <path fill="#414652" d="M7.5 12.688c-.234 0-.508.039-.82.039-.274.039-.586.078-.86.117v5.547h1.25v-1.875h.43c.82 0 1.484-.157 1.914-.47.469-.273.703-.78.703-1.444 0-.665-.234-1.172-.664-1.446-.469-.312-1.094-.469-1.953-.469m.078 1.093c.195 0 .352 0 .508.04.156.038.273.077.39.117.118.078.196.156.235.273.078.078.118.234.118.39 0 .313-.118.547-.352.665-.195.117-.547.156-.977.156h-.39v-1.6c.039 0 .117-.039.195-.039zM18.75 6.75H6.25a2.49 2.49 0 0 0-2.5 2.5v12.5c0 1.406 1.094 2.5 2.5 2.5h12.5c1.367 0 2.5-1.094 2.5-2.5V9.25c0-1.367-1.133-2.5-2.5-2.5M6.25 5.5h12.5c2.07 0 3.75 1.68 3.75 3.75v12.5c0 2.07-1.68 3.75-3.75 3.75H6.25c-2.07 0-3.75-1.68-3.75-3.75V9.25c0-2.07 1.68-3.75 3.75-3.75"></path>
                </svg>
              }
            />

            {/* Additional Methods (Visible on Expand) */}
            {isExpanded && (
              <>
                <MethodRow 
                  id="p2p" 
                  title="P2P" 
                  subtitle="Buy and sell USD with other traders. Deposit and withdraw in your local currency."
                  iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 30" width="20" height="20" role="img">
                      <path fill="#414652" d="M7.5 12.688c-.234 0-.508.039-.82.039-.274.039-.586.078-.86.117v5.547h1.25v-1.875h.43c.82 0 1.484-.157 1.914-.47.469-.273.703-.78.703-1.444 0-.665-.234-1.172-.664-1.446-.469-.312-1.094-.469-1.953-.469m.078 1.093c.195 0 .352 0 .508.04.156.038.273.077.39.117.118.078.196.156.235.273.078.078.118.234.118.39 0 .313-.118.547-.352.665-.195.117-.547.156-.977.156h-.39v-1.6c.039 0 .117-.039.195-.039zM18.75 6.75H6.25a2.49 2.49 0 0 0-2.5 2.5v12.5c0 1.406 1.094 2.5 2.5 2.5h12.5c1.367 0 2.5-1.094 2.5-2.5V9.25c0-1.367-1.133-2.5-2.5-2.5M6.25 5.5h12.5c2.07 0 3.75 1.68 3.75 3.75v12.5c0 2.07-1.68 3.75-3.75 3.75H6.25c-2.07 0-3.75-1.68-3.75-3.75V9.25c0-2.07 1.68-3.75 3.75-3.75"></path>
                    </svg>
                  }
                />
                <MethodRow 
                  id="crypto" 
                  title="Crypto" 
                  subtitle="Quickly withdraw to your own crypto wallet."
                  iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" role="img">
                      <path fill="#414652" d="M15.987 3.347C9.013 3.347 3.333 9.013 3.333 16s5.68 12.653 12.654 12.653c6.973 0 12.666-5.68 12.666-12.653S22.973 3.347 15.987 3.347m0 23.986c-6.24 0-11.32-5.08-11.32-11.32S9.747 4.68 15.987 4.68 27.32 9.76 27.32 16s-5.08 11.32-11.333 11.32z"></path>
                      <path fill="#414652" d="M19.4 15.88a2.6 2.6 0 0 0 .613-1.653c0-1.2-.826-2.214-1.933-2.507V9.333a.66.66 0 0 0-.667-.666.66.66 0 0 0-.666.666v2.294h-1.254V9.333a.66.66 0 0 0-.666-.666.66.66 0 0 0-.667.666v2.294a1.99 1.99 0 0 0-1.933 2v5.08c0 1.08.866 1.96 1.933 2v1.96a.66.66 0 0 0 .667.666.66.66 0 0 0 .666-.666v-1.96h1.254v1.96a.66.66 0 0 0 .666.666.66.66 0 0 0 .667-.666v-1.96a2.6 2.6 0 0 0 2.587-2.6c0-.947-.507-1.76-1.254-2.214zm-5.173-2.933h3.186c.707 0 1.267.573 1.267 1.266s-.573 1.267-1.267 1.267H13.56V13.6a.66.66 0 0 1 .667-.667zm3.84 6.413h-3.84a.66.66 0 0 1-.667-.667v-1.88h4.507c.706 0 1.266.574 1.266 1.267s-.573 1.267-1.266 1.267z"></path>
                    </svg>
                  }
                />
              </>
            )}

            {/* Toggler View more / View less */}
            <div 
              role="button" 
              tabIndex={0} 
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ 
                cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                gap: '4px', padding: '8px 0px', marginBottom: '8px', fontSize: '14px', color: 'rgb(56, 61, 74)', fontFamily: 'Inter, "IBM Plex Sans", sans-serif'
              }}
            >
              {isExpanded ? 'View less' : 'View more'}
              <span style={{ display: 'flex', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#383d4a" strokeWidth="2" strokeLinecap="round" strokeLineJoin="round" width="14" height="14">
                  <path d="m6 9.5 6 6 6-6"></path>
                </svg>
              </span>
            </div>

            {/* CONTINUE BUTTON - CALLS onContinue WITH selectedMethod */}
            <div 
              role="button" 
              onClick={selectedMethod ? () => onContinue(selectedMethod) : undefined}
              style={{ 
                cursor: selectedMethod ? 'pointer' : 'default', userSelect: 'none', opacity: selectedMethod ? 1 : 0.55, 
                marginTop: '12px', background: selectedMethod ? '#ff444f' : 'rgb(248, 196, 199)', color: 'rgb(255, 255, 255)', 
                textAlign: 'center', padding: '16px 0px', borderRadius: '26px', fontSize: '17px', fontWeight: 700, fontFamily: 'Inter, "IBM Plex Sans", sans-serif',
                transition: 'all 0.2s ease'
              }}
            >
              Continue
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};