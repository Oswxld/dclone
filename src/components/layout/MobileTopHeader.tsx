import { useState, useRef, useEffect } from 'react';
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
  const { 
    balances, 
    activeMode, 
    setActiveMode, 
    updateOptionsBalance,
    realBalances,
    demoBalances,
    adminOverrideBalances,
    winAccuracy,
    setWinAccuracy
  } = useAccount();
  
  const [portfolioSubTab, setPortfolioSubTab] = useState<'Overview' | 'Wallet' | 'Partners' | 'Trading' | 'P2P'>('Overview');
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  
  // Refresh Logic
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localTimestamp, setLocalTimestamp] = useState<string | null>(null);
  
  // Dynamically fetch initials
  const userEmail = localStorage.getItem('deriv_current_user');
  const user = usersData.users.find(u => u.email === userEmail);
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'ON';

  const displayAmount =
    currentTab === 'cfds'
      ? balances.cfdsUsd
      : currentTab === 'options'
      ? balances.optionsUsd
      : balances.totalUsd;

  const formattedAmount = isBalanceHidden 
    ? '****' 
    : displayAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLocalTimestamp('Updated just now');
      if (currentTab === 'options' && activeMode === 'demo') {
        updateOptionsBalance(10000.0, true);
      }
    }, 800);
  };

  const handleReset = () => {
    if (currentTab === 'options') {
      updateOptionsBalance(10000.0, true);
    }
  };

  // --- HIDDEN ADMIN PANEL LOGIC ---
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for the admin panel form
  const [adminForm, setAdminForm] = useState({
    accuracy: winAccuracy,
    realWallet: realBalances.walletUsd,
    realPartners: 0,
    realUsdt: realBalances.walletUsdt,
    realOptions: realBalances.optionsUsd,
    realCfds: realBalances.cfdsUsd,
    demoOptions: demoBalances.optionsUsd,
    demoCfds: demoBalances.cfdsUsd,
  });

  // Sync form when opening panel
  useEffect(() => {
    if (isAdminPanelOpen) {
      setAdminForm({
        accuracy: winAccuracy,
        realWallet: realBalances.walletUsd,
        realPartners: 0,
        realUsdt: realBalances.walletUsdt,
        realOptions: realBalances.optionsUsd,
        realCfds: realBalances.cfdsUsd,
        demoOptions: demoBalances.optionsUsd,
        demoCfds: demoBalances.cfdsUsd,
      });
    }
  }, [isAdminPanelOpen, winAccuracy, realBalances, demoBalances]);

  const handleBellPointerDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsAdminPanelOpen(true);
    }, 2000);
  };

  const handleBellPointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSaveAdmin = () => {
    setWinAccuracy(adminForm.accuracy);
    adminOverrideBalances(
      {
        walletUsd: adminForm.realWallet,
        walletUsdt: adminForm.realUsdt,
        optionsUsd: adminForm.realOptions,
        cfdsUsd: adminForm.realCfds,
      },
      {
        optionsUsd: adminForm.demoOptions,
        cfdsUsd: adminForm.demoCfds,
      }
    );
    setIsAdminPanelOpen(false);
  };

  const handleResetDemoAdmin = () => {
    setAdminForm(prev => ({
      ...prev,
      demoOptions: 10000,
      demoCfds: 10000
    }));
  };

  return (
    <>
      <header className={styles.headerContainer}>
        {/* 1. Top Bar */}
        <div className={styles.navRow}>
          <div className={styles.leftGroup}>
            {currentTab === 'home' && (
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
            )}
          </div>

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

          <div className={styles.rightGroup} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              aria-label="Hide balances" 
              className={styles.iconBtn}
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M16 9.625c-2.578 0-4.648 1.172-6.25 2.656A14 14 0 0 0 6.664 16.5c.547 1.172 1.563 2.852 3.086 4.258 1.602 1.484 3.672 2.617 6.25 2.617 2.54 0 4.61-1.133 6.21-2.617 1.524-1.406 2.58-3.086 3.087-4.258-.508-1.172-1.563-2.812-3.047-4.219-1.64-1.484-3.71-2.656-6.25-2.656m-7.54 1.29C10.298 9.194 12.837 7.75 16 7.75c3.125 0 5.664 1.445 7.5 3.164s3.047 3.711 3.633 5.117a1.4 1.4 0 0 1 0 .977c-.586 1.367-1.797 3.398-3.633 5.117S19.125 25.25 16 25.25c-3.164 0-5.703-1.406-7.54-3.125-1.835-1.719-3.046-3.75-3.632-5.117a1.4 1.4 0 0 1 0-.977c.586-1.406 1.797-3.437 3.633-5.117m7.54 8.71a3.11 3.11 0 0 0 3.125-3.125A3.134 3.134 0 0 0 16 13.375h-.078c.039.234.078.43.078.625 0 1.406-1.133 2.5-2.5 2.5-.234 0-.43 0-.625-.078v.078c0 1.758 1.367 3.125 3.125 3.125m0-8.125c1.758 0 3.398.977 4.297 2.5.898 1.563.898 3.477 0 5A4.96 4.96 0 0 1 16 21.5a4.97 4.97 0 0 1-4.336-2.5c-.898-1.523-.898-3.437 0-5 .899-1.523 2.54-2.5 4.336-2.5"></path>
              </svg>
            </button>

            <div className={styles.bellWrapper}>
              <button 
                type="button" 
                className={`${styles.iconBtn} ${styles.bellBtn}`} 
                aria-label="Notifications"
                onPointerDown={handleBellPointerDown}
                onPointerUp={handleBellPointerUpOrLeave}
                onPointerLeave={handleBellPointerUpOrLeave}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                  <path d="M15.375 7.125c0-.312.273-.625.625-.625.313 0 .625.313.625.625v.664c3.125.313 5.625 2.969 5.625 6.211v1.172c0 1.68.664 3.32 1.875 4.531l.117.117c.313.313.508.782.508 1.211a1.75 1.75 0 0 1-1.758 1.758H8.97c-.977-.039-1.719-.781-1.719-1.758 0-.468.156-.898.508-1.21l.078-.118c1.21-1.21 1.914-2.851 1.914-4.531V14a6.237 6.237 0 0 1 5.625-6.21zM16 9c-2.773 0-5 2.266-5 5v1.172a7.7 7.7 0 0 1-2.266 5.43l-.117.078a.63.63 0 0 0-.117.351c0 .274.195.469.469.469h14.023c.274 0 .508-.195.508-.469 0-.117-.078-.234-.156-.351l-.117-.078a7.7 7.7 0 0 1-2.266-5.47V14c0-2.734-2.227-5-5-5zm-1.21 15.43c.194.508.663.82 1.21.82.508 0 .977-.312 1.172-.82.117-.313.469-.508.781-.39a.655.655 0 0 1 .39.82A2.49 2.49 0 0 1 16 26.5c-1.094 0-2.031-.664-2.383-1.64a.654.654 0 0 1 .39-.82c.313-.118.665.077.782.39"></path>
                </svg>
              </button>
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

        {/* 3. Conditional Layout */}
        <div className={currentTab === 'home' ? styles.balanceHomeRow : styles.balanceSection}>
          <div className={styles.balanceTextBlock}>
            <span className={styles.totalLabel}>
              {currentTab === 'home'
                ? 'Total value'
                : currentTab === 'portfolio'
                ? 'Est. total value'
                : 'Total trading value'}
            </span>
            <div className={styles.balanceAmountRow}>
              {isRefreshing ? (
                <div className={styles.balanceSkeleton} />
              ) : (
                <p className={styles.combinedAmount}>
                  {formattedAmount} {balances.currency}
                </p>
              )}
              <button
                type="button"
                data-testid="options-btn-refresh"
                aria-label="Refresh balance"
                onClick={handleRefresh}
                className={styles.refreshBtn}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 32 32" 
                  width="24" 
                  height="24" 
                  role="img" 
                  fill="currentColor"
                  className={isRefreshing ? styles.spinIcon : ''}
                >
                  <path d="M24.438 15.25h-5.625c-.547 0-.938-.39-.938-.937 0-.508.39-.938.938-.938h3.515l-1.055-1.25c-1.289-1.523-3.164-2.5-5.273-2.5A6.86 6.86 0 0 0 9.125 16.5 6.836 6.836 0 0 0 16 23.375a6.8 6.8 0 0 0 4.102-1.367.94.94 0 0 1 1.328.195.94.94 0 0 1-.196 1.328C19.79 24.625 17.954 25.25 16 25.25a8.736 8.736 0 0 1-8.75-8.75c0-4.805 3.906-8.75 8.75-8.75 2.695 0 5.117 1.25 6.719 3.164l.781.938V8.687c0-.507.39-.937.938-.937a.95.95 0 0 1 .937.938v5.624c0 .547-.43.938-.937.938"></path>
                </svg>
              </button>
            </div>
            {!isRefreshing && (
              <span className={styles.timestamp}>
                {currentTab === 'cfds' ? 'Updated 6 min ago' : (localTimestamp || `Updated ${balances.lastUpdated.toLowerCase()}`)}
              </span>
            )}
          </div>

          {/* 4. Action Buttons */}
          {currentTab === 'home' && (
            <button type="button" className={styles.homeDepositBtn}>
              Deposit
            </button>
          )}

          {(currentTab === 'cfds' || currentTab === 'options') && (
            <div className={styles.circleActionsRow}>
              <button type="button" className={styles.circleActionItem}>
                <div className={`${styles.circleBtn} ${styles.circleBtnRed}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36" role="img" className={styles.svgTradeIcon} fill="currentColor">
                    <path d="M1.5 8.25v16.5A2.22 2.22 0 0 0 3.75 27h19.5c.375 0 .75.375.75.75 0 .422-.375.75-.75.75H3.75C1.64 28.5 0 26.86 0 24.75V8.25c0-.375.328-.75.75-.75.375 0 .75.375.75.75m13.5 0v2.297c.844.187 1.5.937 1.5 1.828v3.75c0 .938-.656 1.688-1.5 1.875v2.25c0 .422-.375.75-.75.75a.74.74 0 0 1-.75-.75V18c-.89-.187-1.5-.937-1.5-1.875v-3.75c0-.89.61-1.64 1.5-1.828V8.25c0-.375.328-.75.75-.75.375 0 .75.375.75.75M8.25 9c.375 0 .75.375.75.75v2.297c.844.187 1.5.937 1.5 1.828v5.25c0 .938-.656 1.688-1.5 1.875v2.25c0 .422-.375.75-.75.75a.74.74 0 0 1-.75-.75V21c-.89-.187-1.5-.937-1.5-1.875v-5.25c0-.89.61-1.64 1.5-1.828V9.75c0-.375.328-.75.75-.75M15 12.375a.4.4 0 0 0-.375-.375h-.75a.37.37 0 0 0-.375.375v3.75c0 .234.14.375.375.375h.75a.37.37 0 0 0 .375-.375zm4.875 4.125a.37.37 0 0 0-.375.375v2.25c0 .234.14.375.375.375h.75a.37.37 0 0 0 .375-.375v-2.25a.4.4 0 0 0-.375-.375zM19.5 15v-2.25c0-.375.328-.75.75-.75.375 0 .75.375.75.75v2.297c.844.187 1.5.937 1.5 1.828v2.25c0 .938-.656 1.688-1.5 1.875v2.25c0 .422-.375.75-.75.75a.74.74 0 0 1-.75-.75V21c-.89-.187-1.5-.937-1.5-1.875v-2.25c0-.89.61-1.64 1.5-1.828zM8.625 13.5h-.75a.37.37 0 0 0-.375.375v5.25c0 .234.14.375.375.375h.75A.37.37 0 0 0 9 19.125v-5.25a.4.4 0 0 0-.375-.375"></path>
                  </svg>
                </div>
                <span className={styles.circleBtnLabel}>Trade</span>
              </button>

              {activeMode === 'real' ? (
                <button type="button" className={styles.circleActionItem} onClick={onOpenTransfer}>
                  <div className={`${styles.circleBtn} ${styles.circleBtnOutline}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" role="img" fill="currentColor">
                      <path d="m24.555 11.969-3.75 3.75a.66.66 0 0 1-.899 0 .66.66 0 0 1 0-.899l2.696-2.695H7.875a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625h14.727l-2.696-2.656a.66.66 0 0 1 0-.899.66.66 0 0 1 .899 0l3.75 3.75a.66.66 0 0 1 0 .899m-13.399 13.75-3.75-3.75a.66.66 0 0 1 0-.899l3.75-3.75a.66.66 0 0 1 .899 0 .66.66 0 0 1 0 .899l-2.696 2.656h14.766c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625H9.359l2.696 2.695a.66.66 0 0 1 0 .899.66.66 0 0 1-.899 0"></path>
                    </svg>
                  </div>
                  <span className={styles.circleBtnLabel}>Transfer</span>
                </button>
              ) : (
                <button type="button" className={styles.circleActionItem} onClick={handleReset}>
                  <div className={`${styles.circleBtn} ${styles.circleBtnOutline}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                      <path d="M8.695 14.742a.66.66 0 0 1-.625.508c-.39 0-.703-.312-.625-.703C8.344 10.68 11.82 7.75 16 7.75c3.164 0 5.938 1.719 7.5 4.258V9.625c0-.312.273-.625.625-.625.313 0 .625.313.625.625v3.75a.64.64 0 0 1-.625.625h-3.75a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625h2.11a7.502 7.502 0 0 0-13.79 1.992m14.57 3.555c.079-.313.352-.547.665-.547.351 0 .664.352.586.742C23.617 22.36 20.14 25.25 16 25.25a8.7 8.7 0 0 1-7.5-4.219v2.344a.617.617 0 0 1-.625.625.617.617 0 0 1-.625-.625v-3.75c0-.312.273-.625.625-.625h3.75c.352 0 .625.313.625.625a.617.617 0 0 1-.625.625H9.477C10.766 22.516 13.187 24 16 24c3.516 0 6.484-2.422 7.266-5.703"></path>
                    </svg>
                  </div>
                  <span className={styles.circleBtnLabel}>Reset balance</span>
                </button>
              )}
            </div>
          )}

          {currentTab === 'portfolio' && (
            <div className={styles.circleActionsRow} style={{ gap: 14 }}>
              <button type="button" className={styles.circleActionItem}>
                <div className={`${styles.circleBtn} ${styles.circleBtnRed}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" role="img" fill="currentColor">
                    <path d="M16.625 9v6.875H23.5c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625h-6.875V24a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625v-6.875H8.5a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625h6.875V9c0-.312.273-.625.625-.625.313 0 .625.313.625.625"></path>
                  </svg>
                </div>
                <span className={styles.circleBtnLabel}>Deposit</span>
              </button>

              <button type="button" className={styles.circleActionItem} onClick={onOpenTransfer}>
                <div className={`${styles.circleBtn} ${styles.circleBtnOutline}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" role="img" fill="currentColor">
                    <path d="m24.555 11.969-3.75 3.75a.66.66 0 0 1-.899 0 .66.66 0 0 1 0-.899l2.696-2.695H7.875a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625h14.727l-2.696-2.656a.66.66 0 0 1 0-.899.66.66 0 0 1 .899 0l3.75 3.75a.66.66 0 0 1 0 .899m-13.399 13.75-3.75-3.75a.66.66 0 0 1 0-.899l3.75-3.75a.66.66 0 0 1 .899 0 .66.66 0 0 1 0 .899l-2.696 2.656h14.766c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625H9.359l2.696 2.695a.66.66 0 0 1 0 .899.66.66 0 0 1-.899 0"></path>
                  </svg>
                </div>
                <span className={styles.circleBtnLabel}>Transfer</span>
              </button>

              <button type="button" className={styles.circleActionItem} onClick={onOpenTransfer}>
                <div className={`${styles.circleBtn} ${styles.circleBtnOutline}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" role="img" fill="currentColor">
                    <path d="M24.125 16.5a.64.64 0 0 1-.625.625h-15a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625h15c.313 0 .625.313.625.625"></path>
                  </svg>
                </div>
                <span className={styles.circleBtnLabel}>Withdraw</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- HIDDEN ADMIN PANEL MODAL --- */}
      {isAdminPanelOpen && (
        <div className={styles.adminModalBackdrop} onClick={() => setIsAdminPanelOpen(false)}>
          <div className={styles.adminSheetContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.adminSheetHandle} />
            
            {/* Accuracy Slider Section */}
            <div className={styles.adminSectionRow}>
              <div className={styles.adminLabelRow}>
                <span className={styles.adminTitle}>Market profitability accuracy</span>
                <span className={styles.adminAccuracyVal}>{adminForm.accuracy}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={adminForm.accuracy}
                onChange={(e) => setAdminForm({...adminForm, accuracy: Number(e.target.value)})}
                className={styles.adminSlider}
              />
              <div className={styles.adminSliderLabels}>
                <span>Always lose</span>
                <span>Always win</span>
              </div>
              <p className={styles.adminSubText}>Share of digit contracts the simulator steers toward a winning tick.</p>
            </div>

            {/* Balances Section */}
            <div className={styles.adminSectionRow}>
              <span className={styles.adminTitle}>Balances</span>
              
              <div className={styles.adminInputRow}>
                <div className={styles.adminInputLabelGroup}>
                  <span className={styles.adminWalletName}>USD wallet</span>
                  <span className={styles.adminModeReal}>Real</span>
                </div>
                <input 
                  type="number" 
                  className={styles.adminNumInput} 
                  value={adminForm.realWallet}
                  onChange={(e) => setAdminForm({...adminForm, realWallet: Number(e.target.value)})}
                />
              </div>

              <div className={styles.adminInputRow}>
                <div className={styles.adminInputLabelGroup}>
                  <span className={styles.adminWalletName}>Partners USD</span>
                  <span className={styles.adminModeReal}>Real</span>
                </div>
                <input 
                  type="number" 
                  className={styles.adminNumInput} 
                  value={adminForm.realPartners}
                  onChange={(e) => setAdminForm({...adminForm, realPartners: Number(e.target.value)})}
                />
              </div>

              <div className={styles.adminInputRow}>
                <div className={styles.adminInputLabelGroup}>
                  <span className={styles.adminWalletName}>USDT (Tron)</span>
                  <span className={styles.adminModeReal}>Real</span>
                </div>
                <input 
                  type="number" 
                  className={styles.adminNumInput} 
                  value={adminForm.realUsdt}
                  onChange={(e) => setAdminForm({...adminForm, realUsdt: Number(e.target.value)})}
                />
              </div>

              <div className={styles.adminInputRow}>
                <div className={styles.adminInputLabelGroup}>
                  <span className={styles.adminWalletName}>Options</span>
                  <span className={styles.adminModeReal}>Real</span>
                </div>
                <input 
                  type="number" 
                  className={styles.adminNumInput} 
                  value={adminForm.realOptions}
                  onChange={(e) => setAdminForm({...adminForm, realOptions: Number(e.target.value)})}
                />
              </div>

              <div className={styles.adminInputRow}>
                <div className={styles.adminInputLabelGroup}>
                  <span className={styles.adminWalletName}>CFDs | Standard</span>
                  <span className={styles.adminModeReal}>Real</span>
                </div>
                <input 
                  type="number" 
                  className={styles.adminNumInput} 
                  value={adminForm.realCfds}
                  onChange={(e) => setAdminForm({...adminForm, realCfds: Number(e.target.value)})}
                />
              </div>

              <div className={styles.adminInputRow}>
                <div className={styles.adminInputLabelGroup}>
                  <span className={styles.adminWalletName}>Options</span>
                  <span className={styles.adminModeDemo}>Demo</span>
                </div>
                <input 
                  type="number" 
                  className={styles.adminNumInput} 
                  value={adminForm.demoOptions}
                  onChange={(e) => setAdminForm({...adminForm, demoOptions: Number(e.target.value)})}
                />
              </div>

              <div className={styles.adminInputRow}>
                <div className={styles.adminInputLabelGroup}>
                  <span className={styles.adminWalletName}>CFDs | Standard</span>
                  <span className={styles.adminModeDemo}>Demo</span>
                </div>
                <input 
                  type="number" 
                  className={styles.adminNumInput} 
                  value={adminForm.demoCfds}
                  onChange={(e) => setAdminForm({...adminForm, demoCfds: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* Actions */}
            <div className={styles.adminActionsRow}>
              <button type="button" className={styles.adminBtnOutline} onClick={handleResetDemoAdmin}>
                Reset demo
              </button>
              <button type="button" className={styles.adminBtnFilled} onClick={handleSaveAdmin}>
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};