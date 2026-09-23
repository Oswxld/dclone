import { useState } from 'react';
import styles from './MobileTopHeader.module.css';
import { useAccount } from '../../context/AccountContext';
import type { NavigationTab } from '../../types/account';
import askAmySvg from '../../assets/ask_amy.svg';
import usersData from '../../data/users.json';

type MobileTopHeaderProps = {
  currentTab: NavigationTab;
  onOpenTransfer?: () => void;
  onOpenProfile?: () => void;
};

export const MobileTopHeader = ({ currentTab, onOpenTransfer, onOpenProfile }: MobileTopHeaderProps) => {
  const { balances, activeMode, setActiveMode, updateOptionsBalance } = useAccount();
  const [portfolioSubTab, setPortfolioSubTab] = useState<'Overview' | 'Wallet' | 'Partners' | 'Trading' | 'P2P'>('Overview');
  
  // Dynamically fetch initials from the logged-in user
  const userEmail = localStorage.getItem('deriv_current_user');
  const user = usersData.users.find(u => u.email === userEmail);
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'ON';

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

  return (
    <header className={styles.headerContainer}>
      {/* 1. Top Bar */}
      <div className={styles.navRow}>
        
        {/* LEFT COMPONENT (Flex 1) */}
        <div className={styles.leftGroup}>
          <div 
            className={styles.profileBtn}
            onClick={onOpenProfile}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-label="Profile Settings"
          >
            {initials}
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
            
            {/* SINGLE Universal Refresh Icon (Visible in both Real and Demo) */}
            <button
              type="button"
              data-testid="options-btn-refresh"
              aria-label="Refresh balance"
              onClick={currentTab === 'options' && activeMode === 'demo' ? handleReset : undefined}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', opacity: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M24.438 15.25h-5.625c-.547 0-.938-.39-.938-.937 0-.508.39-.938.938-.938h3.515l-1.055-1.25c-1.289-1.523-3.164-2.5-5.273-2.5A6.86 6.86 0 0 0 9.125 16.5 6.836 6.836 0 0 0 16 23.375a6.8 6.8 0 0 0 4.102-1.367.94.94 0 0 1 1.328.195.94.94 0 0 1-.196 1.328C19.79 24.625 17.954 25.25 16 25.25a8.736 8.736 0 0 1-8.75-8.75c0-4.805 3.906-8.75 8.75-8.75 2.695 0 5.117 1.25 6.719 3.164l.781.938V8.687c0-.507.39-.937.938-.937a.95.95 0 0 1 .937.938v5.624c0 .547-.43.938-.937.938"></path>
              </svg>
            </button>
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
    </header>
  );
};