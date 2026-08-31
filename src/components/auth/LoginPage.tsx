import React, { useState } from 'react';
import { Mail, User, ArrowRight, AlertCircle, X, Shield, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { GoogleAccountPickerModal } from './GoogleAccountPickerModal';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginWithGoogle, loginWithEmail } = useKnowledge();

  const [mode, setMode] = useState<'idle' | 'email-signin' | 'create-account'>('idle');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [showGooglePicker, setShowGooglePicker] = useState(false);

  // Verification step state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // Validate email format
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleGoogleSignInClick = () => {
    setErrorMessage(null);
    setShowGooglePicker(true);
  };

  const handleGoogleAccountSelected = async (account: { name: string; email: string; avatarUrl?: string }) => {
    setShowGooglePicker(false);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle(account.email, account.name);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage('Failed to verify and sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }
    if (mode === 'create-account' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (password.length > 0 && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setIsVerifying(true);
      setSuccessMessage(`Verification code sent to ${email.trim()}`);
    } catch (err: any) {
      setErrorMessage('Unable to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const entered = verificationCode.trim();
    if (!entered) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    // Verify against generated code or default testing code
    if (entered !== generatedCode && entered !== '123456') {
      setErrorMessage('Invalid verification code. Please check and re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await loginWithEmail(email.trim(), name.trim() || undefined);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationCode('');
    setErrorMessage(null);
    setSuccessMessage(`New code sent to ${email.trim()}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9FF] relative overflow-hidden flex flex-col justify-between items-center px-4 py-8 sm:py-12 select-none">
      {/* Ambient Background Glows & Organic Flow Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Violet Top-Left Ambient Orb */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#E0D7FE] via-[#DDD6FE] to-[#F3E8FF] opacity-60 blur-3xl" />
        
        {/* Sky-Blue Right Side Ambient Orb */}
        <div className="absolute top-1/4 -right-24 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-[#DBEAFE] via-[#E0E7FF] to-[#EDE9FE] opacity-70 blur-3xl" />
        
        {/* Bottom Left Pastel Glow */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#DDD6FE] to-[#F5F3FF] opacity-50 blur-3xl" />

        {/* Delicate Organic Contour Lines / Flow Lines (as seen on left/right background in mockup) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 text-[#7B61FF]/10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <path
            d="M-100 200 C 150 120, 100 450, -50 700"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M-60 220 C 190 140, 140 480, -10 730"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M-20 240 C 230 160, 180 510, 30 760"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M1100 150 C 850 250, 900 600, 1050 850"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M1140 180 C 890 280, 940 630, 1090 880"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M1180 210 C 930 310, 980 660, 1130 910"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Central Login Card Container */}
      <main className="w-full max-w-md my-auto z-10 flex flex-col items-center text-center">
        {/* 🌟 3D Glossy "N" App Logo */}
        <div className="relative mb-3 flex items-center justify-center">
          {/* Radial Ambient Backlight */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-[#C084FC] via-[#818CF8] to-[#38BDF8] opacity-35 blur-xl animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl transition-transform hover:scale-105 duration-300">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Left Stem Gradient */}
                <linearGradient id="nuvora_left_stem" x1="20" y1="90" x2="40" y2="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="60%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#DDD6FE" />
                </linearGradient>

                {/* Diagonal Crossing Ribbon Gradient */}
                <linearGradient id="nuvora_diagonal" x1="25" y1="15" x2="75" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="35%" stopColor="#818CF8" />
                  <stop offset="70%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>

                {/* Right Stem Gradient */}
                <linearGradient id="nuvora_right_stem" x1="60" y1="90" x2="80" y2="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>

                {/* 3D Gloss Highlight Gradient */}
                <linearGradient id="nuvora_gloss" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Left Pillar */}
              <rect
                x="18"
                y="14"
                width="19"
                height="72"
                rx="9.5"
                fill="url(#nuvora_left_stem)"
              />

              {/* Diagonal Ribbon Bar */}
              <path
                d="M 27 18 C 34 18, 38 23, 73 78 C 77 84, 82 86, 82 86 L 73 86 C 66 86, 62 81, 27 26 C 23 20, 18 18, 18 18 Z"
                fill="url(#nuvora_diagonal)"
              />

              {/* Right Pillar */}
              <rect
                x="63"
                y="14"
                width="19"
                height="72"
                rx="9.5"
                fill="url(#nuvora_right_stem)"
              />

              {/* Soft Ambient Gloss Overlay */}
              <rect
                x="18"
                y="14"
                width="19"
                height="36"
                rx="9.5"
                fill="url(#nuvora_gloss)"
              />
              <rect
                x="63"
                y="14"
                width="19"
                height="36"
                rx="9.5"
                fill="url(#nuvora_gloss)"
              />
            </svg>
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B0F19]">
          Nuvora
        </h1>

        {/* Hero Tagline */}
        <div className="mt-5 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Your knowledge.
          </h2>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#6366F1] via-[#7B61FF] to-[#4F46E5] bg-clip-text text-transparent">
            Organized. Connected. Alive.
          </h2>
        </div>

        {/* Description Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 max-w-xs sm:max-w-sm mt-3 leading-relaxed font-normal">
          Capture everything, understand it, connect it, and turn it into useful output.
        </p>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="w-full mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success / Info Alert */}
        {successMessage && !errorMessage && (
          <div className="w-full mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 text-left animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons / Interactive Modes */}
        <div className="w-full mt-7 space-y-3">
          {isVerifying ? (
            /* 2-Factor / Email Code Verification Card */
            <form
              onSubmit={handleVerifyCodeSubmit}
              className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-lg text-left animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F0EEFF] text-[#7B61FF] flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Verify Your Account</h3>
                    <p className="text-[11px] text-slate-500">Enter 6-digit confirmation code</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">{email}</span>
                </div>
                {generatedCode && (
                  <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Security OTP Code:</span>
                    <span className="font-mono font-bold text-[#7B61FF] bg-white px-2 py-0.5 rounded border border-[#7B61FF]/30 tracking-widest">
                      {generatedCode}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-[0.35em] text-lg font-mono px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#5468FF] hover:from-[#5E4CE0] hover:to-[#465AE8] text-white font-semibold text-sm shadow-md shadow-[#6C5CE7]/30 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[#6366F1] font-semibold hover:underline"
                >
                  Resend code
                </button>
              </div>
            </form>
          ) : mode === 'idle' ? (
            <>
              {/* 1. Continue with Email (Primary Gradient Button) */}
              <button
                type="button"
                onClick={() => {
                  setMode('email-signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6C5CE7] via-[#6366F1] to-[#5468FF] hover:from-[#5E4CE0] hover:to-[#465AE8] text-white font-semibold text-sm sm:text-base shadow-md shadow-[#6C5CE7]/30 hover:shadow-lg hover:shadow-[#6C5CE7]/40 active:scale-[0.99] transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-70"
              >
                <Mail className="w-5 h-5 text-white stroke-[2.2]" />
                <span>Continue with Email</span>
              </button>

              {/* 2. Continue with Google (Secondary White Button with Google G Icon) */}
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50/90 text-slate-800 font-semibold text-sm sm:text-base border border-[#E2E8F0] shadow-xs active:scale-[0.99] transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-70"
              >
                {/* Official 4-color Google G Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider with "or" */}
              <div className="relative py-1 flex items-center justify-center">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-[#FAF9FF] px-3 text-xs text-slate-400 font-medium">
                  or
                </span>
              </div>

              {/* 3. Create an account (Tertiary Outlined Button with User Icon) */}
              <button
                type="button"
                onClick={() => {
                  setMode('create-account');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-white/70 hover:bg-white text-slate-800 font-semibold text-sm sm:text-base border border-[#E2E8F0] shadow-xs active:scale-[0.99] transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-70 backdrop-blur-xs"
              >
                <User className="w-5 h-5 text-slate-700 stroke-[2]" />
                <span>Create an account</span>
              </button>
            </>
          ) : (
            /* Interactive Email Login / Sign Up Form */
            <form onSubmit={handleEmailSubmit} className="space-y-3 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-md text-left animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F0EEFF] text-[#7B61FF] flex items-center justify-center">
                    {mode === 'create-account' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {mode === 'create-account' ? 'Create your Nuvora account' : 'Sign in with Email'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('idle')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {mode === 'create-account' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  {mode === 'email-signin' && (
                    <span className="text-[11px] text-[#7B61FF] hover:underline cursor-pointer">
                      Forgot?
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#5468FF] text-white font-semibold text-sm shadow-md shadow-[#6C5CE7]/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'create-account' ? 'Create Account & Enter' : 'Sign in to Nuvora'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'create-account' ? 'email-signin' : 'create-account')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  {mode === 'create-account' ? (
                    <>Already have an account? <span className="text-[#6366F1] font-semibold">Sign in</span></>
                  ) : (
                    <>Don't have an account? <span className="text-[#6366F1] font-semibold">Sign up</span></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Already have an account / Sign in toggle link */}
          {mode === 'idle' && (
            <div className="pt-2 text-center">
              <span className="text-xs sm:text-sm text-slate-600 font-normal">
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => setMode('email-signin')}
                className="text-xs sm:text-sm text-[#6366F1] font-semibold hover:text-[#4F46E5] hover:underline transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Legal Footer */}
      <footer className="w-full max-w-md text-center z-10 pt-6">
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
          By continuing, you agree to Nuvora's{' '}
          <button
            onClick={() => setShowLegalModal('terms')}
            className="text-[#6366F1] hover:underline font-medium cursor-pointer"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            onClick={() => setShowLegalModal('privacy')}
            className="text-[#6366F1] hover:underline font-medium cursor-pointer"
          >
            Privacy Policy
          </button>
          .
        </p>
      </footer>

      {/* Modal for Terms of Service & Privacy Policy */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#7B61FF]" />
                <h3 className="text-base font-bold text-slate-900">
                  {showLegalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </h3>
              </div>
              <button
                onClick={() => setShowLegalModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3">
              {showLegalModal === 'terms' ? (
                <>
                  <p>
                    <strong>1. Acceptance of Terms:</strong> By accessing and using Nuvora, you agree to comply with and be bound by these Terms of Service.
                  </p>
                  <p>
                    <strong>2. Knowledge Ownership:</strong> All notes, ideas, documents, audio captures, synthesis outputs, and project links remain 100% your private intellectual property.
                  </p>
                  <p>
                    <strong>3. AI Augmentation:</strong> Nuvora uses advanced language models for semantic comprehension and auto-tagging. Your data is processed securely and is never used to train generalized third-party foundation models without explicit consent.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Privacy First:</strong> Nuvora is designed for personal knowledge synthesis. We never sell your personal captures, transcripts, or notes to advertisers.
                  </p>
                  <p>
                    <strong>2. Local & Cloud Storage:</strong> Your data is protected using high-grade encryption both in transit and at rest.
                  </p>
                  <p>
                    <strong>3. Account Controls:</strong> You retain full rights to export your complete knowledge graph as JSON at any time or delete your account with zero residue.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLegalModal(null)}
                className="px-4 py-2 rounded-xl bg-[#0B0F19] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account Selector Dialog */}
      <GoogleAccountPickerModal
        isOpen={showGooglePicker}
        onClose={() => setShowGooglePicker(false)}
        onSelectAccount={handleGoogleAccountSelected}
      />
    </div>
  );
};
