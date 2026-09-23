import { useState } from 'react';
import { AccountProvider } from './context/AccountContext';
import { MobileTopHeader } from './components/layout/MobileTopHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomeContent } from './features/home/HomeContent';
import { CfdsContent } from './features/cfds/CfdsContent';
import { OptionsContent } from './features/options/OptionsContent';
import { PortfolioContent } from './features/portfolio/PortfolioContent';
import { TransferScreen } from './features/portfolio/TransferScreen';
import { BotLoader } from './features/bot/BotLoader';
import { BotWorkspace } from './features/bot/BotWorkspace';
import { ProfileScreen } from './features/profile/ProfileScreen';
import type { NavigationTab } from './types/account';
import './styles/mobile.css';

export const App = () => {
  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('deriv_current_user');
  });

  const isAuthenticated = !!currentUser;

  const handleLogin = (identifier: string) => {
    console.log('Logging in user:', identifier);
    localStorage.setItem('deriv_current_user', identifier);
    setCurrentUser(identifier);
  };

  const handleLogout = () => {
    localStorage.removeItem('deriv_current_user');
    setCurrentUser(null);
    setIsProfileOpen(false);
  };

  // --- MAIN APP STATE ---
  const [currentTab, setCurrentTab] = useState<NavigationTab>('options');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // New profile state

  // Bot Navigation State
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);

  const handleLaunchBot = () => {
    setIsBotLoading(true);
  };

  const handleBotLoaded = () => {
    setIsBotLoading(false);
    setIsBotActive(true);
  };

  const handleExitBot = () => {
    setIsBotActive(false);
    setCurrentTab('options');
  };

  // --- MAIN APP (Only accessible after login) ---
  return (
    <AccountProvider>
      <div className="mobile-viewport">
        {/* Deriv Bot Loading Transition Overlay */}
        {isBotLoading && <BotLoader onComplete={handleBotLoaded} />}

        {/* Profile Full-Screen Overlay */}
        {isProfileOpen ? (
          <ProfileScreen 
            onBack={() => setIsProfileOpen(false)} 
            onLogout={handleLogout} 
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
            />

            {currentTab === 'home' && <HomeContent />}
            {currentTab === 'cfds' && <CfdsContent />}
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