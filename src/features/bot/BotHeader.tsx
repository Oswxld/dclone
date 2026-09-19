import { useState } from 'react';
import styles from './BotHeader.module.css';
import { useAccount } from '../../context/AccountContext';
import derivBotLogo from '../../assets/DerivBot.png';

type BotHeaderProps = {
  onBackToApp?: () => void;
  customBalance?: string | number;
};

export const BotHeader = ({ onBackToApp, customBalance }: BotHeaderProps) => {
  const { balances, activeMode, setActiveMode } = useAccount();
  
  // Track if the Action Sheet is open
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const activeNum =
    customBalance !== undefined && customBalance !== null
      ? typeof customBalance === 'number'
        ? customBalance
        : parseFloat(customBalance)
      : balances.optionsUsd;

  const displayBal = activeNum.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Fallbacks for the inactive account display in the menu
  const inactiveDemoBal = '10,000.00';
  const inactiveRealBal = '0.00';

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftGroup}>
          <div
            className={styles.dbBadge}
            onClick={onBackToApp}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onBackToApp?.();
            }}
            aria-label="Back to App"
          >
            <img 
              src={derivBotLogo} 
              alt="Deriv Bot" 
              style={{ width: '40px', height: '40px', objectFit: 'contain' }} 
            />
          </div>
          
          <div className={styles.accountInfo}>
            {/* Account Switcher Trigger */}
            <div 
              className={styles.accountTypeRow} 
              onClick={() => setIsActionSheetOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.accountTypeLabel} style={{ color: activeMode === 'demo' ? '#ff9900' : '#00a8a8' }}>
                {activeMode === 'demo' ? 'Demo account' : 'Real account'}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ 
                  color: activeMode === 'demo' ? '#ff9900' : '#00a8a8',
                  transform: isActionSheetOpen ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s ease' 
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <span className={styles.balanceText}>{displayBal} USD</span>
          </div>
        </div>

        {/* Dynamic Action Button */}
        {activeMode === 'demo' ? (
          <button type="button" className={styles.tryRealBtn} onClick={() => setActiveMode('real')}>
            Try real
          </button>
        ) : (
          <button type="button" className={styles.tryRealBtn} style={{ backgroundColor: '#ff444f', color: '#ffffff', border: 'none' }}>
            Deposit
          </button>
        )}
      </header>

      {/* ACTION SHEET (Mobile Pop-up Bottom Drawer) */}
      {isActionSheetOpen && (
        <div className={styles.actionSheetBackdrop} onClick={() => setIsActionSheetOpen(false)}>
          <div 
            className={styles.actionSheet}
            onClick={(e) => e.stopPropagation()} // Clicking inside the drawer won't close it
          >
            <div className={styles.actionSheetHeader}>
              <div className={styles.actionSheetDragHandle}>
                <div className={styles.actionSheetDragIndicator}></div>
              </div>
            </div>
            
            <div className={styles.actionSheetContent}>
              <div className={styles.accDropdownList}>
                
                {/* Real Account Option */}
                <div 
                  className={styles.accDropdownAccountWrapper} 
                  onClick={() => { setActiveMode('real'); setIsActionSheetOpen(false); }}
                >
                  <div className={`${styles.accDropdownAccount} ${activeMode === 'real' ? styles.accDropdownAccountSelected : ''}`}>
                    <div className={`${styles.accDropdownAccountName} ${styles.accDropdownAccountNameReal}`}>
                      Real account
                    </div>
                    <div className={styles.accDropdownAccountBalance}>
                      {activeMode === 'real' ? displayBal : inactiveRealBal} USD
                    </div>
                  </div>
                </div>

                {/* Demo Account Option */}
                <div 
                  className={styles.accDropdownAccountWrapper} 
                  onClick={() => { setActiveMode('demo'); setIsActionSheetOpen(false); }}
                >
                  <div className={`${styles.accDropdownAccount} ${activeMode === 'demo' ? styles.accDropdownAccountSelected : ''}`}>
                    <div className={`${styles.accDropdownAccountName} ${styles.accDropdownAccountNameDemo}`}>
                      Demo account
                    </div>
                    <div className={styles.accDropdownAccountBalance}>
                      {activeMode === 'demo' ? displayBal : inactiveDemoBal} USD
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};