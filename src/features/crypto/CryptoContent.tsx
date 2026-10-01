import { useState } from 'react';
import styles from './CryptoContent.module.css';

// Importing standard icons
import bnbIcon from '../../assets/BNB.webp';
import ethIcon from '../../assets/ETH.webp';
import futuresImg from '../../assets/futures_trading.png'; 

// Import your new local coin images
import coin1 from './coin1.webp';
import coin2 from './coin2.webp';
import coin3 from './coin3.webp';
import coin4 from './coin4.webp';
import coin5 from './coin5.webp';

// Import your new local chart images
import chart1 from './chart1.png';
import chart2 from './chart2.png';
import chart3 from './chart3.png';
import chart4 from './chart4.png';
import chart5 from './chart5.png';

// Updated data array mapping the local images to their respective pairs
const MARKETS_DATA = [
  { id: 'doge', name: 'DOGE/USDT', vol: '291.77M', price: '0.09478', change: '+0.46%', isPositive: true, coinImg: coin1, chartImg: chart1 },
  { id: 'ada', name: 'ADA/USDT', vol: '81.78M', price: '0.2500', change: '+1.63%', isPositive: true, coinImg: coin2, chartImg: chart2 },
  { id: 'xrp', name: 'XRP/USDT', vol: '59.28M', price: '1.4989', change: '+0.00%', isPositive: true, coinImg: coin3, chartImg: chart3 },
  { id: 'trx', name: 'TRX/USDT', vol: '56.62M', price: '0.3353', change: '-0.74%', isPositive: false, coinImg: coin4, chartImg: chart4 },
  { id: 'pol', name: 'POL/USDT', vol: '49.97M', price: '0.10659', change: '-5.24%', isPositive: false, coinImg: coin5, chartImg: chart5 },
];

export const CryptoContent = () => {
  const [selectedQuote, setSelectedQuote] = useState('ETH');
  const [amount, setAmount] = useState('');

  return (
    <main className={styles.scrollContainer}>
      
      {/* 1. TRADE CRYPTO SECTION */}
      <section className={styles.tradeSection}>
        <h2 className={styles.sectionTitle}>Trade crypto</h2>
        
        <div className={styles.tradeCard}>
          {/* Quote Chips */}
          <div className={styles.quoteChipsRow}>
            {['ETH', 'BTC', 'USDC', 'USDT'].map((coin) => (
              <button
                key={coin}
                type="button"
                className={`${styles.quoteChip} ${selectedQuote === coin ? styles.quoteChipSelected : ''}`}
                onClick={() => setSelectedQuote(coin)}
              >
                {coin}
              </button>
            ))}
          </div>

          {/* Pair Selector */}
          <button type="button" className={styles.pairSelectorBtn}>
            <div className={styles.pairLeft}>
              <img src={bnbIcon} alt="BNB" className={styles.coinIconLg} />
              <div className={styles.pairTextCol}>
                <span className={styles.pairName}>BNB/{selectedQuote}</span>
                <div className={styles.pairSubDetails}>
                  <span className={styles.pairPriceText}>0.2860 (0.28%)</span>
                  {/* Cherry Red Arrow Down */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" className={styles.downArrow}>
                    <path d="m15.102 21.148-5-5a1.26 1.26 0 0 1-.274-1.367A1.28 1.28 0 0 1 11 14h10c.508 0 .938.313 1.133.781a1.26 1.26 0 0 1-.274 1.367l-5 5a1.205 1.205 0 0 1-1.757 0"></path>
                  </svg>
                </div>
              </div>
            </div>
            {/* Chevron Right */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" className={styles.chevronIcon}>
              <path d="M16.43 21.969a.66.66 0 0 1-.899 0l-7.5-7.5a.66.66 0 0 1 0-.899.66.66 0 0 1 .899 0L16 20.64l7.031-7.07a.66.66 0 0 1 .899 0 .66.66 0 0 1 0 .899z"></path>
            </svg>
          </button>

          {/* Buy/Sell Inputs */}
          <div className={styles.inputArea}>
            <div className={styles.balanceHeader}>
              <img src={ethIcon} alt={selectedQuote} className={styles.coinIconSm} />
              <span className={styles.balanceLabel}>{selectedQuote} Spot balance</span>
              <span className={styles.balanceValue}>0.00000000</span>
            </div>

            <div className={styles.amountInputRow}>
              <div className={styles.amountFieldWrapper}>
                {amount === '' && <span className={styles.amountPlaceholder}>Amount</span>}
                <input
                  type="number"
                  className={styles.amountInput}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button className={styles.currencySwitchBtn}>
                {selectedQuote}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
                  <path d="m11.273 25.914-3.75-3.75c-.39-.352-.39-.937 0-1.328l3.75-3.711a.856.856 0 0 1 1.29 0c.39.352.39.938 0 1.29l-2.149 2.148h13.399a.95.95 0 0 1 .937.937c0 .547-.43.938-.937.938l-13.399.039 2.149 2.148c.39.352.39.938 0 1.29a.856.856 0 0 1-1.29 0m13.204-13.75-3.75 3.75c-.391.39-.977.39-1.329 0-.39-.351-.39-.937 0-1.328l2.149-2.149H8.187c-.546 0-.937-.39-.937-.937 0-.508.39-.937.938-.937h13.359l-2.149-2.149c-.39-.351-.39-.937 0-1.328.352-.352.938-.352 1.329 0l3.75 3.789a.92.92 0 0 1 0 1.29"></path>
                </svg>
              </button>
            </div>
            <p className={styles.hintText}>≈ 0.000 BNB</p>
          </div>

          {/* Quick Percentage Chips */}
          <div className={styles.pctChipsRow}>
            {['25%', '50%', '75%', '100%'].map((pct) => (
              <button key={pct} type="button" className={styles.pctChip}>
                {pct}
              </button>
            ))}
          </div>

          <button type="button" className={styles.buyBtn}>
            Buy
          </button>

          {/* Advanced Mode Toggle */}
          <button type="button" className={styles.advancedModeBtn}>
            <div className={styles.advTextCol}>
              <p className={styles.advTitle}>Advanced mode</p>
              <p className={styles.advDesc}>Limit orders, order book, charts</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" fill="currentColor">
              <path d="M6 16.5a9.93 9.93 0 0 1 5-8.633c3.086-1.797 6.875-1.797 10 0 3.086 1.797 5 5.078 5 8.633 0 3.594-1.914 6.875-5 8.672-3.125 1.797-6.914 1.797-10 0-3.125-1.797-5-5.078-5-8.672m9.414 4.727 4.063-4.063c.351-.352.351-.937 0-1.328l-4.063-4.024c-.39-.39-.976-.39-1.328 0-.39.352-.39.938 0 1.329l3.398 3.398-3.398 3.398a.856.856 0 0 0 0 1.29c.351.39.937.39 1.328 0"></path>
            </svg>
          </button>
        </div>
      </section>

      {/* 2. FUTURES BANNER */}
      <section className={styles.futuresBanner}>
        <div className={styles.bannerTextCol}>
          <h3 className={styles.bannerTitle}>Futures trading</h3>
          <p className={styles.bannerDesc}>Trade crypto with up to 50x leverage. Profit on any price move.</p>
          <button type="button" className={styles.exploreBtn}>Explore</button>
        </div>
        <img src={futuresImg} alt="Futures Trading" className={styles.bannerImg} />
      </section>

      {/* 3. MARKETS LIST */}
      <section className={styles.marketsSection}>
        <h3 className={styles.marketsTitle}>Markets</h3>
        
        <div className={styles.marketsContainer}>
          <div className={styles.searchWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#9ca3af" className={styles.searchIcon}>
              <path d="M16.2 10.2a6 6 0 1 0-12 0 6 6 0 0 0 12 0m-1.159 6.116A7.76 7.76 0 0 1 10.2 18a7.8 7.8 0 0 1-7.8-7.8c0-4.309 3.491-7.8 7.8-7.8S18 5.891 18 10.2a7.76 7.76 0 0 1-1.684 4.841l5.022 5.022a.9.9 0 0 1-1.271 1.271z"></path>
            </svg>
            <input type="text" placeholder="Search 33 pairs" className={styles.searchInput} />
          </div>

          <div className={styles.filterChipsRow}>
            <button className={`${styles.filterChip} ${styles.filterChipActive}`}>Trending</button>
            <button className={styles.filterChip}>Gainers</button>
            <button className={styles.filterChip}>Losers</button>
          </div>

          <div className={styles.listHeader}>
            <span className={styles.colLeft}>Coin</span>
            <span className={styles.colCenter}>24H chart</span>
            <span className={styles.colRight}>24H price</span>
          </div>

          <div className={styles.listBody}>
            {MARKETS_DATA.map((item) => (
              <div key={item.id} className={styles.marketRow}>
                <div className={styles.rowLeft}>
                  {/* Replaced placeholder with actual coin image */}
                  <img src={item.coinImg} alt={item.name} className={styles.marketCoinIcon} />
                  <div className={styles.coinTextCol}>
                    <span className={styles.coinName}>{item.name}</span>
                    <span className={styles.coinVol}>Vol {item.vol}</span>
                  </div>
                </div>

                <div className={styles.rowCenter}>
                  {/* Replaced placeholder with actual chart image */}
                  <img src={item.chartImg} alt={`${item.name} chart`} className={styles.marketChartImg} />
                </div>

                <div className={styles.rowRight}>
                  <span className={styles.currentPrice}>{item.price}</span>
                  <span className={item.isPositive ? styles.pctPositive : styles.pctNegative}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className={styles.viewMoreBtn}>
            View more ›
          </button>
        </div>
      </section>

    </main>
  );
};