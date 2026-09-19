import styles from './PortfolioContent.module.css';
import { useAccount } from '../../context/AccountContext';

// Existing badge assets
import cfdsIcon from '../../assets/CFDs.webp';
import optionsIcon from '../../assets/Options.webp';

// Corrected icon assets
import usDollarIcon from '../../assets/USDOLLAR.jpeg';
import usdtTronIcon from '../../assets/USDT(TRON).jpeg';
import p2pDollarIcon from '../../assets/P2PDOLLAR.jpeg';

export const PortfolioContent = () => {
  const { balances } = useAccount();

  const formatBal = (amount: number) =>
    amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className={styles.scrollContainer}>
      {/* 1. Wallet Section */}
      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>Wallet</h2>
        <div className={styles.accountCard}>
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
                {formatBal(balances.walletUsd)} USD
              </span>
            </div>
          </div>

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
                {formatBal(balances.walletUsdt)} USDT
              </span>
              <span className={styles.balanceSecondary}>
                {formatBal(balances.walletUsdt)} USD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trading Section */}
      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>Trading</h2>
        <div className={styles.accountCard}>
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
                {formatBal(balances.cfdsUsd)} USD
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
                {formatBal(balances.optionsUsd)} USD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. P2P Section */}
      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>P2P</h2>
        <div className={styles.accountCard}>
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
                {formatBal(balances.p2pUsd)} USD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. View all transactions */}
      <div className={styles.transactionsWrapper}>
        <button type="button" className={styles.transactionsBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8M8 10h8M8 14h5" />
          </svg>
          <span>View all transactions</span>
        </button>
      </div>
    </main>
  );
};