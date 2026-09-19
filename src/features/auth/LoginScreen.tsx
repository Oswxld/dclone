import React, { useState } from 'react';
import styles from './LoginScreen.module.css';
import usersData from '../../data/users.json';

type LoginScreenProps = {
  onLoginSuccess?: (identifier: string) => void;
};

// Helper to reliably generate and fetch a persistent device fingerprint
const getDeviceFingerprint = () => {
  let id = localStorage.getItem('deriv_device_id');
  if (!id) {
    // Generate a secure random ID, fallback to Math.random for older browser support
    id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'dev-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deriv_device_id', id);
  }
  return id;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fingerprint State
  const [authStep, setAuthStep] = useState<'login' | 'pending_device'>('login');
  const [localDeviceId, setLocalDeviceId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const user = usersData.users.find(
      (u) => u.email === trimmedEmail && u.password === password
    );

    if (user) {
      const deviceId = getDeviceFingerprint();

      if (user.deviceId === "") {
        // Step 1: User is valid, but device is unregistered in users.json.
        // Show them the ID so they can send it to you.
        setLocalDeviceId(deviceId);
        setAuthStep('pending_device');
      } else if (user.deviceId === deviceId) {
        // Step 2: Perfect match. Let them in.
        onLoginSuccess?.(trimmedEmail);
      } else {
        // Step 3: Device mismatch. They are trying to use someone else's account.
        setErrorMsg("Unauthorized device. This account is permanently bound to another device.");
      }
    } else {
      setErrorMsg("Invalid email or password.");
    }
  };

  const isEmailFloating = isEmailFocused || email.length > 0;
  const isPasswordFloating = isPasswordFocused || password.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        
        {/* Top Bar: Logo & Header Controls */}
        <div className={styles.topBar}>
          <div>
            <a href="https://deriv.com" target="_blank" rel="noopener noreferrer">
              <svg width="88" height="24" viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.52 0C6.5 0 0 6.5 0 14.52s6.5 14.52 14.52 14.52c4.47 0 8.48-2.02 11.13-5.2l-6.84-4.56c-1.12 1.34-2.8 2.2-4.69 2.2-3.4 0-6.16-2.76-6.16-6.16 0-3.4 2.76-6.16 6.16-6.16 1.89 0 3.57.86 4.69 2.2l6.84-4.56C23 3.02 18.99 0 14.52 0z" fill="#FF444F" />
                <text x="32" y="22" fill="#FF444F" fontSize="22" fontWeight="800" fontStyle="italic" fontFamily="IBM Plex Sans, sans-serif">deriv</text>
              </svg>
            </a>
          </div>

          <div className={styles.topRight}>
            <button type="button" aria-label="Language" className={styles.langBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="14" height="14" role="img" aria-hidden="true" fill="currentColor">
                <path d="M16 25.25c.625 0 1.563-.547 2.383-2.227.39-.78.742-1.718.976-2.773h-6.718c.195 1.055.547 1.992.937 2.773.82 1.68 1.758 2.227 2.422 2.227M12.406 19h7.149c.117-.781.195-1.602.195-2.5 0-.86-.078-1.68-.195-2.5h-7.149a18 18 0 0 0-.156 2.5c0 .898.04 1.719.156 2.5m.235-6.25h6.718a11.8 11.8 0 0 0-.976-2.734C17.563 8.336 16.625 7.75 16 7.75c-.664 0-1.602.586-2.422 2.266-.39.78-.742 1.68-.937 2.734M20.844 14c.078.82.156 1.64.156 2.5 0 .898-.078 1.719-.156 2.5h3.515a8.6 8.6 0 0 0 .391-2.5c0-.86-.156-1.68-.39-2.5zm3.047-1.25a8.88 8.88 0 0 0-5.118-4.531c.82 1.094 1.485 2.695 1.836 4.531zm-12.54 0c.391-1.836 1.016-3.437 1.836-4.531A8.88 8.88 0 0 0 8.07 12.75zM7.602 14a9 9 0 0 0-.351 2.5c0 .898.117 1.719.352 2.5h3.554c-.117-.781-.156-1.602-.156-2.5 0-.86.04-1.68.156-2.5zm11.172 10.82a8.82 8.82 0 0 0 5.118-4.57H20.61c-.351 1.875-1.015 3.438-1.836 4.57m-5.585 0c-.82-1.133-1.446-2.695-1.836-4.57H8.07a8.82 8.82 0 0 0 5.118 4.57M16 26.5c-3.594 0-6.875-1.875-8.672-5-1.797-3.086-1.797-6.875 0-10 1.797-3.086 5.078-5 8.672-5 3.555 0 6.836 1.914 8.633 5 1.797 3.125 1.797 6.914 0 10a9.93 9.93 0 0 1-8.633 5"></path>
              </svg>
              <span>EN</span>
            </button>

            <button type="button" aria-label="Live chat" className={styles.chatBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#E9D5FF" />
                <path d="M12 7l1.2 3.8L17 12l-3.8 1.2L12 17l-1.2-3.8L7 12l3.8-1.2L12 7z" fill="#7E22CE" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dynamic View: Login vs Device Registration */}
        <div className={styles.mainBody}>
          {authStep === 'login' ? (
            <>
              <h1 className={styles.title}>Welcome back</h1>

              {/* Social Login Buttons */}
              <div className={styles.socialGroup}>
                <button type="button" className={styles.socialBtn}>
                  <span className={styles.socialIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" width="20" height="20">
                      <clipPath id="google-clip"><path fill="#fff" d="M0 0h32v32H0z"></path></clipPath>
                      <g clipPath="url(#google-clip)">
                        <path fill="#3E82F1" d="M32 16.375c0-1.097-.1-2.194-.294-3.273H16.325v6.186h8.787a7.34 7.34 0 0 1-3.256 4.829l5.274 4.02C30.22 25.348 32 21.248 32 16.374"></path>
                        <path fill="#32A753" d="M21.858 24.119c-1.458.962-3.33 1.529-5.53 1.529-4.257 0-7.852-2.815-9.136-6.6l-5.458 4.145c2.77 5.404 8.42 8.82 14.593 8.812 4.412 0 8.108-1.43 10.805-3.876z"></path>
                        <path fill="#F9BB00" d="M7.19 12.966 1.735 8.82a15.77 15.77 0 0 0 0 14.377l5.457-4.145a9.35 9.35 0 0 1 0-6.087"></path>
                        <path fill="#E74133" d="M16.327 0C10.154 0 4.503 3.417 1.734 8.82l5.457 4.146c1.284-3.786 4.88-6.6 9.136-6.6 2.394 0 4.55.81 6.237 2.392l4.687-4.595C24.426 1.583 20.73 0 16.327 0"></path>
                      </g>
                    </svg>
                  </span>
                  <span className={styles.socialText}>Log in with Google</span>
                  <span className={styles.socialIcon}></span>
                </button>

                <button type="button" className={styles.socialBtn}>
                  <span className={styles.socialIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" width="20" height="20">
                      <clipPath id="fb-clip"><path fill="#fff" d="M0 0h32v32H0z"></path></clipPath>
                      <g clipPath="url(#fb-clip)">
                        <path fill="#1877F2" fillRule="evenodd" d="M16 32c8.837 0 16-7.163 16-16S24.837 0 16 0 0 7.163 0 16s7.163 16 16 16m2.5-11.249v11.055a16.1 16.1 0 0 1-5 0V20.75H9.438v-4.653H13.5V12.55c0-4.034 2.389-6.263 6.043-6.263 1.751 0 3.582.315 3.582.315v3.961h-2.018c-1.987 0-2.607 1.241-2.607 2.514v3.02h4.438l-.71 4.653z" clipRule="evenodd"></path>
                        <path fill="#fff" d="M18.5 20.751v11.055a16.1 16.1 0 0 1-5 0V20.75H9.438v-4.653H13.5V12.55c0-4.034 2.389-6.263 6.043-6.263 1.751 0 3.582.315 3.582.315v3.961h-2.018c-1.987 0-2.607 1.241-2.607 2.514v3.02h4.438l-.71 4.653z"></path>
                      </g>
                    </svg>
                  </span>
                  <span className={styles.socialText}>Log in with Facebook</span>
                  <span className={styles.socialIcon}></span>
                </button>

                <button type="button" className={styles.socialBtn}>
                  <span className={styles.socialIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 32 32" width="20" height="20">
                      <path d="M22.248 0c.195 1.894-.542 3.749-1.627 5.129-1.125 1.34-2.907 2.405-4.69 2.248-.233-1.815.66-3.746 1.667-4.93C18.721 1.066 20.66.08 22.248 0m-4.184 8.672c1.158-.464 2.59-1.038 4.165-.943 1.006.08 3.904.395 5.76 3.185l-.06.041c-.476.317-3.378 2.248-3.342 6.057.036 4.537 3.678 6.238 4.16 6.463l.053.026-.01.032c-.092.3-.72 2.36-2.153 4.49-1.315 1.97-2.668 3.896-4.833 3.935-1.02.02-1.706-.28-2.422-.592-.75-.326-1.53-.667-2.757-.667-1.286 0-2.104.351-2.891.69-.68.29-1.336.572-2.25.61-2.087.077-3.67-2.087-4.985-4.053-2.707-3.973-4.755-11.21-1.971-16.088C5.88 9.42 8.354 7.887 11.02 7.847c1.164-.022 2.278.426 3.25.816.739.297 1.396.562 1.93.562.485 0 1.118-.254 1.864-.553"></path>
                    </svg>
                  </span>
                  <span className={styles.socialText}>Log in with Apple</span>
                  <span className={styles.socialIcon}></span>
                </button>
              </div>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.line}></div>
                <span className={styles.orText}>or</span>
                <div className={styles.line}></div>
              </div>

              {/* Form with Floating Labels */}
              <form onSubmit={handleSubmit} className={styles.form}>
                
                {/* Email Field */}
                <div className={`${styles.inputGroup} ${errorMsg ? styles.inputGroupError : isEmailFocused ? styles.inputGroupFocused : ''}`}>
                  <label htmlFor="login-email" className={`${styles.label} ${isEmailFloating ? styles.labelFloating : styles.labelCenter}`}>
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    className={`${styles.input} ${isEmailFloating ? styles.inputFloating : ''}`}
                  />
                </div>

                {/* Password Field */}
                <div className={`${styles.inputGroup} ${errorMsg ? styles.inputGroupError : isPasswordFocused ? styles.inputGroupFocused : ''}`}>
                  <label htmlFor="login-password" className={`${styles.label} ${isPasswordFloating ? styles.labelFloating : styles.labelCenter}`}>
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className={`${styles.input} ${isPasswordFloating ? styles.inputFloating : ''}`}
                  />
                </div>
                
                {/* Error Message */}
                {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

                {/* Submit Action */}
                <button type="submit" className={styles.submitBtn}>
                  Log in
                </button>
              </form>

              {/* Sign up Footer Link */}
              <p className={styles.footerText}>
                Don't have an account yet?{' '}
                <a href="#signup" className={styles.footerLink}>
                  Sign up
                </a>
              </p>
            </>
          ) : (
            // --- PENDING REGISTRATION VIEW ---
            <div className={styles.pendingContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.warningIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <h2 className={styles.pendingTitle}>Device Verification Required</h2>
              <p className={styles.pendingDesc}>
                This device is not yet registered to your account. Please send the Installation ID below to the administrator to gain access.
              </p>
              
              <div className={styles.idBox}>
                <span className={styles.idLabel}>Installation ID</span>
                <span className={styles.idValue}>{localDeviceId}</span>
              </div>

              <button 
                type="button" 
                className={styles.submitBtn}
                onClick={() => setAuthStep('login')} // Allows them to check again once you've updated the JSON
              >
                I have sent it, check again
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};