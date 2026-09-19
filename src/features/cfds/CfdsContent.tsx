import { useState } from 'react';
import styles from './CfdsContent.module.css';
import { useAccount } from '../../context/AccountContext';

// Assets
import cfdsIcon from '../../assets/CFDs.webp';
import tradingViewIcon from '../../assets/TradingView.webp';
import cTraderIcon from '../../assets/cTrader.webp';
import swapFreeIcon from '../../assets/SwapFree.webp';
import zeroSpreadIcon from '../../assets/ZeroSpread.webp';
import financialIcon from '../../assets/Financial.webp';

import goldVideo from '../../assets/gold-featured-mt5.webm';
import tvVideo from '../../assets/tradingview-featured-mt5.webm';

type MoreAccountItem = {
  id: string;
  title: string;
  desc: string;
  tag: string;
  icon: string;
};

const moreAccounts: MoreAccountItem[] = [
  {
    id: 'ctrader',
    title: 'cTrader',
    desc: 'CFDs copy trading with 150+ assets',
    tag: 'Copy Trading',
    icon: cTraderIcon,
  },
  {
    id: 'zero-spread',
    title: 'Zero Spread',
    desc: 'Cost-efficient trades, starting from 0 pips',
    tag: 'Trade with your terms',
    icon: zeroSpreadIcon,
  },
  {
    id: 'swap-free',
    title: 'Swap-Free',
    desc: 'Keep trades open with no overnight swaps',
    tag: 'Trade with your terms',
    icon: swapFreeIcon,
  },
  {
    id: 'financial',
    title: 'Financial',
    desc: 'Tight spreads for financial markets',
    tag: 'Financial markets',
    icon: financialIcon,
  },
  {
    id: 'cfds-standard',
    title: 'CFDs | Standard',
    desc: 'Derived and financial assets with low spreads',
    tag: 'Standard CFD trading',
    icon: cfdsIcon,
  },
];

export const CfdsContent = () => {
  const { balances } = useAccount();
  const [activeCardIndex, setActiveCardIndex] = useState<0 | 1>(0);

  const toggleStack = () => {
    setActiveCardIndex((prev) => (prev === 0 ? 1 : 0));
  };

  const formatBal = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className={styles.scrollContainer}>
      {/* 1. My accounts */}
      <section className={styles.myAccountsContainer}>
        <h2 className={styles.sectionTitle}>My accounts</h2>
        <div className={styles.accountCard}>
          <img src={cfdsIcon} alt="CFDs" className={styles.accountBadge} />
          <span className={styles.accountLabel}>CFDs</span>
          <span className={styles.accountBalance}>
            {formatBal(balances.cfdsUsd)}
            <span className={styles.unit}>{balances.currency}</span>
          </span>
        </div>
      </section>

      {/* 2. Featured Overlapping Swipe/Click Stack */}
      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>Featured</h2>

        <div className={styles.stackContainer} onClick={toggleStack}>
          {/* Card 0: Precious Metals */}
          <div
            className={`${styles.stackedCard} ${
              activeCardIndex === 0 ? styles.cardActive : styles.cardBehind
            }`}
          >
            <div className={styles.videoWrapper}>
              <video
                src={goldVideo}
                autoPlay
                loop
                muted
                playsInline
                className={styles.videoHero}
              />
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.featuredTitle}>Precious metals</h3>
              <p className={styles.featuredDesc}>
                Trade gold, silver, copper, and more with tight spreads.
              </p>
              <div className={styles.cardFooter}>
                <div className={styles.footerLeft}>
                  <img src={cfdsIcon} alt="Gold" className={styles.footerIcon} />
                  <span className={styles.footerLabel}>Gold</span>
                </div>
                <button type="button" className={styles.pillBtn}>
                  Activate
                </button>
              </div>
            </div>
          </div>

          {/* Card 1: TradingView */}
          <div
            className={`${styles.stackedCard} ${
              activeCardIndex === 1 ? styles.cardActive : styles.cardBehind
            }`}
          >
            <div className={styles.videoWrapper}>
              <video
                src={tvVideo}
                autoPlay
                loop
                muted
                playsInline
                className={styles.videoHero}
              />
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.featuredTitle}>TradingView</h3>
              <p className={styles.featuredDesc}>
                Access all financial and exclusive Deriv markets
              </p>
              <div className={styles.cardFooter}>
                <div className={styles.footerLeft}>
                  <img src={tradingViewIcon} alt="TradingView" className={styles.footerIcon} />
                  <span className={styles.footerLabel}>TradingView</span>
                </div>
                <button type="button" className={styles.pillBtn}>
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className={styles.dotsWrapper}>
          <span
            className={`${styles.dot} ${activeCardIndex === 0 ? styles.dotActive : ''}`}
            onClick={() => setActiveCardIndex(0)}
          />
          <span
            className={`${styles.dot} ${activeCardIndex === 1 ? styles.dotActive : ''}`}
            onClick={() => setActiveCardIndex(1)}
          />
        </div>
      </section>

      {/* 3. Activate more accounts */}
      <section>
        <div className={styles.activateHeader}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            Activate more accounts
          </h2>
          <button type="button" className={styles.compareLink}>
            Compare
          </button>
        </div>

        <div className={styles.horizontalAccountsScroll}>
          {moreAccounts.map((acc) => (
            <div key={acc.id} className={styles.activateCard}>
              <div className={styles.activateCardLeft}>
                <span className={styles.activateCardTitle}>{acc.title}</span>
                <span className={styles.activateCardDesc}>{acc.desc}</span>
                <span className={styles.tagPill}>{acc.tag}</span>
              </div>
              <img src={acc.icon} alt={acc.title} className={styles.activateCardIcon} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};