import { useState } from 'react';
import styles from './PortfolioContent.module.css';
import { useAccount } from '../../context/AccountContext';

import cfdsIcon from '../../assets/CFDs.webp';
import optionsIcon from '../../assets/Options.webp';
import usDollarIcon from '../../assets/USDOLLAR.webp';
import usdtTronIcon from '../../assets/USDTRON.webp';
import p2pDollarIcon from '../../assets/P2PDOLLAR.jpeg';
import usdtEthereumIcon from '../../assets/USDTETHEREUM.webp';

export const PortfolioContent = () => {
  const { balances } = useAccount();
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  const formatBal = (amount: number) =>
    amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const usdtBalance = balances.walletUsdt || 0;
  const showUsdtTron = !hideZeroBalances || usdtBalance > 0;

  return (
    <main className={styles.scrollContainer}>
      {/* Hide zero balances toggle + USDT (Tron) */}
      <section className={styles.sectionBlock}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#404040',
            marginBottom: showUsdtTron ? '12px' : '0px',
            userSelect: 'none',
            position: 'relative',
          }}
        >
          <input
            type="checkbox"
            checked={hideZeroBalances}
            onChange={(e) => setHideZeroBalances(e.target.checked)}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
              margin: 0,
            }}
          />
          <span
            aria-hidden="true"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              border: `1.5px solid ${hideZeroBalances ? '#171717' : '#d4d4d4'}`,
              backgroundColor: hideZeroBalances ? '#171717' : '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxSizing: 'border-box',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
          >
            {hideZeroBalances && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.25 6.25L4.75 8.75L9.75 3.5"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span>Hide assets with zero balances</span>
        </label>

        {showUsdtTron && (
          <div className={styles.accountList}>
            {/* USDT (Tron) */}
            <div className={styles.rowItem}>
              <div className={styles.leftCol}>
                <div className={styles.iconPlaceholder}>
                  <img src={usdtTronIcon} alt="USDT (Tron)" className={styles.croppedImg} />
                </div>
                <span className={styles.accountName}>USDT (Tron)</span>
              </div>
              <div className={styles.rightCol}>
                <span className={styles.balancePrimary}>
                  {formatBal(usdtBalance)} USDT
                </span>
                <span className={styles.balanceSecondary}>
                  {formatBal(usdtBalance)} USD
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 1. Wallet Section */}
      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>Wallet</h2>
        <div className={styles.accountList}>
          {/* US Dollar */}
          <div className={styles.rowItem}>
            <div className={styles.leftCol}>
              <div className={styles.iconPlaceholder}>
                <img src={usDollarIcon} alt="US Dollar" className={styles.croppedImg} />
              </div>
              <span className={styles.accountName}>US Dollar</span>
            </div>
            <div className={styles.rightCol}>
              <span className={styles.balancePrimary}>
                {formatBal(balances.walletUsd || 0.02)} USD
              </span>
            </div>
          </div>

          {/* USDT (Ethereum) */}
          <div className={styles.rowItem}>
            <div className={styles.leftCol}>
              <div className={styles.iconPlaceholder}>
                <img src={usdtEthereumIcon} alt="USDT (Ethereum)" className={styles.croppedImg} />
              </div>
              <span className={styles.accountName}>USDT (Ethereum)</span>
            </div>
            <div className={styles.rightCol}>
              <span className={styles.balancePrimary}>0.00 USDT</span>
              <span className={styles.balanceSecondary}>0.00 USD</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trading Section */}
      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>Trading</h2>
        <div className={styles.accountList}>
          {/* CFDs */}
          <div className={styles.rowItem}>
            <div className={styles.leftCol}>
              <div className={styles.iconPlaceholderSquare}>
                <img src={cfdsIcon} alt="CFDs" className={styles.croppedImg} />
              </div>
              <span className={styles.accountName}>CFDs</span>
            </div>
            <div className={styles.rightCol}>
              <span className={styles.balancePrimary}>
                {formatBal(balances.cfdsUsd || 0)} USD
              </span>
            </div>
          </div>

          {/* Options */}
          <div className={styles.rowItem}>
            <div className={styles.leftCol}>
              <div className={styles.iconPlaceholderSquare}>
                <img src={optionsIcon} alt="Options" className={styles.croppedImg} />
              </div>
              <span className={styles.accountName}>Options</span>
            </div>
            <div className={styles.rightCol}>
              <span className={styles.balancePrimary}>
                {formatBal(balances.optionsUsd || 0.07)} USD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. P2P Section */}
      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>P2P</h2>
        <div className={styles.accountList}>
          {/* US Dollar under P2P */}
          <div className={styles.rowItem}>
            <div className={styles.leftCol}>
              <div className={styles.iconPlaceholder}>
                <img src={p2pDollarIcon} alt="P2P US Dollar" className={styles.croppedImg} />
              </div>
              <span className={styles.accountName}>US Dollar</span>
            </div>
            <div className={styles.rightCol}>
              <span className={styles.balancePrimary}>
                {formatBal(balances.p2pUsd || 0)} USD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. View all transactions */}
      <div className={styles.transactionsWrapper}>
        <button type="button" className={styles.transactionsBtn}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" role="img" className="fill-current">
            <path fill="currentColor" d="m24.555 11.969-3.75 3.75a.66.66 0 0 1-.899 0 .66.66 0 0 1 0-.899l2.696-2.695H7.875a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625h14.727l-2.696-2.656a.66.66 0 0 1 0-.899.66.66 0 0 1 .899 0l3.75 3.75a.66.66 0 0 1 0 .899m-13.399 13.75-3.75-3.75a.66.66 0 0 1 0-.899l3.75-3.75a.66.66 0 0 1 .899 0 .66.66 0 0 1 0 .899l-2.696 2.656h14.766c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625H9.359l2.696 2.695a.66.66 0 0 1 0 .899.66.66 0 0 1-.899 0"></path>
          </svg>
          <span>View all transactions</span>
        </button>
      </div>
    </main>
  );
};