import { useState } from 'react';
import styles from './MobileTopHeader.module.css';
import { useAccount } from '../../context/AccountContext';
import type { NavigationTab } from '../../types/account';

import askAmySvg from '../../assets/ask_amy.svg';

type MobileTopHeaderProps = {
  currentTab: NavigationTab;
  onOpenTransfer?: () => void;
};

export const MobileTopHeader = ({ currentTab, onOpenTransfer }: MobileTopHeaderProps) => {
  const { balances, activeMode, setActiveMode, updateOptionsBalance, adminOverrideBalances } = useAccount();
  const [portfolioSubTab, setPortfolioSubTab] = useState<'Overview' | 'Wallet' | 'Partners' | 'Trading' | 'P2P'>('Overview');
  
  // --- SECRET ADMIN STATE ---
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretOptions, setSecretOptions] = useState('');
  const [secretCfds, setSecretCfds] = useState('');
  const [secretWallet, setSecretWallet] = useState('');
  const [secretP2p, setSecretP2p] = useState('');

  const displayAmount =
    currentTab === 'cfds'
      ? balances.cfdsUsd
      : currentTab === 'options'
      ? balances.optionsUsd
      : balances.totalUsd;

  const formattedAmount = displayAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleReset = () => {
    if (currentTab === 'options') {
      updateOptionsBalance(10000.0, true);
    }
  };

  const handleAdminSubmit = () => {
    setActiveMode('real'); // Force switch to real account view
    
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

  // Reusable inline style for the 4 modal inputs
  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155',
    background: '#0b0d11', color: '#fff', fontSize: '14px', boxSizing: 'border-box' as const,
    outline: 'none', fontFamily: '"IBM Plex Sans", sans-serif'
  };

  return (
    <header className={styles.headerContainer}>
      {/* 1. Top Bar */}
      <div className={styles.navRow}>
        
        {/* LEFT COMPONENT (Flex 1) */}
        <div className={styles.leftGroup}>
          <div 
            className={styles.profileBtn}
            onClick={() => setShowSecretModal(true)}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-label="Admin Settings"
          >
            OS
          </div>
        </div>

        {/* CENTER COMPONENT (Shrink 0) */}
        <div className={styles.centerGroup}>
          {currentTab === 'cfds' || currentTab === 'options' ? (
            <div className={styles.accountTypeToggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${activeMode === 'real' ? styles.toggleBtnActive : ''}`}
                onClick={() => setActiveMode('real')}
              >
                Real
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${activeMode === 'demo' ? styles.toggleBtnActive : ''}`}
                onClick={() => setActiveMode('demo')}
              >
                Demo
              </button>
            </div>
          ) : (
            <button type="button" className={styles.askAmyBtn} aria-label="Ask Amy">
              <img src={askAmySvg} alt="" className={styles.askAmyImg} />
            </button>
          )}
        </div>

        {/* RIGHT COMPONENT (Flex 1) */}
        <div className={styles.rightGroup}>
          <div className={styles.bellWrapper}>
            <button type="button" className={`${styles.iconBtn} ${styles.bellBtn}`} aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M15.375 7.125c0-.312.273-.625.625-.625.313 0 .625.313.625.625v.664c3.125.313 5.625 2.969 5.625 6.211v1.172c0 1.68.664 3.32 1.875 4.531l.117.117c.313.313.508.782.508 1.211a1.75 1.75 0 0 1-1.758 1.758H8.97c-.977-.039-1.719-.781-1.719-1.758 0-.468.156-.898.508-1.21l.078-.118c1.21-1.21 1.914-2.851 1.914-4.531V14a6.237 6.237 0 0 1 5.625-6.21zM16 9c-2.773 0-5 2.266-5 5v1.172a7.7 7.7 0 0 1-2.266 5.43l-.117.078a.63.63 0 0 0-.117.351c0 .274.195.469.469.469h14.023c.274 0 .508-.195.508-.469 0-.117-.078-.234-.156-.351l-.117-.078a7.7 7.7 0 0 1-2.266-5.47V14c0-2.734-2.227-5-5-5zm-1.21 15.43c.194.508.663.82 1.21.82.508 0 .977-.312 1.172-.82.117-.313.469-.508.781-.39a.655.655 0 0 1 .39.82A2.49 2.49 0 0 1 16 26.5c-1.094 0-2.031-.664-2.383-1.64a.654.654 0 0 1 .39-.82c.313-.118.665.077.782.39"></path>
              </svg>
            </button>
            <span className={styles.badge}>11</span>
          </div>
        </div>
      </div>

      {/* 2. Portfolio Sub-Tabs */}
      {currentTab === 'portfolio' && (
        <div className={styles.subTabsRow}>
          {(['Overview', 'Wallet', 'Partners', 'Trading', 'P2P'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.subTabBtn} ${portfolioSubTab === tab ? styles.subTabBtnActive : ''}`}
              onClick={() => setPortfolioSubTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* 3. Balance Row */}
      <div className={styles.balanceRow}>
        <div className={styles.balanceCol}>
          <span className={styles.totalLabel}>
            {currentTab === 'home'
              ? 'Total value'
              : currentTab === 'portfolio'
              ? 'Est. total value'
              : 'Total trading value'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={styles.amount}>{formattedAmount}</span>
            <span className={styles.currency}>{balances.currency}</span>
            {currentTab === 'options' && activeMode === 'demo' && (
              <button
                type="button"
                onClick={handleReset}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
                </svg>
              </button>
            )}
          </div>
          <span className={styles.timestamp}>
            {currentTab === 'cfds' ? 'Updated 6 min ago' : balances.lastUpdated}
          </span>
        </div>

        {/* 4. Action Buttons */}
        {currentTab === 'home' && (
          <button type="button" className={`${styles.actionBtn} ${styles.btnPrimary}`}>
            Deposit
          </button>
        )}

        {/* CFDs & Options Actions */}
        {(currentTab === 'cfds' || currentTab === 'options') && (
          <div className={styles.circleActionsRow}>
            {activeMode === 'real' ? (
              <>
                {/* REAL MODE: Deposit & Trade */}
                <button type="button" className={styles.circleActionItem} onClick={onOpenTransfer}>
                  <div className={`${styles.circleBtn} ${styles.circleBtnRed}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" role="img" fill="currentColor">
                      <path d="M16.938 9.313v6.25h6.25a.95.95 0 0 1 .937.937c0 .547-.43.938-.937.938h-6.25v6.25c0 .546-.43.937-.938.937-.547 0-.937-.39-.937-.937v-6.25h-6.25c-.547 0-.938-.391-.938-.938 0-.508.39-.937.938-.937h6.25v-6.25c0-.508.39-.938.937-.938a.95.95 0 0 1 .938.938"></path>
                    </svg>
                  </div>
                  <span className={styles.circleBtnLabel}>Deposit</span>
                </button>

                <button type="button" className={styles.circleActionItem}>
                  <div className={`${styles.circleBtn} ${styles.circleBtnOutline}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="26" viewBox="0 0 24 36" role="img" fill="currentColor">
                      <path d="M1.5 8.25v16.5A2.22 2.22 0 0 0 3.75 27h19.5c.375 0 .75.375.75.75 0 .422-.375.75-.75.75H3.75C1.64 28.5 0 26.86 0 24.75V8.25c0-.375.328-.75.75-.75.375 0 .75.375.75.75m13.5 0v2.297c.844.187 1.5.937 1.5 1.828v3.75c0 .938-.656 1.688-1.5 1.875v2.25c0 .422-.375.75-.75.75a.74.74 0 0 1-.75-.75V18c-.89-.187-1.5-.937-1.5-1.875v-3.75c0-.89.61-1.64 1.5-1.828V8.25c0-.375.328-.75.75-.75.375 0 .75.375.75.75M8.25 9c.375 0 .75.375.75.75v2.297c.844.187 1.5.937 1.5 1.828v5.25c0 .938-.656 1.688-1.5 1.875v2.25c0 .422-.375.75-.75.75a.74.74 0 0 1-.75-.75V21c-.89-.187-1.5-.937-1.5-1.875v-5.25c0-.89.61-1.64 1.5-1.828V9.75c0-.375.328-.75.75-.75M15 12.375a.4.4 0 0 0-.375-.375h-.75a.37.37 0 0 0-.375.375v3.75c0 .234.14.375.375.375h.75a.37.37 0 0 0 .375-.375zm4.875 4.125a.37.37 0 0 0-.375.375v2.25c0 .234.14.375.375.375h.75a.37.37 0 0 0 .375-.375v-2.25a.4.4 0 0 0-.375-.375zM19.5 15v-2.25c0-.375.328-.75.75-.75.375 0 .75.375.75.75v2.297c.844.187 1.5.937 1.5 1.828v2.25c0 .938-.656 1.688-1.5 1.875v2.25c0 .422-.375.75-.75.75a.74.74 0 0 1-.75-.75V21c-.89-.187-1.5-.937-1.5-1.875v-2.25c0-.89.61-1.64 1.5-1.828zM8.625 13.5h-.75a.37.37 0 0 0-.375.375v5.25c0 .234.14.375.375.375h.75A.37.37 0 0 0 9 19.125v-5.25a.4.4 0 0 0-.375-.375"></path>
                    </svg>
                  </div>
                  <span className={styles.circleBtnLabel}>Trade</span>
                </button>
              </>
            ) : (
              <>
                {/* DEMO MODE: Trade & Reset Balance */}
                <button type="button" className={styles.circleActionItem}>
                  <div className={`${styles.circleBtn} ${styles.circleBtnRed}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                  </div>
                  <span className={styles.circleBtnLabel}>Trade</span>
                </button>

                <button
                  type="button"
                  className={styles.circleActionItem}
                  onClick={currentTab === 'options' ? handleReset : onOpenTransfer}
                >
                  <div className={`${styles.circleBtn} ${styles.circleBtnDark}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {currentTab === 'options' ? (
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16" />
                      ) : (
                        <path d="M7 10h14l-4-4M17 14H3l4 4" />
                      )}
                    </svg>
                  </div>
                  <span className={styles.circleBtnLabel}>
                    {currentTab === 'options' ? 'Reset balance' : 'Transfer'}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Portfolio Actions */}
        {currentTab === 'portfolio' && (
          <div className={styles.circleActionsRow} style={{ gap: 14 }}>
            <button type="button" className={styles.circleActionItem}>
              <div className={`${styles.circleBtn} ${styles.circleBtnRed}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className={styles.circleBtnLabel}>Deposit</span>
            </button>

            <button type="button" className={styles.circleActionItem} onClick={onOpenTransfer}>
              <div className={`${styles.circleBtn} ${styles.circleBtnDark}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 10h14l-4-4M17 14H3l4 4" />
                </svg>
              </div>
              <span className={styles.circleBtnLabel}>Transfer</span>
            </button>

            <button type="button" className={styles.circleActionItem} onClick={onOpenTransfer}>
              <div className={`${styles.circleBtn} ${styles.circleBtnDark}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                </svg>
              </div>
              <span className={styles.circleBtnLabel}>Withdraw</span>
            </button>
          </div>
        )}
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
            padding: '24px', width: '90%', maxWidth: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', fontFamily: '"IBM Plex Sans", sans-serif' }}>
              Admin Override
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0', fontFamily: '"IBM Plex Sans", sans-serif' }}>
              Leave blank to keep current value.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Options (Deriv Trader/Bot)</label>
                <input type="number" value={secretOptions} onChange={(e) => setSecretOptions(e.target.value)} placeholder={balances.optionsUsd.toString()} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>CFDs</label>
                <input type="number" value={secretCfds} onChange={(e) => setSecretCfds(e.target.value)} placeholder={balances.cfdsUsd.toString()} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Wallet (USD)</label>
                <input type="number" value={secretWallet} onChange={(e) => setSecretWallet(e.target.value)} placeholder={balances.walletUsd.toString()} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Deriv P2P</label>
                <input type="number" value={secretP2p} onChange={(e) => setSecretP2p(e.target.value)} placeholder={balances.p2pUsd.toString()} style={inputStyle} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowSecretModal(false)}
                style={{ padding: '10px 16px', background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAdminSubmit}
                style={{ padding: '10px 20px', background: '#ff444f', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif' }}
              >
                Update Balances
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};