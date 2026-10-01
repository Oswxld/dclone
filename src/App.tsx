import { useState, useEffect } from 'react';
import { AccountProvider } from './context/AccountContext';
import { MobileTopHeader } from './components/layout/MobileTopHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomeContent } from './features/home/HomeContent';
import { CfdsContent } from './features/cfds/CfdsContent';
import { CryptoContent } from './features/crypto/CryptoContent'; // <-- IMPORTED CRYPTO MODULE
import { OptionsContent } from './features/options/OptionsContent';
import { PortfolioContent } from './features/portfolio/PortfolioContent';
import { TransferScreen } from './features/portfolio/TransferScreen';
import { BotLoader } from './features/bot/BotLoader';
import { BotWorkspace } from './features/bot/BotWorkspace';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { LoginScreen } from './features/auth/LoginScreen';
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
      // 1. Fetch user profile from Supabase
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      // 2. If no profile exists (e.g. just signed up), create one gracefully
      if (!profile && error?.code === 'PGRST116') {
        const fullName = session.user.user_metadata?.full_name || 'Unknown User';
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ email, full_name: fullName, deriv_clone_decide_id_string: '' }])
          .select()
          .single();
        profile = newProfile;
      }

      if (!profile) {
        console.error("Profile missing and could not be created.");
        return;
      }

      // 3. Security Gate: Verify Device ID
      const dbDeviceId = profile.deriv_clone_decide_id_string || '';

      if (dbDeviceId === '') {
        setAppState('device_pending');
      } else if (dbDeviceId !== deviceId) {
        setAppState('device_rejected');
      } else {
        // Validation passed! Save global user info and log them in
        setUserProfile({ fullName: profile.full_name, email: profile.email });
        setAppState('authenticated');
      }
    } catch (err) {
      console.error('Error during profile verification:', err);
    }
  };

  useEffect(() => {
    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        verifyUserProfile(session);
      } else {
        setAppState('unauthenticated');
      }
    });

    // Listen for auth state changes (login, logout, refresh)
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
  const [currentTab, setCurrentTab] = useState<NavigationTab>('options');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);

  const handleLaunchBot = () => setIsBotLoading(true);
  const handleBotLoaded = () => { setIsBotLoading(false); setIsBotActive(true); };
  const handleExitBot = () => { setIsBotActive(false); setCurrentTab('options'); };

  // --- RENDERING ROUTER ---
  if (appState === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0e14', color: '#fff', fontFamily: 'sans-serif' }}>
        Authenticating...
      </div>
    );
  }

  /*if (appState !== 'authenticated') {
    return (
      <LoginScreen 
        authStatus={appState} 
        localDeviceId={localDeviceId}
        onCheckAgain={() => supabase.auth.refreshSession()}
        onLogout={handleLogout}
      />
    );
  }*/

  return (
    <AccountProvider>
      <div className="mobile-viewport">
        {isBotLoading && <BotLoader onComplete={handleBotLoaded} />}

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
        ) : (
          <>
            <MobileTopHeader
              currentTab={currentTab}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              userFullName={userProfile?.fullName}
            />

            {/* ROUTING LOGIC INTEGRATED HERE */}
            {currentTab === 'home' && <HomeContent />}
            {currentTab === 'cfds' && <CfdsContent />}
            {currentTab === 'crypto' && <CryptoContent />} {/* <-- RENDER CRYPTO */}
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