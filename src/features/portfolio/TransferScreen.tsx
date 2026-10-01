import { useState, useRef } from 'react';
import styles from './TransferScreen.module.css';
import { useAccount, type AccountKey } from '../../context/AccountContext';

// Import the native SVGs from the Icons file you created in the assets folder
import { UsdtTronIcon, UsdtEthereumIcon, UsdIcon, P2PIcon } from '../../assets/Icons';

// Keeping other necessary assets
import cfdsIcon from '../../assets/CFDs.webp';
import optionsIcon from '../../assets/Options.webp';

import derivMoneyImg from './derivmoney.png'; // This now acts as the clean transfer success image

type AccountOption = {
  key: AccountKey;
  name: string;
  group: 'Trading' | 'P2P' | 'Wallet';
  icon: React.ReactNode; 
  currency: string;
};

// Updated ACCOUNT_OPTIONS using the crisp native SVGs
const ACCOUNT_OPTIONS: AccountOption[] = [
  { key: 'walletUsd', name: 'US Dollar', group: 'Wallet', icon: <UsdIcon />, currency: 'USD' },
  { key: 'walletUsdt', name: 'USDT (Tron)', group: 'Wallet', icon: <UsdtTronIcon />, currency: 'USDT' },
  { key: 'cfdsUsd', name: 'CFDs', group: 'Trading', icon: <img src={cfdsIcon} alt="CFDs" className={styles.avatarCropped} />, currency: 'USD' },
  { key: 'optionsUsd', name: 'Options', group: 'Trading', icon: <img src={optionsIcon} alt="Options" className={styles.avatarCropped} />, currency: 'USD' },
  { key: 'p2pUsd', name: 'P2P', group: 'P2P', icon: <P2PIcon />, currency: 'USD' },
];

type TransferScreenProps = {
  onClose: () => void;
  onNavigateToOptions?: () => void;
};

export const TransferScreen = ({ onClose, onNavigateToOptions }: TransferScreenProps) => {
  const { balances, transferFunds } = useAccount();

  // Sensible default keys
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
    if (!toKey) {
      setPickerModal('to');
      return;
    }
    if (numAmount <= 0) {
      inputRef.current?.focus();
      return;
    }
    if (numAmount > availableBalance) {
      setAmount(availableBalance.toFixed(2));
      return;
    }
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

  const filteredOptions = ACCOUNT_OPTIONS.filter((opt) => {
    const matchesSearch = opt.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (pickerModal === 'from') return matchesSearch && opt.key !== toKey;
    if (pickerModal === 'to') return matchesSearch && opt.key !== fromKey;
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
              <div className={styles.iconWrapper}>{fromAccount.icon}</div>
              <div className={styles.accountTextCol}>
                <span className={styles.accountName}>{fromAccount.name}</span>
                <span className={styles.accountSubBal}>
                  {(balances?.[fromKey] ?? 0).toFixed(2)} {fromAccount.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The Exact Swap SVG embedded directly into the button */}
        <button type="button" className={styles.swapButton} onClick={handleSwap} aria-label="Swap accounts">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="#6b7280">
            <path d="m11.43 7.945 3.75 3.75a.66.66 0 0 1 0 .899.66.66 0 0 1-.899 0l-2.656-2.696v14.727a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625V9.898L7.68 12.594a.66.66 0 0 1-.899 0 .66.66 0 0 1 0-.899l3.75-3.75a.66.66 0 0 1 .899 0m13.75 13.399-3.75 3.75a.66.66 0 0 1-.899 0l-3.75-3.75a.66.66 0 0 1 0-.899.66.66 0 0 1 .899 0l2.695 2.696V8.375c0-.312.273-.625.625-.625.313 0 .625.313.625.625v14.766l2.656-2.696a.66.66 0 0 1 .899 0 .66.66 0 0 1 0 .899"></path>
          </svg>
        </button>

        {/* To Card */}
        <div className={styles.selectorCard} style={{ marginTop: 8 }} onClick={() => setPickerModal('to')}>
          <span className={styles.fieldLabel}>To</span>
          <div className={styles.selectorContent}>
            {toAccount ? (
              <div className={styles.accountDetail}>
                <div className={styles.iconWrapper}>{toAccount.icon}</div>
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
          </div>
        </div>
      </div>

      {/* 3. Zero Balance Warning */}
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

      {/* 5. Percentage Chips */}
      <div className={styles.chipsRow}>
        {[25, 50, 75, 100].map((pct) => (
          <button key={pct} type="button" className={styles.chipBtn} onClick={() => handlePercentage(pct)}>
            {pct}%
          </button>
        ))}
      </div>

      {/* 6. Transfer CTA */}
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

            <div className={styles.listContainer}>
                {(['Trading', 'P2P', 'Wallet'] as const).map((grp) => {
                const groupItems = filteredOptions.filter((opt) => opt.group === grp);
                if (groupItems.length === 0) return null;

                return (
                    <div key={grp}>
                    <h3 className={styles.groupLabel}>{grp}</h3>
                    {groupItems.map((opt) => {
                        const isSelected = pickerModal === 'from' ? fromKey === opt.key : toKey === opt.key;

                        return (
                        <div
                            key={opt.key}
                            className={`${styles.sheetRow} ${isSelected ? styles.sheetRowSelected : ''}`}
                            onClick={() => {
                            if (pickerModal === 'from') setFromKey(opt.key);
                            else setToKey(opt.key);
                            setPickerModal(null);
                            }}
                        >
                            <div className={styles.accountDetail}>
                              <div className={styles.iconWrapper}>{opt.icon}</div>
                              <div className={styles.accountTextCol}>
                                  <span className={styles.accountName}>{opt.name}</span>
                                  <span className={styles.accountSubBal}>
                                  {(balances?.[opt.key] ?? 0).toFixed(2)} {opt.currency}
                                  </span>
                              </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Review and Confirm Bottom Sheet */}
      {isReviewOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsReviewOpen(false)}>
          <div className={styles.sheetContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.reviewSheetHeader}>Review and confirm</h2>

            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>From</span>
              <div className={styles.reviewValueAccount}>
                <div className={styles.reviewIconWrapper}>{fromAccount.icon}</div>
                <span>{fromAccount.name}</span>
              </div>
            </div>

            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>To</span>
              <div className={styles.reviewValueAccount}>
                {toAccount && <div className={styles.reviewIconWrapper}>{toAccount.icon}</div>}
                <span>{toAccount?.name}</span>
              </div>
            </div>

            <div className={styles.reviewDivider} />

            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Transfer amount</span>
              <span className={styles.reviewValueText}>{numAmount.toFixed(2)} USD</span>
            </div>

            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>You'll receive</span>
              <span className={styles.reviewValueText}>{numAmount.toFixed(2)} USD</span>
            </div>

            <button type="button" className={styles.confirmTransferBtn} onClick={handleExecuteTransfer}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* RE-ARCHITECTED TRANSFER SUCCESSFUL SCREEN */}
      {isSuccess && (
        <div className={styles.successContainer}>
          
          <div className={styles.successContentWrapper}>
            <div className={styles.successImageWrapper}>
              <img src={derivMoneyImg} alt="Transfer Successful" className={styles.successImage} />
            </div>
            
            <div className={styles.successTextContainer}>
              <h1 className={styles.successTitle}>Transfer successful</h1>
              <p className={styles.successDesc}>
                {transferredSummary.amount} USD transferred to your {transferredSummary.toName} account.
              </p>
            </div>
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
      )}
    </div>
  );
};