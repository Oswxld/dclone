import { useState, useRef } from 'react';
import styles from './TransferScreen.module.css';
import { useAccount, type AccountKey } from '../../context/AccountContext';

// Assets
import usDollarIcon from '../../assets/USDOLLAR.jpeg';
import usdtTronIcon from '../../assets/USDT(TRON).jpeg';
import cfdsIcon from '../../assets/CFDs.webp';
import optionsIcon from '../../assets/Options.webp';
import p2pDollarIcon from '../../assets/P2PDOLLAR.jpeg';

// Local image from the exact same directory as instructed
import derivMoneyImg from './derivmoney.webp';

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
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transferredSummary, setTransferredSummary] = useState({ amount: '0.00', toName: '' });

  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenReview = () => {
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

    // Open the Review and Confirm bottom sheet instead of committing immediately
    setIsReviewOpen(true);
  };

  const handleExecuteTransfer = () => {
    if (!toKey) return;
    const ok = transferFunds ? transferFunds(fromKey, toKey, numAmount) : true;
    if (ok) {
      setTransferredSummary({
        amount: numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        toName: toAccount?.name || 'Options',
      });
      setIsReviewOpen(false);
      setIsSuccess(true);
    }
  };

  // Dynamically filter options based on search query AND mutual exclusivity
  const filteredOptions = ACCOUNT_OPTIONS.filter((opt) => {
    const matchesSearch = opt.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If opening the "From" picker, hide whatever is currently selected in "To"
    if (pickerModal === 'from') {
      return matchesSearch && opt.key !== toKey;
    }
    // If opening the "To" picker, hide whatever is currently selected in "From"
    if (pickerModal === 'to') {
      return matchesSearch && opt.key !== fromKey;
    }
    
    return matchesSearch;
  });

  return (
    <div className={styles.transferContainer}>
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
        onClick={handleOpenReview}
      >
        Transfer
      </button>

      {/* Account Picker Modal */}
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

      {/* Review and Confirm Bottom Sheet */}
      {isReviewOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsReviewOpen(false)}>
          <div className={styles.sheetContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.reviewSheetHeader}>Review and confirm</h2>

            {/* From Row */}
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>From</span>
              <div className={styles.reviewValueAccount}>
                <img src={fromAccount.icon} alt={fromAccount.name} className={styles.avatarCropped} width="22" height="22" />
                <span>{fromAccount.name}</span>
              </div>
            </div>

            {/* To Row */}
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>To</span>
              <div className={styles.reviewValueAccount}>
                {toAccount && <img src={toAccount.icon} alt={toAccount.name} className={styles.avatarCropped} width="22" height="22" />}
                <span>{toAccount?.name}</span>
              </div>
            </div>

            <div className={styles.reviewDivider} />

            {/* Transfer amount Row */}
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Transfer amount</span>
              <span className={styles.reviewValueText}>{numAmount.toFixed(2)} USD</span>
            </div>

            {/* You'll receive Row */}
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>You'll receive</span>
              <span className={styles.reviewValueText}>{numAmount.toFixed(2)} USD</span>
            </div>

            {/* Confirm CTA Button */}
            <button
              type="button"
              className={styles.confirmTransferBtn}
              onClick={handleExecuteTransfer}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Re-Architected Transfer Successful Screen */}
      {isSuccess && (
        <div className={styles.successContainer}>
          <div className={styles.successContentWrapper}>
            <figure className={styles.successFigure}>
              <img src={derivMoneyImg} alt="" className={styles.successImage} />
              
              <div className={styles.confettiWrapper}>
                <svg viewBox="0 0 653 750" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Confetti" className={styles.confettiSvg}>
                  <defs>
                    <linearGradient id="r0" gradientUnits="userSpaceOnUse" x1="68.6" y1="1.6" x2="83.3" y2="19.1">
                      <stop offset="0" stopColor="#ff8d7f" />
                      <stop offset=".45" stopColor="#f4564a" />
                      <stop offset="1" stopColor="#cf2a23" />
                    </linearGradient>
                    <linearGradient id="r1" gradientUnits="userSpaceOnUse" x1="83.2" y1="22.0" x2="97.6" y2="39.1">
                      <stop offset="0" stopColor="#cf2a23" />
                      <stop offset=".45" stopColor="#8a1a16" />
                      <stop offset="1" stopColor="#8a1a16" />
                    </linearGradient>
                    <linearGradient id="r2" gradientUnits="userSpaceOnUse" x1="99.8" y1="41.8" x2="113.7" y2="58.3">
                      <stop offset="0" stopColor="#ff8d7f" />
                      <stop offset=".45" stopColor="#f4564a" />
                      <stop offset="1" stopColor="#cf2a23" />
                    </linearGradient>
                    <linearGradient id="r3" gradientUnits="userSpaceOnUse" x1="116.4" y1="61.6" x2="129.9" y2="77.6">
                      <stop offset="0" stopColor="#cf2a23" />
                      <stop offset=".45" stopColor="#8a1a16" />
                      <stop offset="1" stopColor="#8a1a16" />
                    </linearGradient>
                    <linearGradient id="r4" gradientUnits="userSpaceOnUse" x1="133.1" y1="81.4" x2="146.1" y2="96.9">
                      <stop offset="0" stopColor="#ff8d7f" />
                      <stop offset=".45" stopColor="#f4564a" />
                      <stop offset="1" stopColor="#cf2a23" />
                    </linearGradient>
                    <linearGradient id="r5" gradientUnits="userSpaceOnUse" x1="158.0" y1="88.6" x2="165.6" y2="97.6">
                      <stop offset="0" stopColor="#cf2a23" />
                      <stop offset=".45" stopColor="#8a1a16" />
                      <stop offset="1" stopColor="#8a1a16" />
                    </linearGradient>
                    <linearGradient id="w0" gradientUnits="userSpaceOnUse" x1="441.1" y1="616.7" x2="450.5" y2="633.1">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset=".45" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#c4c7d2" />
                    </linearGradient>
                    <linearGradient id="w1" gradientUnits="userSpaceOnUse" x1="453.1" y1="640.8" x2="462.4" y2="656.8">
                      <stop offset="0" stopColor="#c4c7d2" />
                      <stop offset=".45" stopColor="#83868f" />
                      <stop offset="1" stopColor="#83868f" />
                    </linearGradient>
                    <linearGradient id="w2" gradientUnits="userSpaceOnUse" x1="467.0" y1="664.9" x2="476.0" y2="680.4">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset=".45" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#c4c7d2" />
                    </linearGradient>
                    <linearGradient id="w3" gradientUnits="userSpaceOnUse" x1="480.9" y1="689.0" x2="489.6" y2="703.9">
                      <stop offset="0" stopColor="#c4c7d2" />
                      <stop offset=".45" stopColor="#83868f" />
                      <stop offset="1" stopColor="#83868f" />
                    </linearGradient>
                    <linearGradient id="w4" gradientUnits="userSpaceOnUse" x1="494.8" y1="713.0" x2="503.2" y2="727.5">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset=".45" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#c4c7d2" />
                    </linearGradient>
                    <linearGradient id="w5" gradientUnits="userSpaceOnUse" x1="518.1" y1="724.1" x2="519.8" y2="727.1">
                      <stop offset="0" stopColor="#c4c7d2" />
                      <stop offset=".45" stopColor="#83868f" />
                      <stop offset="1" stopColor="#83868f" />
                    </linearGradient>
                    <linearGradient id="k1a" gradientUnits="userSpaceOnUse" x1="197.5" y1="15.8" x2="197.5" y2="67.9">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#e6e8ef" />
                    </linearGradient>
                    <linearGradient id="k1b" gradientUnits="userSpaceOnUse" x1="209.6" y1="19.3" x2="212.5" y2="72.2">
                      <stop offset="0" stopColor="#c6c9d4" />
                      <stop offset="1" stopColor="#9396a5" />
                    </linearGradient>
                    <linearGradient id="k2a" gradientUnits="userSpaceOnUse" x1="44.4" y1="164.4" x2="67.0" y2="189.7">
                      <stop offset="0" stopColor="#ffffff" />
                      <stop offset="1" stopColor="#e6e8ef" />
                    </linearGradient>
                    <linearGradient id="k2b" gradientUnits="userSpaceOnUse" x1="57.8" y1="161.1" x2="83.6" y2="185.6">
                      <stop offset="0" stopColor="#c6c9d4" />
                      <stop offset="1" stopColor="#9396a5" />
                    </linearGradient>
                    <linearGradient id="k3a" gradientUnits="userSpaceOnUse" x1="368.1" y1="684.8" x2="374.5" y2="743.8">
                      <stop offset="0" stopColor="#f2564a" />
                      <stop offset="1" stopColor="#d92e26" />
                    </linearGradient>
                    <linearGradient id="k3b" gradientUnits="userSpaceOnUse" x1="379.0" y1="685.9" x2="387.9" y2="745.2">
                      <stop offset="0" stopColor="#c02420" />
                      <stop offset="1" stopColor="#8d1a17" />
                    </linearGradient>
                    <linearGradient id="k4a" gradientUnits="userSpaceOnUse" x1="547.7" y1="628.1" x2="547.9" y2="655.3">
                      <stop offset="0" stopColor="#f2564a" />
                      <stop offset="1" stopColor="#d92e26" />
                    </linearGradient>
                    <linearGradient id="k4b" gradientUnits="userSpaceOnUse" x1="557.7" y1="633.4" x2="560.3" y2="661.9">
                      <stop offset="0" stopColor="#c02420" />
                      <stop offset="1" stopColor="#8d1a17" />
                    </linearGradient>
                    <filter id="cs" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#05010f" floodOpacity=".45" />
                    </filter>
                  </defs>
                  <g filter="url(#cs)">
                    <path d="M96.3 7.0L96.0 7.0L95.2 7.3L94.2 7.9L93.0 9.0L91.5 10.3L89.9 12.1L88.2 14.1L86.5 16.5L84.8 19.1L83.2 22.0L81.8 25.0L80.6 28.2L79.7 31.4L79.0 34.6L78.8 37.8L78.8 41.0L79.3 43.9L80.2 46.7L81.4 49.2L83.0 51.5L84.9 53.7L85.2 53.7L85.8 53.4L86.8 52.8L88.0 51.8L89.4 50.5L90.9 48.8L92.6 46.8L94.3 44.5L96.0 41.9L97.6 39.1L99.0 36.1L100.2 32.9L101.2 29.7L101.9 26.4L102.3 23.2L102.2 20.0L101.8 17.0L101.0 14.2L99.8 11.6L98.2 9.2Z" fill="url(#r1)" />
                    <path d="M128.3 46.9L128.0 46.9L127.3 47.3L126.4 48.0L125.3 49.0L124.0 50.4L122.5 52.0L121.0 54.0L119.4 56.3L117.9 58.8L116.4 61.6L115.2 64.5L114.1 67.5L113.3 70.6L112.7 73.7L112.5 76.8L112.7 79.7L113.1 82.6L114.0 85.2L115.2 87.7L116.8 89.9L118.5 91.9L118.7 91.9L119.3 91.6L120.1 90.9L121.2 89.9L122.5 88.6L123.9 87.0L125.4 85.0L126.9 82.8L128.5 80.3L129.9 77.6L131.2 74.7L132.3 71.7L133.2 68.6L133.8 65.5L134.1 62.4L134.0 59.4L133.6 56.5L132.8 53.8L131.6 51.3L130.0 49.0Z" fill="url(#r3)" />
                    <path d="M160.2 86.8L160.1 86.8L160.0 86.8L159.9 86.9L159.7 87.0L159.5 87.2L159.3 87.4L159.0 87.6L158.7 87.9L158.4 88.2L158.0 88.6L157.7 89.0L157.2 89.4L156.8 89.9L156.4 90.4L155.9 91.0L155.4 91.6L154.9 92.2L154.4 92.9L153.9 93.6L153.4 94.4L165.0 108.2L165.3 107.1L165.5 106.0L165.6 104.9L165.7 103.9L165.8 102.8L165.9 101.7L165.9 100.7L165.8 99.6L165.7 98.6L165.6 97.6L165.4 96.6L165.2 95.6L165.0 94.7L164.7 93.8L164.3 92.8L163.9 92.0L163.4 91.1L163.0 90.3L162.4 89.5L161.8 88.8Z" fill="url(#r5)" />
                    <path d="M49.3 12.6L49.8 11.9L50.6 11.0L51.8 9.9L53.4 8.7L55.2 7.4L57.4 6.1L59.9 4.9L62.6 3.7L65.5 2.6L68.6 1.6L71.7 0.9L74.9 0.4L78.2 0.1L81.3 0.1L84.3 0.5L87.2 1.2L89.9 2.1L92.3 3.4L94.5 5.1L96.3 7.0L98.2 9.2L98.3 9.5L97.9 10.1L97.3 10.9L96.2 11.9L94.8 13.0L93.1 14.2L91.1 15.5L88.7 16.8L86.1 18.0L83.3 19.1L80.3 20.2L77.2 21.0L74.0 21.6L70.7 22.0L67.5 22.1L64.4 21.9L61.4 21.3L58.6 20.5L56.0 19.3L53.7 17.8Z" fill="url(#r0)" />
                    <path d="M83.0 51.5L83.1 51.1L83.5 50.5L84.4 49.7L85.6 48.7L87.2 47.6L89.2 46.4L91.4 45.1L94.0 43.9L96.8 42.8L99.8 41.8L103.0 41.0L106.2 40.4L109.5 40.1L112.7 40.1L115.8 40.4L118.8 41.0L121.6 42.0L124.1 43.3L126.4 44.9L128.3 46.9L130.0 49.0L130.0 49.3L129.6 49.8L128.8 50.6L127.7 51.5L126.1 52.6L124.2 53.8L122.0 55.0L119.5 56.2L116.7 57.3L113.7 58.3L110.6 59.2L107.4 59.8L104.1 60.2L100.8 60.3L97.6 60.0L94.6 59.4L91.8 58.5L89.2 57.2L86.9 55.6L84.9 53.7Z" fill="url(#r2)" />
                    <path d="M116.8 89.9L116.9 89.6L117.4 89.1L118.2 88.4L119.4 87.5L121.0 86.5L122.8 85.4L125.0 84.3L127.5 83.2L130.2 82.3L133.1 81.4L136.1 80.7L139.1 80.2L142.3 80.0L145.3 80.0L148.3 80.4L151.1 81.0L153.8 82.0L156.2 83.3L158.3 84.9L160.2 86.8L161.8 88.8L161.8 89.0L161.3 89.4L160.5 90.0L159.4 90.9L157.9 91.8L156.1 92.9L154.0 93.9L151.6 95.0L148.9 96.0L146.1 96.9L143.1 97.6L140.0 98.1L136.9 98.4L133.8 98.4L130.7 98.1L127.8 97.5L125.1 96.6L122.6 95.4L120.4 93.8L118.5 91.9Z" fill="url(#r4)" />
                    <path d="M464.8 627.5L464.6 627.7L464.1 628.1L463.4 628.8L462.3 629.8L461.0 631.0L459.6 632.5L458.0 634.2L456.4 636.2L454.7 638.4L453.1 640.8L451.7 643.4L450.3 646.1L449.2 648.9L448.3 651.8L447.8 654.7L447.5 657.5L447.6 660.3L448.0 662.9L448.8 665.5L450.0 667.8L451.2 669.9L451.2 669.7L451.7 669.2L452.4 668.6L453.4 667.6L454.6 666.5L456.0 665.0L457.5 663.3L459.1 661.4L460.8 659.2L462.4 656.8L463.9 654.2L465.2 651.5L466.4 648.7L467.3 645.9L467.9 643.0L468.3 640.1L468.2 637.3L467.9 634.6L467.1 632.0L466.0 629.6Z" fill="url(#w1)" />
                    <path d="M491.4 675.7L491.3 676.0L490.9 676.4L490.2 677.2L489.3 678.1L488.1 679.4L486.8 680.8L485.4 682.5L483.9 684.5L482.4 686.6L480.9 689.0L479.6 691.5L478.4 694.1L477.4 696.8L476.6 699.5L476.1 702.3L475.9 705.0L476.0 707.7L476.5 710.3L477.3 712.7L478.4 715.0L479.5 716.9L479.5 716.7L479.9 716.2L480.5 715.5L481.4 714.5L482.5 713.4L483.8 711.9L485.2 710.3L486.6 708.4L488.1 706.2L489.6 703.9L490.9 701.5L492.2 698.9L493.2 696.2L494.1 693.4L494.6 690.6L494.9 687.8L494.8 685.1L494.4 682.5L493.7 680.0L492.6 677.7Z" fill="url(#w3)" />
                    <path d="M518.1 723.9L518.1 723.9L518.1 723.9L518.1 723.9L518.1 724.0L518.1 724.0L518.1 724.0L518.1 724.0L518.1 724.0L518.1 724.0L518.1 724.1L518.1 724.1L518.1 724.1L518.1 724.1L518.1 724.2L518.0 724.2L518.0 724.2L518.0 724.2L518.0 724.3L518.0 724.3L518.0 724.3L520.4 728.5L520.3 728.3L520.3 728.2L520.2 728.0L520.2 727.9L520.1 727.8L520.1 727.6L520.0 727.5L519.9 727.4L519.9 727.2L519.8 727.1L519.8 726.9L519.7 726.8L519.6 726.7L519.6 726.5L519.5 726.4L519.4 726.3L519.4 726.1L519.3 726.0L519.2 725.9L519.1 725.7Z" fill="url(#w5)" />
                    <path d="M421.9 620.5L422.5 620.3L423.5 619.9L424.8 619.5L426.4 618.9L428.3 618.4L430.5 617.9L432.9 617.4L435.5 617.1L438.2 616.8L441.1 616.7L444.0 616.8L446.9 617.1L449.7 617.6L452.5 618.3L455.1 619.2L457.5 620.4L459.7 621.9L461.7 623.5L463.4 625.4L464.8 627.5L466.0 629.6L465.8 629.6L465.3 629.8L464.5 630.0L463.3 630.4L461.8 630.9L460.0 631.4L458.0 631.9L455.7 632.4L453.2 632.8L450.5 633.1L447.7 633.3L444.8 633.3L441.9 633.1L439.1 632.7L436.2 632.1L433.5 631.2L431.0 630.1L428.6 628.8L426.5 627.2L424.7 625.4Z" fill="url(#w0)" />
                    <path d="M450.0 667.8L450.2 667.8L450.9 667.7L451.8 667.4L453.2 667.0L454.8 666.6L456.8 666.1L459.1 665.7L461.5 665.3L464.2 665.0L467.0 664.9L469.9 664.9L472.9 665.2L475.8 665.6L478.6 666.3L481.3 667.3L483.9 668.5L486.2 669.9L488.2 671.6L490.0 673.5L491.4 675.7L492.6 677.7L492.3 677.6L491.8 677.7L490.8 677.9L489.6 678.3L487.9 678.7L486.0 679.1L483.8 679.6L481.4 679.9L478.8 680.2L476.0 680.4L473.1 680.4L470.1 680.2L467.2 679.7L464.3 679.1L461.6 678.2L459.0 677.0L456.6 675.6L454.5 673.9L452.7 672.0L451.2 669.9Z" fill="url(#w2)" />
                    <path d="M478.4 715.0L478.7 715.1L479.3 715.0L480.3 714.8L481.6 714.5L483.2 714.2L485.1 713.8L487.2 713.5L489.6 713.2L492.1 713.1L494.8 713.0L497.6 713.1L500.4 713.4L503.1 713.9L505.9 714.7L508.4 715.6L510.8 716.8L513.1 718.3L515.0 719.9L516.7 721.8L518.1 723.9L519.1 725.7L518.9 725.6L518.3 725.6L517.4 725.8L516.2 726.0L514.6 726.3L512.8 726.7L510.7 727.0L508.4 727.2L505.8 727.4L503.2 727.5L500.4 727.4L497.6 727.2L494.8 726.7L492.1 726.0L489.5 725.1L487.0 723.9L484.7 722.5L482.7 720.9L480.9 719.0L479.5 716.9Z" fill="url(#w4)" />
                    <path d="M197.5 15.8Q204.3 15.0 209.6 19.3L197.5 67.9Q190.1 64.2 183.7 63.9Q189.0 39.4 197.5 15.8Z" fill="url(#k1a)" />
                    <path d="M209.6 19.3Q217.5 23.1 226.3 24.1Q221.0 48.6 212.5 72.2Q203.4 72.3 197.5 67.9Z" fill="url(#k1b)" />
                    <path d="M44.4 164.4Q50.4 159.9 57.8 161.1L67.0 189.7Q58.0 190.3 51.6 193.5Q46.2 179.4 44.4 164.4Z" fill="url(#k2a)" />
                    <path d="M57.8 161.1Q67.5 160.3 76.4 156.5Q81.8 170.6 83.6 185.6Q75.1 190.7 67.0 189.7Z" fill="url(#k2b)" />
                    <path d="M368.1 684.8Q373.8 683.1 379.0 685.9L374.5 743.8Q367.6 741.8 362.0 742.5Q363.6 713.5 368.1 684.8Z" fill="url(#k3a)" />
                    <path d="M379.0 685.9Q386.3 688.0 394.0 687.5Q392.4 716.5 387.9 745.2Q380.2 746.7 374.5 743.8Z" fill="url(#k3b)" />
                    <path d="M547.7 628.1Q553.8 628.6 557.7 633.4L547.9 655.3Q542.1 650.8 536.4 649.3Q540.7 638.0 547.7 628.1Z" fill="url(#k4a)" />
                    <path d="M557.7 633.4Q564.0 638.2 571.6 640.7Q567.3 652.0 560.3 661.9Q552.3 660.4 547.9 655.3Z" fill="url(#k4b)" />
                  </g>
                </svg>
              </div>
            </figure>

            <div className={styles.successTextContainer}>
              <h1 className={styles.successTitle}>Transfer successful</h1>
              <p className={styles.successDesc}>
                {transferredSummary.amount} USD transferred to your {transferredSummary.toName} account.
              </p>
            </div>

            <div className={styles.successActions}>
              <div
                role="button"
                tabIndex={0}
                className={styles.startTradingBtn}
                onClick={() => {
                  if (onNavigateToOptions) onNavigateToOptions();
                  onClose();
                }}
              >
                Start trading
              </div>
              <div
                role="button"
                tabIndex={0}
                className={styles.portfolioReturnBtn}
                onClick={onClose}
              >
                Go to Portfolio
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};