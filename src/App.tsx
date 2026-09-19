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
import { LoginScreen } from './features/auth/LoginScreen';
import type { NavigationTab } from './types/account';
import './styles/mobile.css';

export const App = () => {
  // --- AUTHENTICATION STATE ---
  // Stores the actual email of the logged-in user and checks storage on load
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('deriv_current_user');
  });

  const isAuthenticated = !!currentUser;

  const handleLogin = (identifier: string) => {
    console.log('Logging in user:', identifier);
    // Save their specific identifier so they stay logged in across app restarts
    localStorage.setItem('deriv_current_user', identifier);
    setCurrentUser(identifier);
  };

  const handleLogout = () => {
    // You can attach this to a logout button later
    localStorage.removeItem('deriv_current_user');
    setCurrentUser(null);
  };

  // --- MAIN APP STATE ---
  const [currentTab, setCurrentTab] = useState<NavigationTab>('options');
  const [isTransferOpen, setIsTransferOpen] = useState(false);

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

        {/* Active Bot Workspace View */}
        {isBotActive ? (
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