import { useState, useEffect } from 'react';
import styles from './HomeContent.module.css';
import { useAccount } from '../../context/AccountContext';

import cfdsIcon from '../../assets/CFDs.webp';
import cryptoIcon from '../../assets/crypto_exchange_logo.png';
import p2p from '../../assets/DerivHOMEP2P.webp';
import optionsIcon from '../../assets/Options.webp';
import tradingViewIcon from '../../assets/TradingView.webp';
import swapFreeIcon from '../../assets/SwapFree.webp';
import moreIcon from '../../assets/More.png';
import cryptoTransferHero from '../../assets/crypto_transfer.png';
import metalsHero from '../../assets/Metals.png';

const BANNER_DATA = [
  { 
    id: 'tradingview', 
    title: 'Trade with TradingView charts', 
    desc: 'Advanced charts and tools for 24/7 Derived Indices.',
    lottie: '/lottie.json' 
  },
  { 
    id: 'spacex', 
    title: 'SpaceX CFDs', 
    desc: 'Trade the space giant with competitive leverage.',
    lottie: '/lottie 1.json' 
  },
  { 
    id: 'ai-analysis', 
    title: 'AI market analysis', 
    desc: 'Get AI-powered insights on Gold, BTC, Silver, ETH, and more.',
    lottie: '/lottie 2.json' 
  },
];

export const HomeContent = () => {
  const { balances } = useAccount();
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const visibleBanners = BANNER_DATA.filter((b) => !dismissedBanners.includes(b.id));

  useEffect(() => {
    if (visibleBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % visibleBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visibleBanners.length, currentSlide]);

  const handleDismiss = (id: string) => {
    setDismissedBanners((prev) => [...prev, id]);
    setCurrentSlide(0); 
  };

  const formatBal = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <main className={styles.scrollContainer}>
      {/* 1. My trading accounts */}
      <h2 className={styles.sectionTitle}>My trading accounts</h2>
      
      {/* Updated to a horizontally scrollable container */}
      <div className={styles.accountsScrollRow}>
        
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

        {/* Crypto Account */}
        <div className={styles.accountCard}>
          <div className={styles.badgeSquare}>
            <img
              src={cryptoIcon}
              alt="Crypto"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
          <span className={styles.accountLabel}>Crypto</span>
          <span className={styles.accountBalance}>
            {formatBal(0.02)}
            <span className={styles.unit}>{balances.currency}</span>
          </span>
        </div>

        {/* Add More Accounts Card */}
        <button type="button" className={styles.addMoreCard} data-testid="dashboard-btn-add-more-accounts">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" fill="currentColor">
            <path d="M16 7.75a8.73 8.73 0 0 0-7.578 4.375c-1.602 2.734-1.602 6.055 0 8.75C9.984 23.609 12.836 25.25 16 25.25a8.63 8.63 0 0 0 7.54-4.375c1.6-2.695 1.6-6.016 0-8.75C21.976 9.43 19.124 7.75 16 7.75m0 18.75c-3.594 0-6.875-1.875-8.672-5-1.797-3.086-1.797-6.875 0-10 1.797-3.086 5.078-5 8.672-5 3.555 0 6.836 1.914 8.633 5 1.797 3.125 1.797 6.914 0 10a9.93 9.93 0 0 1-8.633 5m-.625-6.25v-3.125H12.25a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625h3.125V12.75c0-.312.273-.625.625-.625.313 0 .625.313.625.625v3.125h3.125c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625h-3.125v3.125a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625"></path>
          </svg>
          <span className={styles.addMoreText} data-testid="dashboard-text-add-more-accounts">Add more accounts</span>
        </button>

      </div>

      {/* NEW: Lottie Banner Carousel */}
      {visibleBanners.length > 0 && (
        <div className={styles.carouselWrapper}>
          <div 
            className={styles.carouselTrack}
            style={{ 
              transform: `translateX(calc(-${currentSlide * 100}% - ${currentSlide * 12}px))`, 
              transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            {visibleBanners.map((item) => (
              <div key={item.id} className={styles.carouselCard}>
                <div className={styles.cardInner}>
                  <div className={styles.textContent}>
                    <p className={styles.cardTitle}>{item.title}</p>
                    <p className={styles.cardDesc}>{item.desc}</p>
                  </div>

                  <div className={styles.lottieWrapper}>
                    {/* @ts-ignore */}
                    <lottie-player 
                      src={item.lottie} 
                      background="transparent"  
                      speed="1"  
                      style={{ width: '100%', height: '100%' }}
                      loop  
                      autoplay
                    ></lottie-player>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Dismiss banner"
                  className={styles.closeBtn}
                  onClick={() => handleDismiss(item.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" role="img" fill="currentColor">
                    <path d="M3.854 3.146 8 7.293l4.146-4.147a.5.5 0 0 1 .708.708L8.707 8l4.147 4.146a.5.5 0 0 1-.708.708L8 8.707l-4.146 4.147a.5.5 0 0 1-.708-.708L7.293 8 3.146 3.854a.5.5 0 1 1 .708-.708"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            {visibleBanners.map((_, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button 
                  key={idx} 
                  type="button" 
                  aria-label={`Go to slide ${idx + 1}`} 
                  className={styles.dotBtn}
                  onClick={() => setCurrentSlide(idx)}
                >
                  {isActive ? (
                    <div className={styles.dotActive}>
                      <div className={styles.dotFill} />
                    </div>
                  ) : (
                    <div className={styles.dotInactive} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Explore Deriv */}
      <section className={styles.exploreSection}>
        <h2 className={styles.sectionTitle}>Explore Deriv</h2>
        <div className={styles.exploreGrid}>

         {/* Crypto */}
          <button type="button" className={styles.exploreItem}>
            <div className={styles.iconWrapperRelative}>
              <span className={styles.newBadge}>New</span>
              <div className={styles.circleIcon}>
                <img src={cryptoIcon} alt="Crypto" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              </div>
            </div>
            <span className={styles.exploreLabel}>Crypto</span>
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

          {/* P2P */}
          <button type="button" className={styles.exploreItem}>
            <div className={styles.circleIcon}>
              <img src={p2p} alt="P2P" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <span className={styles.exploreLabel}>P2P</span>
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