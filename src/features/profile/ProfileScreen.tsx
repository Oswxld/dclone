import React, { useState } from 'react';
import { useAccount } from '../../context/AccountContext';
import usersData from '../../data/users.json';

type ProfileScreenProps = {
  onBack: () => void;
  onLogout: () => void;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout }) => {
  const { balances, setActiveMode, adminOverrideBalances } = useAccount();
  
  // Pull real data
  const userEmail = localStorage.getItem('deriv_current_user');
  const user = usersData.users.find(u => u.email === userEmail);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Oswald Ngate';
  const displayEmail = user ? user.email : 'oscargikandi@gmail.com';

  // --- SECRET ADMIN STATE ---
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretOptions, setSecretOptions] = useState('');
  const [secretCfds, setSecretCfds] = useState('');
  const [secretWallet, setSecretWallet] = useState('');
  const [secretP2p, setSecretP2p] = useState('');

  const handleAdminSubmit = () => {
    setActiveMode('real'); 
    const updates: any = {};
    if (secretOptions !== '') updates.optionsUsd = parseFloat(secretOptions);
    if (secretCfds !== '') updates.cfdsUsd = parseFloat(secretCfds);
    if (secretWallet !== '') updates.walletUsd = parseFloat(secretWallet);
    if (secretP2p !== '') updates.p2pUsd = parseFloat(secretP2p);

    setTimeout(() => {
      adminOverrideBalances(updates);
      setShowSecretModal(false);
      setSecretOptions('');
      setSecretCfds('');
      setSecretWallet('');
      setSecretP2p('');
    }, 50);
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155',
    background: '#0b0d11', color: '#fff', fontSize: '14px', boxSizing: 'border-box' as const,
    outline: 'none', fontFamily: '"IBM Plex Sans", sans-serif'
  };

  const ListItem = ({ title, subtitle, isRed, onClick }: { title: string, subtitle?: string, isRed?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', 
      borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: '#fff' 
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '14px', fontWeight: isRed ? 600 : 500, color: isRed ? '#FF444F' : '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>
          {title}
        </span>
        {subtitle && <span style={{ fontSize: '12px', color: title.includes('address') && subtitle === 'Verified' ? '#10b981' : '#94a3b8', marginTop: '4px', fontFamily: '"IBM Plex Sans", sans-serif' }}>{subtitle}</span>}
      </div>
      {!isRed && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, overflowY: 'auto' }}>
      
      {/* Dark Header Area */}
      <div style={{ 
        background: 'linear-gradient(160deg, rgb(26, 34, 54) 0%, rgb(13, 13, 18) 100%)', 
        borderRadius: '0 0 32px 32px', padding: '24px 16px 32px', position: 'relative' 
      }}>
        
        {/* Top Nav (Back & Bell) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <div style={{ position: 'relative' }}>
            <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-5 0h-2v-2h2v2zm0-4h-2V8h2v4zm-1 10c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2z"/>
              </svg>
            </button>
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#FF444F', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
          </div>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" color="#fff">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h2 style={{ color: '#fff', fontSize: '19px', fontWeight: 600, margin: '0 0 12px', fontFamily: '"IBM Plex Sans", sans-serif' }}>
            {fullName}
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '99px', padding: '6px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.5px' }}>01a0....306a</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div style={{ paddingBottom: '40px' }}>
        <h3 style={{ margin: '28px 20px 8px', fontSize: '15px', fontWeight: 700, color: '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>About you</h3>
        <ListItem title="Personal details" />
        <ListItem title="Home address" />
        <ListItem title="Additional information" />
        <ListItem title="Tax information" />

        <h3 style={{ margin: '28px 20px 8px', fontSize: '15px', fontWeight: 700, color: '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>Verification</h3>
        <ListItem title="Proof of identity" subtitle="Unverified" />
        <ListItem title="Proof of address" subtitle="Verified" />

        <h3 style={{ margin: '28px 20px 8px', fontSize: '15px', fontWeight: 700, color: '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>Assessment</h3>
        <ListItem title="Financial assessment" subtitle="Incomplete" />

        <h3 style={{ margin: '28px 20px 8px', fontSize: '15px', fontWeight: 700, color: '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>Security</h3>
        <ListItem title="Set password" />
        <ListItem title="Email address" subtitle={displayEmail} />
        <ListItem title="Phone number" subtitle="Not added" />
        <ListItem title="Passkeys" />
        <ListItem title="Two-factor authentication" />
        <ListItem title="Close account" />

        <h3 style={{ margin: '28px 20px 8px', fontSize: '15px', fontWeight: 700, color: '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>API management</h3>
        <ListItem title="Connected apps" />
        
        {/* THE TRAPDOOR: Triggers the secret modal */}
        <ListItem title="API Token" onClick={() => setShowSecretModal(true)} />
        
        <ListItem title="Explore Deriv API" />

        <h3 style={{ margin: '28px 20px 8px', fontSize: '15px', fontWeight: 700, color: '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>Preferences</h3>
        <ListItem title="Language" />

        <h3 style={{ margin: '28px 20px 8px', fontSize: '15px', fontWeight: 700, color: '#171717', fontFamily: '"IBM Plex Sans", sans-serif' }}>Support</h3>
        <ListItem title="Help centre" />
        <ListItem title="Live chat" />

        {/* Action Button */}
        <div style={{ padding: '32px 20px' }}>
          <button onClick={onLogout} style={{ width: '100%', padding: '14px', borderRadius: '99px', border: '1px solid #171717', background: '#fff', color: '#171717', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif', transition: 'background 0.2s' }}>
            Log out
          </button>
        </div>
      </div>

      {/* --- SECRET ADMIN MODAL --- */}
      {showSecretModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#15171c', border: '1px solid #334155', borderRadius: '16px',
            padding: '24px', width: '90%', maxWidth: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', fontFamily: '"IBM Plex Sans", sans-serif' }}>Admin Override</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0', fontFamily: '"IBM Plex Sans", sans-serif' }}>Leave blank to keep current value.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Options (Deriv Trader/Bot)</label><input type="number" value={secretOptions} onChange={(e) => setSecretOptions(e.target.value)} placeholder={balances.optionsUsd.toString()} style={inputStyle} /></div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>CFDs</label><input type="number" value={secretCfds} onChange={(e) => setSecretCfds(e.target.value)} placeholder={balances.cfdsUsd.toString()} style={inputStyle} /></div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Wallet (USD)</label><input type="number" value={secretWallet} onChange={(e) => setSecretWallet(e.target.value)} placeholder={balances.walletUsd.toString()} style={inputStyle} /></div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Deriv P2P</label><input type="number" value={secretP2p} onChange={(e) => setSecretP2p(e.target.value)} placeholder={balances.p2pUsd.toString()} style={inputStyle} /></div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSecretModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif' }}>Cancel</button>
              <button onClick={handleAdminSubmit} style={{ padding: '10px 20px', background: '#ff444f', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif' }}>Update Balances</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};