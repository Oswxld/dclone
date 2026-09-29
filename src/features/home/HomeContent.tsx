import { useState } from 'react';
import styles from './HomeContent.module.css';
import { useAccount } from '../../context/AccountContext';

import cfdsIcon from '../../assets/CFDs.webp';
import optionsIcon from '../../assets/Options.webp';
import tradingViewIcon from '../../assets/TradingView.webp';
import swapFreeIcon from '../../assets/SwapFree.webp';
import moreIcon from '../../assets/More.png';
import cryptoTransferHero from '../../assets/crypto_transfer.png';
import metalsHero from '../../assets/Metals.png';

// Import the background looping video
import tradingViewWebm from './tradingview-featured-mt5.webm';

export const HomeContent = () => {
  const { balances } = useAccount();
  const [isAdVisible, setIsAdVisible] = useState(true);

  const formatBal = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className={styles.scrollContainer}>
      {/* 1. My trading accounts */}
      <h2 className={styles.sectionTitle}>My trading accounts</h2>
      <div className={styles.accountsGrid}>
        {/* CFDs Account */}
        <div className={styles.accountCard}>
          <div className={styles.badgeSquare}>
            <img
              src={cfdsIcon}
              alt="CFDs"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
          <span className={styles.accountLabel}>CFDs</span>
          <span className={styles.accountBalance}>
            {formatBal(balances.cfdsUsd)}
            <span className={styles.unit}>{balances.currency}</span>
          </span>
        </div>

        {/* Options Account */}
        <div className={styles.accountCard}>
          <div className={styles.badgeSquare}>
            <img
              src={optionsIcon}
              alt="Options"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
          <span className={styles.accountLabel}>Options</span>
          <span className={styles.accountBalance}>
            {formatBal(balances.optionsUsd)}
            <span className={styles.unit}>{balances.currency}</span>
          </span>
        </div>
      </div>

      {/* NEW: TradingView Ad Banner */}
      {isAdVisible && (
        <div className={styles.adBannerContainer}>
          <div className={styles.adBannerInner} role="button" tabIndex={0}>
            <div className={styles.adBannerTextCol}>
              <p className={styles.adBannerHeadline}>Trade with TradingView charts</p>
              <p className={styles.adBannerSubtext}>Advanced charts and tools for 24/7 Derived Indices.</p>
            </div>
            
            <div className={styles.adBannerVideoWrap}>
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className={styles.adBannerVideo}
              >
                <source src={tradingViewWebm} type="video/webm" />
              </video>
            </div>
          </div>
          
          <button 
            type="button" 
            aria-label="Dismiss banner" 
            className={styles.adBannerCloseBtn}
            onClick={() => setIsAdVisible(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" role="img" fill="currentColor">
              <path d="M3.854 3.146 8 7.293l4.146-4.147a.5.5 0 0 1 .708.708L8.707 8l4.147 4.146a.5.5 0 0 1-.708.708L8 8.707l-4.146 4.147a.5.5 0 0 1-.708-.708L7.293 8 3.146 3.854a.5.5 0 1 1 .708-.708"></path>
            </svg>
          </button>
        </div>
      )}

      {/* 2. Explore Deriv */}
      <section className={styles.exploreSection}>
        <h2 className={styles.sectionTitle}>Explore Deriv</h2>
        <div className={styles.exploreGrid}>
          {/* CFDs Standard */}
          <button type="button" className={styles.exploreItem}>
            <div className={styles.circleIcon}>
              <img src={cfdsIcon} alt="CFDs Standard" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <span className={styles.exploreLabel}>CFDs | Standard</span>
          </button>

          {/* Options */}
          <button type="button" className={styles.exploreItem}>
            <div className={styles.circleIcon}>
              <img src={optionsIcon} alt="Options" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <span className={styles.exploreLabel}>Options</span>
          </button>

          {/* TradingView */}
          <button type="button" className={styles.exploreItem}>
            <div className={styles.circleIcon}>
              <img src={tradingViewIcon} alt="TradingView" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <span className={styles.exploreLabel}>TradingView</span>
          </button>

          {/* Swap-Free */}
          <button type="button" className={styles.exploreItem}>
            <div className={styles.circleIcon}>
              <img src={swapFreeIcon} alt="Swap-Free" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <span className={styles.exploreLabel}>Swap-Free</span>
          </button>

          {/* More */}
          <button type="button" className={styles.exploreItem}>
            <div className={styles.circleIcon}>
              <img src={moreIcon} alt="More" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <span className={styles.exploreLabel}>More</span>
          </button>
        </div>
      </section>

      {/* 3. Highlights */}
      <section className={styles.highlightsSection}>
        <h2 className={styles.sectionTitle}>Highlights</h2>
        <div className={styles.carousel}>
          {/* Card 1: Crypto transfers */}
          <div className={styles.highlightCard}>
            <div className={styles.cardHero}>
              <img
                src={cryptoTransferHero}
                alt="Crypto transfers"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className={styles.cardDetails}>
              <h3 className={styles.cardHeading}>Crypto transfers</h3>
              <p className={styles.cardSubtext}>Fast deposits and withdrawals. Low fees.</p>
              <div className={styles.badgeRow}>
                <span className={styles.tagPill}>SOL</span>
                <span className={styles.tagPill}>ADA</span>
                <span className={styles.tagPill}>BNB</span>
                <span className={styles.tagPill}>BTC</span>
              </div>
            </div>
          </div>

          {/* Card 2: Metals */}
          <div className={styles.highlightCard}>
            <div className={styles.cardHero}>
              <img
                src={metalsHero}
                alt="Metals"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className={styles.cardDetails}>
              <h3 className={styles.cardHeading}>Metals</h3>
              <p className={styles.cardSubtext}>Key metals. Tight spreads. Up to 1:800 leverage</p>
              <div className={styles.badgeRow}>
                <span className={styles.tagPill}>MT5</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};