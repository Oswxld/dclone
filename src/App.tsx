import { useState, useEffect } from 'react';
import { AccountProvider } from './context/AccountContext';
import { MobileTopHeader } from './components/layout/MobileTopHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { AppLoader } from './components/layout/AppLoader';
import { HomeContent } from './features/home/HomeContent';
import { CfdsContent } from './features/cfds/CfdsContent';
import { CryptoContent } from './features/crypto/CryptoContent';
import { OptionsContent } from './features/options/OptionsContent';
import { PortfolioContent } from './features/portfolio/PortfolioContent';
import { TransferScreen } from './features/portfolio/TransferScreen';
import { BotLoader } from './features/bot/BotLoader';
import { BotWorkspace } from './features/bot/BotWorkspace';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { LoginScreen } from './features/auth/LoginScreen';
import { WithdrawalSheet } from './features/profile/WithdrawalSheet';
import { CryptoWithdrawalScreen } from './features/profile/CryptoWithdrawalScreen';
import { UsdtNetworkScreen } from './features/profile/UsdtNetworkScreen';
import { PasskeyVerificationScreen } from './features/profile/PasskeyVerificationScreen';
import { CryptoWithdrawalFormScreen } from './features/profile/CryptoWithdrawalFormScreen';
import { ReviewWithdrawalScreen } from './features/profile/ReviewWithdrawalScreen'; // <-- NEW
import { WithdrawalSuccessScreen } from './features/profile/WithdrawalSuccessScreen'; // <-- NEW
import type { NavigationTab } from './types/account';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import './styles/mobile.css';

// Generate or retrieve the persistent device ID
const getDeviceFingerprint = () => {
  let id = localStorage.getItem('deriv_device_id');
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'dev-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deriv_device_id', id);
  }
  return id;
};

export type AuthState = 'loading' | 'unauthenticated' | 'device_pending' | 'device_rejected' | 'authenticated';

export const App = () => {
  // --- AUTHENTICATION & GLOBAL USER STATE ---
  const [appState, setAppState] = useState<AuthState>('loading');
  const [localDeviceId, setLocalDeviceId] = useState('');
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string } | null>(null);

  const verifyUserProfile = async (session: Session) => {
    const email = session.user.email;
    if (!email) return;

    const deviceId = getDeviceFingerprint();
    setLocalDeviceId(deviceId);

    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (!profile && error?.code === 'PGRST116') {
        const fullName = session.user.user_metadata?.full_name || 'Unknown User';
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ email, full_name: fullName, deriv_clone_decide_id_string: '' }])
          .select()
          .single();
        profile = newProfile;
      }

      if (!profile) return;

      const dbDeviceId = profile.deriv_clone_decide_id_string || '';

      if (dbDeviceId === '') {
        setAppState('device_pending');
      } else if (dbDeviceId !== deviceId) {
        setAppState('device_rejected');
      } else {
        setUserProfile({ fullName: profile.full_name, email: profile.email });
        setAppState('authenticated');
      }
    } catch (err) {
      console.error('Error during profile verification:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        verifyUserProfile(session);
      } else {
        setAppState('unauthenticated');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        verifyUserProfile(session);
      } else {
        setAppState('unauthenticated');
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
  };

  // --- MAIN APP STATE ---
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  
  // Withdrawal States
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false); 
  const [withdrawMethod, setWithdrawMethod] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null); 
  
  // Withdrawal Flow Flags
  const [isPasskeyVerifying, setIsPasskeyVerifying] = useState(false); 
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Payload data stored across flow
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);

  const handleLaunchBot = () => setIsBotLoading(true);
  const handleBotLoaded = () => { setIsBotLoading(false); setIsBotActive(true); };
  
  const handleExitBot = (destinationTab?: string) => { 
    setIsBotActive(false); 
    if (destinationTab && ['home', 'cfds', 'crypto', 'options', 'portfolio'].includes(destinationTab)) {
      setCurrentTab(destinationTab as NavigationTab);
    } else {
      setCurrentTab('options'); 
    }
  };

  const getNetworkName = (id: string | null) => {
    switch(id) {
      case 'usdt_tron': return 'Tron';
      case 'usdt_bsc': return 'BNB Smart Chain';
      case 'usdt_ethereum': return 'Ethereum';
      case 'usdt_polygon': return 'Polygon';
      case 'usdt_solana': return 'Solana';
      case 'usdt_avalanche': return 'Avalanche';
      case 'usdt_arbitrum': return 'Arbitrum';
      case 'usdt_opbnb': return 'opBNB';
      case 'usdt_aptos': return 'Aptos';
      default: return 'Tron';
    }
  };

  const closeEntireWithdrawalFlow = () => {
    setIsWithdrawOpen(false);
    setWithdrawMethod(null);
    setSelectedCrypto(null);
    setSelectedNetwork(null);
    setIsPasskeyVerifying(false);
    setIsWithdrawalFormOpen(false);
    setIsReviewOpen(false);
    setIsSuccessOpen(false);
    setWithdrawalAmount('');
    setWithdrawalAddress('');
  };

  // --- RENDERING ROUTER ---
  if (appState === 'loading') {
    return <AppLoader />;
  }

  if (appState !== 'authenticated') {
    return (
      <LoginScreen 
        authStatus={appState} 
        localDeviceId={localDeviceId}
        onCheckAgain={() => supabase.auth.refreshSession()}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AccountProvider>
      <div className="mobile-viewport">
        {isBotLoading && <BotLoader onComplete={handleBotLoaded} />}

        {/* Global Withdrawal Modal */}
        <WithdrawalSheet 
          isOpen={isWithdrawOpen} 
          onClose={() => setIsWithdrawOpen(false)} 
          onContinue={(method) => {
            setIsWithdrawOpen(false);
            setWithdrawMethod(method);
          }}
        />

        {/* Full Screen Modals / Takeovers */}
        {isProfileOpen ? (
          <ProfileScreen 
            onBack={() => setIsProfileOpen(false)} 
            onLogout={handleLogout} 
            userFullName={userProfile?.fullName}
            userEmail={userProfile?.email}
          />
        ) : isBotActive ? (
          <BotWorkspace onBack={handleExitBot} />
        ) : isTransferOpen ? (
          <TransferScreen
            onClose={() => setIsTransferOpen(false)}
            onNavigateToOptions={() => {
              setIsTransferOpen(false);
              setCurrentTab('options');
            }}
          />
        ) : isSuccessOpen ? (
          <WithdrawalSuccessScreen 
            amount={withdrawalAmount}
            coinSymbol={selectedCrypto || 'USDT'}
            networkName={getNetworkName(selectedNetwork)}
            destination={withdrawalAddress}
            onDone={closeEntireWithdrawalFlow}
          />
        ) : isReviewOpen ? (
          <ReviewWithdrawalScreen 
            amount={withdrawalAmount}
            coinSymbol={selectedCrypto || 'USDT'}
            networkName={getNetworkName(selectedNetwork)}
            destination={withdrawalAddress}
            onBack={() => {
              setIsReviewOpen(false);
              setIsWithdrawalFormOpen(true);
            }}
            onConfirm={() => {
              setIsReviewOpen(false);
              setIsSuccessOpen(true);
            }}
          />
        ) : isWithdrawalFormOpen ? (
          <CryptoWithdrawalFormScreen 
            networkName={getNetworkName(selectedNetwork)}
            coinSymbol={selectedCrypto || 'USDT'}
            onClose={closeEntireWithdrawalFlow}
            onWithdraw={(amount, address) => {
              setWithdrawalAmount(amount);
              setWithdrawalAddress(address);
              setIsWithdrawalFormOpen(false);
              setIsReviewOpen(true);
            }}
          />
        ) : isPasskeyVerifying ? ( 
          <PasskeyVerificationScreen 
            onBack={() => {
              setIsPasskeyVerifying(false);
              setSelectedNetwork(null);
            }} 
            onComplete={() => {
              setIsPasskeyVerifying(false);
              setIsWithdrawalFormOpen(true);
            }}
          />
        ) : withdrawMethod === 'crypto' ? ( 
          selectedCrypto === 'USDT' ? (
            <UsdtNetworkScreen 
              onBack={() => setSelectedCrypto(null)} 
              onSelectNetwork={(networkId) => {
                setSelectedNetwork(networkId);
                setIsPasskeyVerifying(true); 
              }}
            />
          ) : (
            <CryptoWithdrawalScreen 
              onBack={() => setWithdrawMethod(null)} 
              onSelectCoin={(coinId) => setSelectedCrypto(coinId)} 
            />
          )
        ) : (
          <>
            <MobileTopHeader
              currentTab={currentTab}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onOpenWithdraw={() => setIsWithdrawOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              userFullName={userProfile?.fullName}
            />

            {/* ROUTING LOGIC INTEGRATED HERE */}
            {currentTab === 'home' && <HomeContent />}
            {currentTab === 'cfds' && <CfdsContent />}
            {currentTab === 'crypto' && <CryptoContent />}
            {currentTab === 'options' && <OptionsContent onOpenBot={handleLaunchBot} />}
            {currentTab === 'portfolio' && <PortfolioContent />}

            <MobileBottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
          </>
        )}
      </div>
    </AccountProvider>
  );
};

export default App;