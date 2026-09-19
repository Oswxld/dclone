import { useState, useEffect, useRef } from 'react';
import styles from './TransferScreen.module.css';
import { useAccount, type AccountKey } from '../../context/AccountContext';

// Assets
import usDollarIcon from '../../assets/USDOLLAR.jpeg';
import usdtTronIcon from '../../assets/USDT(TRON).jpeg';
import cfdsIcon from '../../assets/CFDs.webp';
import optionsIcon from '../../assets/Options.webp';
import p2pDollarIcon from '../../assets/P2PDOLLAR.jpeg';

// Background image for the transfer success screen
import transferSuccessBg from '../../assets/successfullimage.jpeg';

type AccountOption = {
  key: AccountKey;
  name: string;
  group: 'Trading' | 'P2P' | 'Wallet';
  icon: string;
  currency: string;
};

const ACCOUNT_OPTIONS: AccountOption[] = [
  { key: 'walletUsd', name: 'US Dollar', group: 'Wallet', icon: usDollarIcon, currency: 'USD' },
  { key: 'optionsUsd', name: 'Options', group: 'Trading', icon: optionsIcon, currency: 'USD' },
  { key: 'cfdsUsd', name: 'CFDs', group: 'Trading', icon: cfdsIcon, currency: 'USD' },
  { key: 'p2pUsd', name: 'P2P US Dollar', group: 'P2P', icon: p2pDollarIcon, currency: 'USD' },
  { key: 'walletUsdt', name: 'USDT (Tron)', group: 'Wallet', icon: usdtTronIcon, currency: 'USDT' },
];

type TransferScreenProps = {
  onClose: () => void;
  onNavigateToOptions?: () => void;
};

export const TransferScreen = ({ onClose, onNavigateToOptions }: TransferScreenProps) => {
  const { balances, transferFunds } = useAccount();

  // Sensible default keys so the screen is immediately usable
  const [fromKey, setFromKey] = useState<AccountKey>('walletUsd');
  const [toKey, setToKey] = useState<AccountKey | null>('optionsUsd');
  const [amount, setAmount] = useState<string>('');
  const [pickerModal, setPickerModal] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [transferredSummary, setTransferredSummary] = useState({ amount: '0.00', toName: '' });

  const inputRef = useRef<HTMLInputElement>(null);

  // Preload background image so it is cached before the success screen mounts
  useEffect(() => {
    const img = new Image();
    img.src = transferSuccessBg;
  }, []);

  const fromAccount = ACCOUNT_OPTIONS.find((a) => a.key === fromKey) || ACCOUNT_OPTIONS[0];
  const toAccount = ACCOUNT_OPTIONS.find((a) => a.key === toKey);

  const availableBalance = balances?.[fromKey] ?? 0;
  const numAmount = parseFloat(amount) || 0;
  const isFormValid = numAmount > 0 && numAmount <= availableBalance && toKey !== null;

  const handleSwap = () => {
    if (!toKey) {
      setPickerModal('to');
      return;
    }
    const oldFrom = fromKey;
    setFromKey(toKey);
    setToKey(oldFrom);
  };

  const handlePercentage = (percent: number) => {
    if (availableBalance <= 0) return;
    const val = (availableBalance * (percent / 100)).toFixed(2);
    setAmount(val);
  };

  const handleExecuteTransfer = () => {
    // If destination is missing, guide the user to select one
    if (!toKey) {
      setPickerModal('to');
      return;
    }

    // If amount is zero or empty, highlight the input
    if (numAmount <= 0) {
      inputRef.current?.focus();
      return;
    }

    // If amount exceeds available balance, snap to maximum available
    if (numAmount > availableBalance) {
      setAmount(availableBalance.toFixed(2));
      return;
    }

    const ok = transferFunds ? transferFunds(fromKey, toKey, numAmount) : true;
    if (ok) {
      setTransferredSummary({
        amount: numAmount.toFixed(2),
        toName: toAccount?.name || 'Options',
      });
      setIsSuccess(true);
    }
  };

  const filteredOptions = ACCOUNT_OPTIONS.filter((opt) =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.transferContainer}>
      {/* Pre-cache the success backdrop */}
      <link rel="preload" as="image" href={transferSuccessBg} />

      {/* 1. Header Bar */}
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={onClose} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15171c" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <h1 className={styles.pageTitle}>Transfer</h1>

      {/* 2. Selectors Area */}
      <div className={styles.selectorsWrapper}>
        {/* From Card */}
        <div className={styles.selectorCard} onClick={() => setPickerModal('from')}>
          <span className={styles.fieldLabel}>From</span>
          <div className={styles.selectorContent}>
            <div className={styles.accountDetail}>
              <img src={fromAccount.icon} alt={fromAccount.name} className={styles.avatarCropped} />
              <div className={styles.accountTextCol}>
                <span className={styles.accountName}>{fromAccount.name}</span>
                <span className={styles.accountSubBal}>
                  {(balances?.[fromKey] ?? 0).toFixed(2)} {fromAccount.currency}
                </span>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Floating Swap Button */}
        <button type="button" className={styles.swapButton} onClick={handleSwap} aria-label="Swap accounts">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15171c" strokeWidth="2">
            <path d="M7 10h14l-4-4M17 14H3l4 4" />
          </svg>
        </button>

        {/* To Card */}
        <div
          className={styles.selectorCard}
          style={{ marginTop: 8 }}
          onClick={() => setPickerModal('to')}
        >
          <span className={styles.fieldLabel}>To</span>
          <div className={styles.selectorContent}>
            {toAccount ? (
              <div className={styles.accountDetail}>
                <img src={toAccount.icon} alt={toAccount.name} className={styles.avatarCropped} />
                <div className={styles.accountTextCol}>
                  <span className={styles.accountName}>{toAccount.name}</span>
                  <span className={styles.accountSubBal}>
                    {(balances?.[toKey!] ?? 0).toFixed(2)} {toAccount.currency}
                  </span>
                </div>
              </div>
            ) : (
              <span className={styles.placeholderText}>Select destination</span>
            )}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Zero Balance Warning Banner */}
      {availableBalance === 0 && (
        <div className={styles.warningBanner}>
          <span className={styles.warningText}>
            No funds in {fromAccount.name}.{' '}
            <span className={styles.warningDepositLink} onClick={onClose}>
              Deposit now.
            </span>
          </span>
          <div className={styles.warningArrowCircle}>›</div>
        </div>
      )}

      {/* 4. Amount Input */}
      <div className={styles.amountWrapper}>
        <div className={styles.amountBox}>
          <input
            ref={inputRef}
            type="number"
            placeholder="Amount"
            className={styles.amountInput}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className={styles.currencyUnit}>USD</span>
        </div>
        <p className={styles.availableLabel}>
          Available: {availableBalance.toFixed(2)} USD
        </p>
      </div>

      {/* 5. Percentage Quick Chips */}
      <div className={styles.chipsRow}>
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            type="button"
            className={styles.chipBtn}
            onClick={() => handlePercentage(pct)}
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* 6. Transfer CTA Button */}
      <button
        type="button"
        className={`${styles.transferBtn} ${isFormValid ? styles.btnActive : styles.btnDisabled}`}
        onClick={handleExecuteTransfer}
      >
        Transfer
      </button>

      {/* Bottom Sheet Modal */}
      {pickerModal && (
        <div className={styles.modalBackdrop} onClick={() => setPickerModal(null)}>
          <div className={styles.sheetContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>{pickerModal === 'from' ? 'From' : 'To'}</h2>

            <div className={styles.searchBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {(['Trading', 'P2P', 'Wallet'] as const).map((grp) => {
              const groupItems = filteredOptions.filter((opt) => opt.group === grp);
              if (groupItems.length === 0) return null;

              return (
                <div key={grp}>
                  <h3 className={styles.groupLabel}>{grp}</h3>
                  {groupItems.map((opt) => {
                    const isSelected =
                      pickerModal === 'from' ? fromKey === opt.key : toKey === opt.key;

                    return (
                      <div
                        key={opt.key}
                        className={`${styles.sheetRow} ${isSelected ? styles.sheetRowSelected : ''}`}
                        onClick={() => {
                          if (pickerModal === 'from') {
                            setFromKey(opt.key);
                          } else {
                            setToKey(opt.key);
                          }
                          setPickerModal(null);
                        }}
                      >
                        <div className={styles.accountDetail}>
                          <img src={opt.icon} alt={opt.name} className={styles.avatarCropped} />
                          <div className={styles.accountTextCol}>
                            <span className={styles.accountName}>{opt.name}</span>
                            <span className={styles.accountSubBal}>
                              {(balances?.[opt.key] ?? 0).toFixed(2)} {opt.currency}
                            </span>
                          </div>
                        </div>

                        <div className={`${styles.radioCircle} ${isSelected ? styles.radioSelected : ''}`}>
                          {isSelected && <div className={styles.radioDot} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transfer Successful Screen */}
      {isSuccess && (
        <div
          className={styles.successContainer}
          style={{ backgroundImage: `url(${transferSuccessBg})` }}
        >
          <div className={styles.successBottomCard}>
            <div className={styles.successTextContent}>
              <h2 className={styles.successTitle}>Transfer successful</h2>
              <p className={styles.successDesc}>
                {transferredSummary.amount} USD transferred to your {transferredSummary.toName} account.
              </p>
            </div>

            <div className={styles.successActions}>
              <button
                type="button"
                className={styles.startTradingBtn}
                onClick={() => {
                  if (onNavigateToOptions) onNavigateToOptions();
                  onClose();
                }}
              >
                Start trading
              </button>
              <button
                type="button"
                className={styles.portfolioReturnBtn}
                onClick={onClose}
              >
                Go to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};