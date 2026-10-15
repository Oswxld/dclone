import React, { useState } from 'react';
import { useAccount } from '../../context/AccountContext';
import derivMobileAppImg from '../../assets/deriv-mobile-app.png';

type ProfileScreenProps = {
  onBack: () => void;
  onLogout: () => void;
  userFullName?: string; // Passed down globally from App.tsx
  userEmail?: string;    // Passed down globally from App.tsx
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout, userFullName, userEmail }) => {
  const { balances, setActiveMode, adminOverrideBalances } = useAccount();
  
  // Retrieve the global overrides from localStorage so they match the MobileTopHeader
  const [overrideName, setOverrideName] = useState(() => localStorage.getItem('admin_overrideName') || '');
  const [overrideEmail, setOverrideEmail] = useState(() => localStorage.getItem('admin_overrideEmail') || '');
  const [unreadCount] = useState(() => {
    const saved = localStorage.getItem('admin_unreadCount');
    return saved !== null ? parseInt(saved, 10) : 7;
  });

  // Dismissible mobile app banner state
  const [showMobileBanner, setShowMobileBanner] = useState(true);

  // Use dynamically retrieved Supabase Profile with overrides taking precedence
  const fullName = overrideName || userFullName || 'oswald ngate';
  const displayEmail = overrideEmail || userEmail || 'oscargikandi@gmail.com';

  // --- SECRET ADMIN STATE ---
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretOptions, setSecretOptions] = useState('');
  const [secretCfds, setSecretCfds] = useState('');
  const [secretWallet, setSecretWallet] = useState('');
  const [secretP2p, setSecretP2p] = useState('');
  
  // Local state for the override inputs in the modal
  const [secretName, setSecretName] = useState(overrideName);
  const [secretEmail, setSecretEmail] = useState(overrideEmail);

  const handleAdminSubmit = () => {
    setActiveMode('real'); 
    const updates: any = {};
    if (secretOptions !== '') updates.optionsUsd = parseFloat(secretOptions);
    if (secretCfds !== '') updates.cfdsUsd = parseFloat(secretCfds);
    if (secretWallet !== '') updates.walletUsd = parseFloat(secretWallet);
    if (secretP2p !== '') updates.p2pUsd = parseFloat(secretP2p);

    // Save Name and Email overrides to LocalStorage
    localStorage.setItem('admin_overrideName', secretName);
    localStorage.setItem('admin_overrideEmail', secretEmail);
    setOverrideName(secretName);
    setOverrideEmail(secretEmail);

    setTimeout(() => {
      adminOverrideBalances(updates);
      setShowSecretModal(false);
      setSecretOptions('');
      setSecretCfds('');
      setSecretWallet('');
      setSecretP2p('');
    }, 50);
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155',
    background: '#0b0d11', color: '#fff', fontSize: '14px', boxSizing: 'border-box' as const,
    outline: 'none', fontFamily: '"IBM Plex Sans", sans-serif'
  };

  // --- REUSABLE RIGHT ICONS ---
  const ChevronRight = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" role="img" style={{ color: '#d4d4d4', flexShrink: 0 }} fill="currentColor">
      <path d="M21.43 16.07a.66.66 0 0 1 0 .899l-7.5 7.5a.66.66 0 0 1-.899 0 .66.66 0 0 1 0-.899l7.07-7.07-7.07-7.031a.66.66 0 0 1 0-.899.66.66 0 0 1 .899 0z"></path>
    </svg>
  );

  const ExternalLinkIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" role="img" style={{ color: '#d4d4d4', flexShrink: 0 }} fill="currentColor">
      <path d="M21.625 10.25c.313 0 .625.313.625.625v8.75a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625v-7.227L10.805 22.594a.66.66 0 0 1-.899 0 .66.66 0 0 1 0-.899L20.102 11.5h-7.227a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625z"></path>
    </svg>
  );

  const SectionHeader = ({ children, isFirst }: { children: React.ReactNode, isFirst?: boolean }) => (
    <h3 style={{
      fontSize: '16px',
      fontWeight: 700,
      color: '#171717',
      marginTop: isFirst ? '0px' : '32px',
      marginBottom: '8px',
      fontFamily: 'Inter, "IBM Plex Sans", sans-serif'
    }}>
      {children}
    </h3>
  );

  const ProfileRow = ({
    icon,
    title,
    subtitle,
    subtitleColor = '#a3a3a3',
    rightIcon = ChevronRight,
    disabled = false,
    isLast = false,
    onClick,
    testId
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    subtitleColor?: string;
    rightIcon?: React.ReactNode;
    disabled?: boolean;
    isLast?: boolean;
    onClick?: () => void;
    testId?: string;
  }) => (
    <button
      type="button"
      disabled={disabled}
      data-testid={testId}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 0',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid #f5f5f5',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'left',
        fontFamily: 'Inter, "IBM Plex Sans", sans-serif'
      }}
    >
      <span style={{ flexShrink: 0, color: '#737373', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <p style={{ fontSize: '16px', color: '#171717', margin: 0, fontWeight: 400, lineHeight: 1.4 }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: '14px', color: subtitleColor, margin: '2px 0 0 0', fontWeight: 400, lineHeight: 1.4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {rightIcon}
    </button>
  );

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: '#ffffff', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 50, 
      overflowY: 'auto',
      overflowX: 'hidden',
      fontFamily: 'Inter, "IBM Plex Sans", sans-serif'
    }}>
      
      {/* 1. Sticky Top Bar */}
      <div 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          padding: '20px 24px 12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#1a2236'
        }}
      >
        {/* Back Button */}
        <button 
          type="button" 
          data-testid="profile-btn-back-mobile" 
          onClick={onBack}
          aria-label="Go back"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '32px',
            width: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
            padding: 0
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="white">
            <path d="m7.602 15.64 6.25-6.25a1.205 1.205 0 0 1 1.757 0c.508.47.508 1.29 0 1.758l-4.101 4.102H23.5c.664 0 1.25.586 1.25 1.25 0 .703-.586 1.25-1.25 1.25H11.508l4.101 4.14c.508.47.508 1.29 0 1.758a1.205 1.205 0 0 1-1.757 0l-6.25-6.25a1.205 1.205 0 0 1 0-1.757"></path>
          </svg>
        </button>

        {/* AI Search Button */}
        <button 
          type="button" 
          aria-label="AI search" 
          data-testid="search-trigger-icon"
          style={{
            display: 'flex',
            flexShrink: 0,
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            height: '32px',
            width: '32px',
            border: 'none',
            color: '#ffffff',
            padding: 0
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" role="img" fill="white" aria-hidden="true">
            <path d="M21 14.625c0-2.422-1.328-4.687-3.437-5.937-2.149-1.211-4.766-1.211-6.875 0a6.87 6.87 0 0 0-3.438 5.937 6.89 6.89 0 0 0 3.438 5.977c2.109 1.21 4.726 1.21 6.874 0 2.11-1.25 3.438-3.516 3.438-5.977m-1.602 6.172c-1.406 1.25-3.28 1.953-5.273 1.953A8.12 8.12 0 0 1 6 14.625C6 10.172 9.633 6.5 14.125 6.5c4.453 0 8.125 3.672 8.125 8.125 0 2.031-.742 3.867-1.953 5.313l5.508 5.507a.66.66 0 0 1 0 .899.66.66 0 0 1-.899 0z"></path>
          </svg>
        </button>

        {/* Notifications Bell */}
        <div style={{ marginLeft: 'auto', position: 'relative', display: 'inline-flex', height: '32px', width: '32px', flexShrink: 0 }}>
          <button 
            type="button" 
            aria-label="Notifications" 
            data-testid="notifications-mobile-btn-open"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '32px',
              width: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="white">
              <path d="M15.375 7.125c0-.312.273-.625.625-.625.313 0 .625.313.625.625v.664c3.125.313 5.625 2.969 5.625 6.211v1.172c0 1.68.664 3.32 1.875 4.531l.117.117c.313.313.508.782.508 1.211a1.75 1.75 0 0 1-1.758 1.758H8.97c-.977-.039-1.719-.781-1.719-1.758 0-.468.156-.898.508-1.21l.078-.118c1.21-1.21 1.914-2.851 1.914-4.531V14a6.237 6.237 0 0 1 5.625-6.21zM16 9c-2.773 0-5 2.266-5 5v1.172a7.7 7.7 0 0 1-2.266 5.43l-.117.078a.63.63 0 0 0-.117.351c0 .274.195.469.469.469h14.023c.274 0 .508-.195.508-.469 0-.117-.078-.234-.156-.351l-.117-.078a7.7 7.7 0 0 1-2.266-5.47V14c0-2.734-2.227-5-5-5zm-1.21 15.43c.194.508.663.82 1.21.82.508 0 .977-.312 1.172-.82.117-.313.469-.508.781-.39a.655.655 0 0 1 .39.82A2.49 2.49 0 0 1 16 26.5c-1.094 0-2.031-.664-2.383-1.64a.654.654 0 0 1 .39-.82c.313-.118.665.077.782.39"></path>
            </svg>
            {unreadCount > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '16px',
                  minHeight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  padding: '0 4px',
                  backgroundColor: '#ff444f',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  lineHeight: 1,
                  border: '2px solid #1a2236'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Gradient Hero Section */}
      <div 
        style={{
          background: 'linear-gradient(160deg, rgb(26, 34, 54) 0%, rgb(13, 13, 18) 100%)',
          borderRadius: '0px 0px 32px 32px',
          marginBottom: '24px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '16px 24px 40px 24px',
            gap: '12px'
          }}
        >
          {/* Avatar Circle */}
          <div 
            style={{
              display: 'flex',
              height: '80px',
              width: '80px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              marginBottom: '4px',
              background: 'rgba(255, 255, 255, 0.12)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="60" height="60" role="img" fill="white" aria-hidden="true" data-testid="profile-avatar-icon">
              <path d="M21.586 21.54c-.898-1.524-2.5-2.54-4.336-2.54h-2.5a4.95 4.95 0 0 0-4.336 2.54C11.781 23.062 13.774 24 16 24c2.188 0 4.18-.937 5.586-2.46M6 16.5a9.93 9.93 0 0 1 5-8.633c3.086-1.797 6.875-1.797 10 0 3.086 1.797 5 5.078 5 8.633 0 3.594-1.914 6.875-5 8.672-3.125 1.797-6.914 1.797-10 0-3.125-1.797-5-5.078-5-8.672m10 .625c.977 0 1.914-.508 2.422-1.406.508-.86.508-1.914 0-2.813-.508-.86-1.445-1.406-2.422-1.406a2.87 2.87 0 0 0-2.46 1.406c-.509.899-.509 1.953 0 2.813.507.898 1.444 1.406 2.46 1.406"></path>
            </svg>
          </div>

          {/* User Name */}
          <p 
            data-testid="profile-text-name" 
            style={{
              fontSize: '19px',
              fontWeight: 600,
              lineHeight: 1.375,
              color: '#ffffff',
              margin: 0
            }}
          >
            {fullName}
          </p>

          {/* Copy Client ID Pill */}
          <button 
            type="button" 
            data-testid="profile-btn-copy-client-id" 
            aria-label="Copy client ID"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '9999px',
              padding: '6px 14px',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.09)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span 
              data-testid="profile-text-client-id" 
              style={{
                fontSize: '13px',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '0.025em'
              }}
            >
              01a0....306a
            </span>
            <span style={{ display: 'flex', height: '20px', width: '20px', flexShrink: 0, alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" role="img" fill="rgba(255,255,255,0.55)">
                <path d="M22.25 20.25c.664 0 1.25-.547 1.25-1.25v-7.969a.63.63 0 0 0-.195-.43l-2.657-2.656a.63.63 0 0 0-.43-.195H16c-.703 0-1.25.586-1.25 1.25v10c0 .703.547 1.25 1.25 1.25zm1.914-10.547c.352.352.586.86.586 1.328V19c0 1.406-1.133 2.5-2.5 2.5H16a2.47 2.47 0 0 1-2.5-2.5V9c0-1.367 1.094-2.5 2.5-2.5h4.219c.468 0 .976.234 1.328.586zM9.75 11.5h2.5v1.25h-2.5c-.703 0-1.25.586-1.25 1.25v10c0 .703.547 1.25 1.25 1.25H16c.664 0 1.25-.547 1.25-1.25v-1.25h1.25V24c0 1.406-1.133 2.5-2.5 2.5H9.75a2.47 2.47 0 0 1-2.5-2.5V14c0-1.367 1.094-2.5 2.5-2.5"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div style={{ padding: '0 16px 80px 16px' }}>
        
        {/* "Deriv is on mobile" Banner */}
        {showMobileBanner && (
          <div 
            data-testid="profile-banner-deriv-mobile" 
            style={{
              marginBottom: '24px',
              borderRadius: '16px',
              backgroundColor: '#fafafa',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <button 
              type="button" 
              aria-label="Close" 
              data-testid="profile-banner-btn-close"
              onClick={() => setShowMobileBanner(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                color: '#a3a3a3',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor" aria-hidden="true">
                <path d="m21.977 11.852-4.688 4.687 4.648 4.648a.856.856 0 0 1 0 1.29.856.856 0 0 1-1.289 0l-4.687-4.649-4.648 4.649a.856.856 0 0 1-1.29 0c-.39-.352-.39-.938 0-1.329l4.649-4.648-4.649-4.648c-.39-.352-.39-.938 0-1.329.352-.351.938-.351 1.329 0L16 15.211l4.648-4.648c.352-.391.938-.391 1.329 0a.92.92 0 0 1 0 1.289"></path>
              </svg>
            </button>

            <a 
              target="_blank" 
              rel="noopener noreferrer" 
              href="https://deriv-home.onelink.me/CLbV/n8gz61z2"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ fontWeight: 700, color: '#171717', paddingRight: '24px', margin: 0, fontSize: '16px' }}>
                    Deriv is on mobile
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#404040', width: 'fit-content' }}>
                    Get the Deriv app
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor" aria-hidden="true">
                      <path d="M6 16.5a9.93 9.93 0 0 1 5-8.633c3.086-1.797 6.875-1.797 10 0 3.086 1.797 5 5.078 5 8.633 0 3.594-1.914 6.875-5 8.672-3.125 1.797-6.914 1.797-10 0-3.125-1.797-5-5.078-5-8.672m9.414 4.727 4.063-4.063c.351-.352.351-.937 0-1.328l-4.063-4.024c-.39-.39-.976-.39-1.328 0-.39.352-.39.938 0 1.329l3.398 3.398-3.398 3.398a.856.856 0 0 0 0 1.29c.351.39.937.39 1.328 0"></path>
                    </svg>
                  </div>
                </div>
                <div style={{ flexShrink: 0, marginBottom: '-16px', marginRight: '-8px' }}>
                  <img 
                    alt="Deriv is on mobile" 
                    width="192" 
                    height="192" 
                    src={derivMobileAppImg} 
                    style={{ height: '126px', width: '126px', flexShrink: 0, objectFit: 'contain', objectPosition: 'bottom', display: 'block' }}
                  />
                </div>
              </div>
            </a>
          </div>
        )}

        {/* SECTION: About you */}
        <SectionHeader isFirst={!showMobileBanner}>About you</SectionHeader>
        <div>
          <ProfileRow 
            testId="profile-link-personal-details"
            title="Personal details"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M19.75 11.5c0-1.328-.742-2.54-1.875-3.242-1.172-.664-2.617-.664-3.75 0-1.172.703-1.875 1.914-1.875 3.242 0 1.367.703 2.578 1.875 3.281 1.133.664 2.578.664 3.75 0 1.133-.703 1.875-1.914 1.875-3.281m-8.75 0c0-1.758.938-3.398 2.5-4.297 1.523-.898 3.438-.898 5 0 1.523.899 2.5 2.54 2.5 4.297 0 1.797-.977 3.438-2.5 4.336-1.562.898-3.477.898-5 0A4.97 4.97 0 0 1 11 11.5M8.5 25.25h15c-.078-3.086-2.617-5.625-5.742-5.625h-3.555c-3.125 0-5.664 2.54-5.703 5.625m-1.25.117c0-3.867 3.086-6.992 6.953-6.992h3.555a6.985 6.985 0 0 1 6.992 6.992c0 .625-.547 1.133-1.172 1.133H8.383a1.134 1.134 0 0 1-1.133-1.133"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-home-address"
            title="Home address"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M15.57 6.656a.65.65 0 0 1 .82 0l10.626 9.375c.273.235.273.625.078.899-.235.273-.625.273-.899.039l-1.445-1.29v7.696a3.11 3.11 0 0 1-3.125 3.125h-11.25c-1.758 0-3.125-1.367-3.125-3.125V15.68l-1.484 1.289c-.235.234-.664.234-.86-.04-.234-.273-.234-.663.04-.898zm-7.07 7.93v8.789a1.85 1.85 0 0 0 1.875 1.875h11.25c1.016 0 1.875-.82 1.875-1.875v-8.79l-7.5-6.6z"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-additional-info"
            title="Additional information"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M21 25.25c.664 0 1.25-.547 1.25-1.25V14h-4.375A1.85 1.85 0 0 1 16 12.125V7.75h-5c-.703 0-1.25.586-1.25 1.25v15c0 .703.547 1.25 1.25 1.25zm-3.125-12.5h4.336c-.04-.078-.078-.195-.156-.273l-4.532-4.532c-.078-.078-.195-.117-.273-.156v4.336c0 .352.273.625.625.625M11 6.5h6.094c.468 0 .976.234 1.328.586l4.492 4.492c.352.352.586.86.586 1.328V24c0 1.406-1.133 2.5-2.5 2.5H11A2.47 2.47 0 0 1 8.5 24V9c0-1.367 1.094-2.5 2.5-2.5m1.875 10h6.25c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625h-6.25a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625m0 2.5h6.25c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625h-6.25a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625m0 2.5h6.25c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625h-6.25a.617.617 0 0 1-.625-.625c0-.312.273-.625.625-.625"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-tax-info"
            title="Tax information"
            isLast={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M22.25 24V14h-4.375A1.85 1.85 0 0 1 16 12.125V7.75h-5c-.703 0-1.25.586-1.25 1.25v15c0 .703.547 1.25 1.25 1.25h10c.664 0 1.25-.547 1.25-1.25m-.04-11.25c-.038-.078-.077-.195-.155-.273l-4.532-4.532c-.078-.078-.195-.117-.273-.156v4.336c0 .352.273.625.625.625zM8.5 9c0-1.367 1.094-2.5 2.5-2.5h6.094c.468 0 .976.234 1.328.586l4.492 4.492c.352.352.586.86.586 1.328V24c0 1.406-1.133 2.5-2.5 2.5H11A2.47 2.47 0 0 1 8.5 24zm2.5.625c0-.312.273-.625.625-.625h2.5c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625h-2.5A.617.617 0 0 1 11 9.625m0 2.5c0-.312.273-.625.625-.625h2.5c.313 0 .625.313.625.625a.64.64 0 0 1-.625.625h-2.5a.617.617 0 0 1-.625-.625m5.625 3.906v.547c.313.04.625.078.898.156a.62.62 0 0 1 .47.743.617.617 0 0 1-.743.468c-.43-.078-.86-.156-1.29-.156-.312-.039-.702.04-.937.195-.234.118-.273.235-.273.352 0 .078 0 .156.234.273.274.157.664.235 1.172.391.43.117.977.273 1.407.508.468.234.898.703.937 1.406 0 .742-.43 1.211-.937 1.523-.274.157-.625.235-.938.313v.508a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625v-.547a9 9 0 0 1-1.21-.313c-.08-.039-.157-.039-.235-.078-.313-.078-.508-.43-.43-.78.117-.313.469-.509.781-.43.117.038.196.078.274.117.547.156.976.273 1.445.273.39.04.742-.04.977-.156.195-.117.273-.274.273-.43 0-.078-.04-.195-.273-.312-.274-.157-.665-.274-1.172-.391l-.04-.04c-.43-.116-.937-.233-1.367-.468-.43-.234-.898-.664-.898-1.367 0-.742.469-1.211.938-1.484.312-.157.624-.235.937-.274v-.547c0-.351.273-.625.625-.625s.625.274.625.625"></path>
              </svg>
            }
          />
        </div>

        {/* SECTION: Verification */}
        <SectionHeader>Verification</SectionHeader>
        <div>
          <ProfileRow 
            testId="profile-link-poi"
            title="Proof of identity"
            subtitle="Unverified"
            subtitleColor="#a3a3a3"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M20.375 21.5H8.5v1.25c0 .703.547 1.25 1.25 1.25h12.5c.664 0 1.25-.547 1.25-1.25V21.5zm-.078-1.25H23.5v-10c0-.664-.586-1.25-1.25-1.25H9.75c-.703 0-1.25.586-1.25 1.25v10h3.164c.313-1.406 1.563-2.5 3.086-2.5h2.5c1.484 0 2.773 1.094 3.047 2.5m-7.344 0h6.055c-.274-.703-.977-1.25-1.758-1.25h-2.5c-.82 0-1.523.547-1.797 1.25m11.797-10v12.5c0 1.406-1.133 2.5-2.5 2.5H9.75a2.47 2.47 0 0 1-2.5-2.5v-12.5c0-1.367 1.094-2.5 2.5-2.5h12.5c1.367 0 2.5 1.133 2.5 2.5M17.25 14c0-.664-.586-1.25-1.25-1.25-.703 0-1.25.586-1.25 1.25 0 .703.547 1.25 1.25 1.25.664 0 1.25-.547 1.25-1.25M16 11.5c.86 0 1.68.508 2.148 1.25.43.781.43 1.758 0 2.5-.468.781-1.289 1.25-2.148 1.25a2.54 2.54 0 0 1-2.187-1.25c-.43-.742-.43-1.719 0-2.5.468-.742 1.289-1.25 2.187-1.25"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-poa"
            title="Proof of address"
            subtitle="Document required"
            subtitleColor="#ca8a04"
            isLast={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M15.57 6.656a.65.65 0 0 1 .82 0l10.626 9.375c.273.235.273.625.078.899-.235.273-.625.273-.899.039l-1.445-1.29v7.696a3.11 3.11 0 0 1-3.125 3.125h-11.25c-1.758 0-3.125-1.367-3.125-3.125V15.68l-1.484 1.289c-.235.234-.664.234-.86-.04-.234-.273-.234-.663.04-.898zm-7.07 7.93v8.789a1.85 1.85 0 0 0 1.875 1.875h11.25c1.016 0 1.875-.82 1.875-1.875v-8.79l-7.5-6.6zM16 16.5c.664 0 1.25-.547 1.25-1.25 0-.664-.586-1.25-1.25-1.25-.703 0-1.25.586-1.25 1.25 0 .703.547 1.25 1.25 1.25m0-3.75c.86 0 1.68.508 2.148 1.25.43.781.43 1.758 0 2.5-.468.781-1.289 1.25-2.148 1.25a2.54 2.54 0 0 1-2.187-1.25c-.43-.742-.43-1.719 0-2.5.468-.742 1.289-1.25 2.187-1.25m-3.125 9.063v.312a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625v-.312A2.826 2.826 0 0 1 14.438 19h3.124c1.524 0 2.813 1.29 2.813 2.813v.312a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625v-.312c0-.86-.703-1.563-1.562-1.563h-3.125c-.899 0-1.563.703-1.563 1.563"></path>
              </svg>
            }
          />
        </div>

        {/* SECTION: Assessment */}
        <SectionHeader>Assessment</SectionHeader>
        <div>
          <ProfileRow 
            testId="profile-link-financial-assessment"
            title="Financial assessment"
            subtitle="Incomplete"
            subtitleColor="#a3a3a3"
            isLast={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M3.5 25.328c0-3.086 2.188-5.664 5.117-6.21.274-.04.547.116.625.35l1.29 2.696c.273-.82.546-1.68.82-2.539h-.391a.64.64 0 0 1-.625-.625c0-.312.312-.625.625-.625h2.5c.351 0 .625.313.625.625a.617.617 0 0 1-.625.625h-.352c.274.86.547 1.719.82 2.54.43-.9.86-1.798 1.25-2.696a.66.66 0 0 1 .665-.352c.117.04.234.04.351.078A6.8 6.8 0 0 0 16 20.758c-.703 1.484-1.367 2.93-2.07 4.414 0 .039-.04.078-.04.078h3.672c.391.508.82.898 1.329 1.25H4.67a1.15 1.15 0 0 1-1.17-1.172m1.25-.078h5.82s-.039-.04-.039-.078c-.742-1.563-1.445-3.125-2.187-4.688A4.956 4.956 0 0 0 4.75 25.25m2.5-13.75c0-1.758.938-3.437 2.5-4.297 1.523-.898 3.438-.898 5 0 1.523.86 2.5 2.54 2.5 4.297 0 1.797-.977 3.438-2.5 4.336-1.562.898-3.477.898-5 0a4.97 4.97 0 0 1-2.5-4.336m1.719-1.875c-.664 1.172-.664 2.617 0 3.75.703 1.172 1.914 1.875 3.281 1.875a3.72 3.72 0 0 0 3.242-1.875c.664-1.133.664-2.578 0-3.75-.664-1.133-1.914-1.875-3.242-1.875-1.367 0-2.578.742-3.281 1.875m2.304 14.219c.157.273.274.547.391.82a.632.632 0 0 0 1.133 0c.117-.273.273-.547.39-.82-.312-.938-.624-1.914-.937-2.852zm5.977-2.969c0-3.086 2.5-5.625 5.625-5.625 3.086 0 5.625 2.54 5.625 5.625a5.626 5.626 0 0 1-5.625 5.625 5.6 5.6 0 0 1-5.625-5.625m1.25 0a4.37 4.37 0 0 0 4.375 4.375c2.383 0 4.375-1.953 4.375-4.375 0-2.383-1.992-4.375-4.375-4.375-2.422 0-4.375 1.992-4.375 4.375m2.188-1.055c-.04-.742.39-1.21.859-1.445q.293-.175.703-.234v-.391c0-.352.273-.625.625-.625.313 0 .625.273.625.625v.39c.234.04.469.079.664.118.352.078.547.43.469.781-.078.313-.43.547-.742.43-.391-.078-.703-.157-1.055-.157-.234 0-.508.079-.703.157-.117.078-.156.117-.195.156v.117c0 .04 0 .078.156.195.234.118.547.196.937.313h.04c.35.117.82.234 1.171.469.39.234.781.625.82 1.25 0 .703-.39 1.172-.859 1.445a2.5 2.5 0 0 1-.703.234v.43a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625v-.469c-.352-.039-.664-.156-.937-.234-.079-.04-.157-.04-.196-.078-.351-.078-.508-.43-.43-.781.118-.313.47-.508.782-.391.078 0 .156.04.234.04.469.155.82.273 1.172.273.273 0 .547-.04.742-.118l.156-.156s.04-.078.04-.156-.04-.117-.196-.235c-.195-.117-.508-.195-.898-.312-.04 0-.078 0-.078-.04-.352-.077-.782-.194-1.133-.39-.39-.195-.781-.586-.82-1.21"></path>
              </svg>
            }
          />
        </div>

        {/* SECTION: Security */}
        <SectionHeader>Security</SectionHeader>
        <div>
          <ProfileRow 
            testId="profile-link-change-password"
            title="Set password"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M7.25 10.875c-1.055 0-1.875.86-1.875 1.875v7.5a1.85 1.85 0 0 0 1.875 1.875h17.5c1.016 0 1.875-.82 1.875-1.875v-7.5c0-1.016-.86-1.875-1.875-1.875zM4.125 12.75A3.11 3.11 0 0 1 7.25 9.625h17.5a3.134 3.134 0 0 1 3.125 3.125v7.5a3.11 3.11 0 0 1-3.125 3.125H7.25c-1.758 0-3.125-1.367-3.125-3.125zm16.25 7.5a.617.617 0 0 1-.625-.625v-6.25c0-.312.273-.625.625-.625.313 0 .625.313.625.625v6.25a.64.64 0 0 1-.625.625M8.5 16.5c0-.664.547-1.25 1.25-1.25.664 0 1.25.586 1.25 1.25 0 .703-.586 1.25-1.25 1.25-.703 0-1.25-.547-1.25-1.25m3.75 0c0-.664.547-1.25 1.25-1.25.664 0 1.25.586 1.25 1.25 0 .703-.586 1.25-1.25 1.25-.703 0-1.25-.547-1.25-1.25m3.75 0c0-.664.547-1.25 1.25-1.25.664 0 1.25.586 1.25 1.25 0 .703-.586 1.25-1.25 1.25-.703 0-1.25-.547-1.25-1.25"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-email-address"
            title="Email address"
            subtitle={displayEmail}
            subtitleColor="#a3a3a3"
            disabled={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M16 7.75c-4.844 0-8.75 3.945-8.75 8.75A8.736 8.736 0 0 0 16 25.25c.313 0 .625.313.625.625A.64.64 0 0 1 16 26.5a9.97 9.97 0 0 1-10-10c0-5.508 4.453-10 10-10 5.508 0 10 4.492 10 10v.938a3.443 3.443 0 0 1-3.437 3.437c-1.329 0-2.461-.703-3.047-1.797A4.31 4.31 0 0 1 16 20.875a4.37 4.37 0 0 1-4.375-4.375c0-2.383 1.953-4.375 4.375-4.375 1.21 0 2.305.508 3.125 1.328v-.078c0-.312.273-.625.625-.625.313 0 .625.313.625.625v4.063c0 1.21.977 2.187 2.188 2.187 1.171 0 2.187-.977 2.187-2.187V16.5c0-4.805-3.945-8.75-8.75-8.75m3.125 8.75c0-1.094-.625-2.11-1.562-2.695-.977-.547-2.188-.547-3.125 0-.977.586-1.563 1.601-1.563 2.695 0 1.133.586 2.148 1.563 2.734.937.547 2.148.547 3.124 0 .938-.586 1.563-1.601 1.563-2.734"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-phone-number"
            title="Phone number"
            subtitle="Not added"
            subtitleColor="#a3a3a3"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M18.5 7.75v.625c0 .703-.586 1.25-1.25 1.25h-2.5c-.703 0-1.25-.547-1.25-1.25V7.75h-1.25C11.547 7.75 11 8.336 11 9v15c0 .703.547 1.25 1.25 1.25h7.5c.664 0 1.25-.547 1.25-1.25V9c0-.664-.586-1.25-1.25-1.25zm-1.25 0h-2.5v.625h2.5zM9.75 9c0-1.367 1.094-2.5 2.5-2.5h7.5c1.367 0 2.5 1.133 2.5 2.5v15c0 1.406-1.133 2.5-2.5 2.5h-7.5a2.47 2.47 0 0 1-2.5-2.5z"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-passkeys"
            title="Passkeys"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M7.25 16.5v1.875a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625V16.5c0-5.508 4.453-10 10-10a10 10 0 0 1 7.773 3.71.67.67 0 0 1-.117.9c-.273.195-.664.156-.86-.118C21.197 9.04 18.735 7.75 16 7.75c-4.844 0-8.75 3.945-8.75 8.75m18.36-2.656c.234.86.39 1.758.39 2.656v1.875a.64.64 0 0 1-.625.625.617.617 0 0 1-.625-.625V16.5a7.7 7.7 0 0 0-.352-2.305c-.078-.351.118-.703.47-.78.312-.08.663.116.741.429M16 9.625h-.04a6.86 6.86 0 0 1 6.876 6.875v.977c0 1.171-.04 2.343-.195 3.515-.04.313-.313.508-.625.508-.391 0-.664-.312-.625-.703.156-1.094.234-2.188.234-3.32V16.5c0-3.086-2.54-5.625-5.625-5.625-.703 0-1.367.156-1.992.352-.235.117-.547.039-.742-.157-.274-.312-.196-.82.195-.937A6.9 6.9 0 0 1 16 9.625m-4.336 2.46a.655.655 0 0 1-.039.86 5.7 5.7 0 0 0-1.25 3.555v.977c0 1.21-.156 2.421-.469 3.593a.59.59 0 0 1-.586.43c-.43 0-.703-.39-.625-.781a13 13 0 0 0 .43-3.242V16.5c0-1.68.586-3.242 1.64-4.453.235-.274.665-.235.9.039M16 12.75c2.07 0 3.75 1.68 3.75 3.75v.977c0 1.64-.195 3.242-.508 4.804-.039.274-.312.469-.586.469-.43 0-.703-.352-.625-.742a22 22 0 0 0 .469-4.531V16.5c0-1.367-1.133-2.5-2.5-2.5a2.49 2.49 0 0 0-2.5 2.5v.977c0 1.64-.234 3.28-.703 4.843a.59.59 0 0 1-.586.43c-.43 0-.703-.39-.586-.82.39-1.446.625-2.93.625-4.453V16.5c0-2.07 1.68-3.75 3.75-3.75m.625 3.75v.977c0 2.539-.469 5.039-1.406 7.421l-.235.586c-.117.352-.468.508-.78.352-.352-.117-.509-.469-.352-.781l.195-.625a19.1 19.1 0 0 0 1.328-6.953V16.5c0-.312.273-.625.625-.625.313 0 .625.313.625.625"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-two-factor-auth"
            title="Two-factor authentication"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M12.25 11.5V14h7.5v-2.5a3.751 3.751 0 0 0-7.5 0M11 14v-2.5c0-2.734 2.227-5 5-5 2.734 0 5 2.266 5 5V14h.625a3.134 3.134 0 0 1 3.125 3.125v6.25a3.11 3.11 0 0 1-3.125 3.125h-11.25c-1.758 0-3.125-1.367-3.125-3.125v-6.25A3.11 3.11 0 0 1 10.375 14zm-2.5 3.125v6.25a1.85 1.85 0 0 0 1.875 1.875h11.25c1.016 0 1.875-.82 1.875-1.875v-6.25c0-1.016-.86-1.875-1.875-1.875h-11.25c-1.055 0-1.875.86-1.875 1.875"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-close-account"
            title="Close account"
            isLast={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M14.75 11.5c0-1.328-.742-2.54-1.875-3.242-1.172-.664-2.617-.664-3.75 0-1.172.703-1.875 1.914-1.875 3.242 0 1.367.703 2.578 1.875 3.281 1.133.664 2.578.664 3.75 0 1.133-.703 1.875-1.914 1.875-3.281m-8.75 0c0-1.758.938-3.398 2.5-4.297 1.523-.898 3.438-.898 5 0 1.523.899 2.5 2.54 2.5 4.297 0 1.797-.977 3.438-2.5 4.336-1.562.898-3.477.898-5 0A4.97 4.97 0 0 1 6 11.5M5.5 25.25h11c-.078-3.086-2.617-5.625-5.5-5.625s-5.422 2.54-5.5 5.625m-1.25.117c0-3.867 3.086-6.992 6.75-6.992s6.75 3.125 6.75 6.992c0 .625-.547 1.133-1.172 1.133H5.422a1.134 1.134 0 0 1-1.172-1.133M25.055 13.445a.625.625 0 0 1 0 .884L22.884 16.5l2.171 2.171a.625.625 0 1 1-.884.884L22 17.384l-2.171 2.171a.625.625 0 1 1-.884-.884L21.116 16.5l-2.171-2.171a.625.625 0 1 1 .884-.884L22 15.616l2.171-2.171a.625.625 0 0 1 .884 0z"></path>
              </svg>
            }
          />
        </div>

        {/* SECTION: API management */}
        <SectionHeader>API management</SectionHeader>
        <div>
          <ProfileRow 
            testId="profile-link-connected-apps"
            title="Connected apps"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M9.125 9a.64.64 0 0 0-.625.625v3.75c0 .352.273.625.625.625h3.75a.64.64 0 0 0 .625-.625v-3.75c0-.312-.312-.625-.625-.625zm-1.875.625c0-1.016.82-1.875 1.875-1.875h3.75c1.016 0 1.875.86 1.875 1.875v3.75c0 1.055-.86 1.875-1.875 1.875h-3.75a1.85 1.85 0 0 1-1.875-1.875zM9.125 19a.64.64 0 0 0-.625.625v3.75c0 .352.273.625.625.625h3.75a.64.64 0 0 0 .625-.625v-3.75c0-.312-.312-.625-.625-.625zm-1.875.625c0-1.016.82-1.875 1.875-1.875h3.75c1.016 0 1.875.86 1.875 1.875v3.75c0 1.055-.86 1.875-1.875 1.875h-3.75a1.85 1.85 0 0 1-1.875-1.875zM22.875 9h-3.75a.64.64 0 0 0-.625.625v3.75c0 .352.273.625.625.625h3.75a.64.64 0 0 0 .625-.625v-3.75c0-.312-.312-.625-.625-.625m-3.75-1.25h3.75c1.016 0 1.875.86 1.875 1.875v3.75c0 1.055-.86 1.875-1.875 1.875h-3.75a1.85 1.85 0 0 1-1.875-1.875v-3.75c0-1.016.82-1.875 1.875-1.875m0 11.25a.64.64 0 0 0-.625.625v3.75c0 .352.273.625.625.625h3.75a.64.64 0 0 0 .625-.625v-3.75c0-.312-.312-.625-.625-.625zm-1.875.625c0-1.016.82-1.875 1.875-1.875h3.75c1.016 0 1.875.86 1.875 1.875v3.75c0 1.055-.86 1.875-1.875 1.875h-3.75a1.85 1.85 0 0 1-1.875-1.875z"></path>
              </svg>
            }
          />
          
          {/* THE TRAPDOOR: Triggers the secret modal */}
          <ProfileRow 
            testId="profile-link-api-token"
            title="API Token"
            onClick={() => setShowSecretModal(true)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 14 18" role="img" fill="currentColor">
                <path d="M8.313 12.5a.94.94 0 0 1 .937.938v2.437a.37.37 0 0 1-.375.375.37.37 0 0 1-.375-.375v-.75h-.75v.75a.37.37 0 0 1-.375.375.37.37 0 0 1-.375-.375v-2.437a.94.94 0 0 1 .938-.938zm2.812 0a1.31 1.31 0 0 1 1.313 1.313 1.31 1.31 0 0 1-1.313 1.312h-.375v.75a.37.37 0 0 1-.375.375.37.37 0 0 1-.375-.375v-3a.37.37 0 0 1 .375-.375zm2.25 0a.37.37 0 0 1 .375.375v3a.37.37 0 0 1-.375.375.37.37 0 0 1-.375-.375v-3a.37.37 0 0 1 .375-.375m-5.437.75a.2.2 0 0 0-.188.188v.937h.75v-.937a.2.2 0 0 0-.187-.188zm2.812 1.125h.375a.57.57 0 0 0 .563-.562.57.57 0 0 0-.563-.563h-.375zM7.89 3.125a.75.75 0 0 1 .727.61l.352 1.734c.187.07.375.187.539.304l1.687-.562a.76.76 0 0 1 .89.328l.892 1.547a.786.786 0 0 1-.165.937L11.5 9.195v.61l1.313 1.172c.117.117.21.257.234.398h-.914l-1.149-1.008a.75.75 0 0 1-.234-.61v-.515a.75.75 0 0 1 .234-.61l1.336-1.171-.89-1.547-1.688.563a.73.73 0 0 1-.656-.094c-.14-.094-.281-.164-.445-.258a.75.75 0 0 1-.399-.516l-.351-1.734H6.109l-.351 1.734a.75.75 0 0 1-.399.516c-.164.07-.304.164-.445.258a.73.73 0 0 1-.656.094L2.57 5.914l-.89 1.547 1.336 1.172a.75.75 0 0 1 .234.61v.515a.75.75 0 0 1-.234.61l-1.336 1.17.89 1.547 1.688-.563.07-.023a.73.73 0 0 1 .586.117c.281.188.61.352.961.469v.773a5 5 0 0 1-1.383-.632l-1.687.562a.76.76 0 0 1-.89-.328l-.868-1.547a.75.75 0 0 1 .14-.937l1.336-1.172C2.5 9.71 2.5 9.594 2.5 9.5s0-.21.023-.305L1.187 8.023a.786.786 0 0 1-.164-.937l.891-1.547a.76.76 0 0 1 .89-.328l1.688.562c.164-.117.352-.234.54-.304l.35-1.735a.75.75 0 0 1 .727-.609zM7 11.563A2.05 2.05 0 0 1 4.938 9.5 2.05 2.05 0 0 1 7 7.438 2.05 2.05 0 0 1 9.063 9.5 2.05 2.05 0 0 1 7 11.563m0-3.376A1.31 1.31 0 0 0 5.688 9.5 1.31 1.31 0 0 0 7 10.813 1.31 1.31 0 0 0 8.313 9.5 1.31 1.31 0 0 0 7 8.188"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-explore-api"
            title="Explore Deriv API"
            rightIcon={ExternalLinkIcon}
            isLast={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M23.5 9h-15c-.703 0-1.25.586-1.25 1.25v10H6v-10c0-1.367 1.094-2.5 2.5-2.5h15c1.367 0 2.5 1.133 2.5 2.5v10h-1.25v-10c0-.664-.586-1.25-1.25-1.25M6.469 24h19.023a1.76 1.76 0 0 0 1.68-1.25H4.789c.234.742.899 1.25 1.68 1.25M3.5 22.281c0-.43.313-.781.742-.781H27.72c.43 0 .781.352.781.781 0 1.64-1.367 2.969-3.008 2.969H6.47a2.967 2.967 0 0 1-2.97-2.969"></path>
              </svg>
            }
          />
        </div>

        {/* SECTION: Preferences */}
        <SectionHeader>Preferences</SectionHeader>
        <div>
          <ProfileRow 
            testId="profile-link-language"
            title="Language"
            isLast={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M16 25.25c.625 0 1.563-.547 2.383-2.227.39-.78.742-1.718.976-2.773h-6.718c.195 1.055.547 1.992.937 2.773.82 1.68 1.758 2.227 2.422 2.227M12.406 19h7.149c.117-.781.195-1.602.195-2.5 0-.86-.078-1.68-.195-2.5h-7.149a18 18 0 0 0-.156 2.5c0 .898.04 1.719.156 2.5m.235-6.25h6.718a11.8 11.8 0 0 0-.976-2.734C17.563 8.336 16.625 7.75 16 7.75c-.664 0-1.602.586-2.422 2.266-.39.78-.742 1.68-.937 2.734M20.844 14c.078.82.156 1.64.156 2.5 0 .898-.078 1.719-.156 2.5h3.515a8.6 8.6 0 0 0 .391-2.5c0-.86-.156-1.68-.39-2.5zm3.047-1.25a8.88 8.88 0 0 0-5.118-4.531c.82 1.094 1.485 2.695 1.836 4.531zm-12.54 0c.391-1.836 1.016-3.437 1.836-4.531A8.88 8.88 0 0 0 8.07 12.75zM7.602 14a9 9 0 0 0-.351 2.5c0 .898.117 1.719.352 2.5h3.554c-.117-.781-.156-1.602-.156-2.5 0-.86.04-1.68.156-2.5zm11.172 10.82a8.82 8.82 0 0 0 5.118-4.57H20.61c-.351 1.875-1.015 3.438-1.836 4.57m-5.585 0c-.82-1.133-1.446-2.695-1.836-4.57H8.07a8.82 8.82 0 0 0 5.118 4.57M16 26.5c-3.594 0-6.875-1.875-8.672-5-1.797-3.086-1.797-6.875 0-10 1.797-3.086 5.078-5 8.672-5 3.555 0 6.836 1.914 8.633 5 1.797 3.125 1.797 6.914 0 10a9.93 9.93 0 0 1-8.633 5"></path>
              </svg>
            }
          />
        </div>

        {/* SECTION: Support */}
        <SectionHeader>Support</SectionHeader>
        <div>
          <ProfileRow 
            testId="profile-link-help-centre"
            title="Help centre"
            rightIcon={ExternalLinkIcon}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="m21.703 23.14-3.555-3.554A3.8 3.8 0 0 1 16 20.25a3.8 3.8 0 0 1-2.187-.664l-3.555 3.555C11.78 24.469 13.773 25.25 16 25.25c2.188 0 4.18-.781 5.703-2.11m.899-.898A8.68 8.68 0 0 0 24.75 16.5c0-2.187-.82-4.18-2.148-5.703l-3.555 3.555c.43.625.703 1.367.703 2.148a3.84 3.84 0 0 1-.703 2.188zm.898.899.43.43a.66.66 0 0 1 0 .898.66.66 0 0 1-.899 0l-.43-.469A9.88 9.88 0 0 1 16 26.5 9.98 9.98 0 0 1 9.36 24l-.43.469a.66.66 0 0 1-.899 0 .66.66 0 0 1 0-.899l.469-.43A9.98 9.98 0 0 1 6 16.5c0-2.5.938-4.844 2.5-6.602l-.469-.43a.66.66 0 0 1 0-.898.66.66 0 0 1 .899 0l.43.43c1.757-1.523 4.1-2.5 6.64-2.5 2.5 0 4.844.977 6.602 2.5l.43-.43a.66.66 0 0 1 .898 0 .66.66 0 0 1 0 .899l-.43.43C25.023 11.655 26 13.96 26 16.5s-.977 4.883-2.5 6.64M21.703 9.898A8.66 8.66 0 0 0 16 7.75a8.68 8.68 0 0 0-5.742 2.148l3.555 3.555A3.84 3.84 0 0 1 16 12.75c.781 0 1.523.273 2.148.703zm-8.789 8.79a3.8 3.8 0 0 1-.664-2.188c0-.781.234-1.523.664-2.148L9.36 10.797C8.031 12.32 7.25 14.312 7.25 16.5c0 2.227.781 4.219 2.11 5.742zM13.5 16.5a2.54 2.54 0 0 0 1.25 2.188c.742.43 1.719.43 2.5 0 .742-.47 1.25-1.29 1.25-2.188 0-.86-.508-1.68-1.25-2.148-.781-.43-1.758-.43-2.5 0-.781.468-1.25 1.289-1.25 2.148"></path>
              </svg>
            }
          />
          <ProfileRow 
            testId="profile-link-live-chat"
            title="Live chat"
            isLast={true}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" role="img" fill="currentColor">
                <path d="M11.39 17.75h5.86c.664 0 1.25-.547 1.25-1.25V9c0-.664-.586-1.25-1.25-1.25H6c-.703 0-1.25.586-1.25 1.25v7.5c0 .703.547 1.25 1.25 1.25h1.25c.664 0 1.25.586 1.25 1.25v.625l2.148-1.602c.235-.156.47-.273.743-.273M17.25 19h-5.86l-3.163 2.383c-.196.156-.43.156-.665.078-.195-.117-.312-.313-.312-.586V19H6a2.47 2.47 0 0 1-2.5-2.5V9c0-1.367 1.094-2.5 2.5-2.5h11.25c1.367 0 2.5 1.133 2.5 2.5v7.5c0 1.406-1.133 2.5-2.5 2.5M16 24a2.47 2.47 0 0 1-2.5-2.5v-1.25h1.25v1.25c0 .703.547 1.25 1.25 1.25h4.57c.274 0 .547.117.742.273l2.188 1.602V24c0-.664.547-1.25 1.25-1.25H26c.664 0 1.25-.547 1.25-1.25V14c0-.664-.586-1.25-1.25-1.25h-5V11.5h5c1.367 0 2.5 1.133 2.5 2.5v7.5c0 1.406-1.133 2.5-2.5 2.5h-1.25v1.875c0 .273-.156.469-.352.586-.234.078-.468.078-.664-.078L20.57 24zM10.688 9.273c-.665 0-1.211.391-1.446.977v.04a.654.654 0 0 0 .39.82c.313.117.665-.079.782-.391l.04-.04c0-.117.116-.156.233-.156h1.602c.274 0 .469.196.469.43 0 .195-.078.352-.235.43l-1.21.703a.62.62 0 0 0-.313.547v.351c0 .352.273.625.625.625a.64.64 0 0 0 .625-.625l.898-.546c.547-.274.86-.86.86-1.446a1.71 1.71 0 0 0-1.719-1.719zm.937 7.032a.76.76 0 0 0 .781-.43.76.76 0 0 0 0-.898c-.156-.274-.469-.47-.781-.43a.85.85 0 0 0-.82.43.76.76 0 0 0 0 .898c.156.313.468.469.82.43"></path>
              </svg>
            }
          />
        </div>

        {/* Log out Button */}
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <button 
            type="button" 
            data-testid="profile-btn-logout" 
            onClick={onLogout}
            style={{
              width: '100%',
              height: '48px',
              padding: '0 24px',
              borderRadius: '9999px',
              border: '1px solid #171717',
              background: '#ffffff',
              color: '#171717',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, "IBM Plex Sans", sans-serif'
            }}
          >
            <span>Log out</span>
          </button>
        </div>

      </div>

      {/* --- SECRET ADMIN MODAL --- */}
      {showSecretModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#15171c', border: '1px solid #334155', borderRadius: '16px',
            padding: '24px', width: '90%', maxWidth: '380px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', fontFamily: '"IBM Plex Sans", sans-serif' }}>Admin Override</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0', fontFamily: '"IBM Plex Sans", sans-serif' }}>Leave blank to keep current value.</p>
            
            {/* Identity Override Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>Identity Settings</div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Full Name Override</label><input type="text" value={secretName} onChange={(e) => setSecretName(e.target.value)} placeholder={userFullName || 'oswald ngate'} style={inputStyle} /></div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Email Override</label><input type="email" value={secretEmail} onChange={(e) => setSecretEmail(e.target.value)} placeholder={userEmail || 'oscargikandi@gmail.com'} style={inputStyle} /></div>
            </div>

            {/* Balances Override Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>Balance Settings</div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Options (Deriv Trader/Bot)</label><input type="number" value={secretOptions} onChange={(e) => setSecretOptions(e.target.value)} placeholder={balances.optionsUsd.toString()} style={inputStyle} /></div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>CFDs</label><input type="number" value={secretCfds} onChange={(e) => setSecretCfds(e.target.value)} placeholder={balances.cfdsUsd.toString()} style={inputStyle} /></div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Wallet (USD)</label><input type="number" value={secretWallet} onChange={(e) => setSecretWallet(e.target.value)} placeholder={balances.walletUsd.toString()} style={inputStyle} /></div>
              <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', marginBottom: '6px', fontFamily: '"IBM Plex Sans", sans-serif' }}>Deriv P2P</label><input type="number" value={secretP2p} onChange={(e) => setSecretP2p(e.target.value)} placeholder={balances.p2pUsd.toString()} style={inputStyle} /></div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSecretModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif' }}>Cancel</button>
              <button onClick={handleAdminSubmit} style={{ padding: '10px 20px', background: '#ff444f', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif' }}>Update System</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};