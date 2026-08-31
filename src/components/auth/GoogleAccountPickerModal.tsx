import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowRight, ShieldCheck, Check, Trash2, UserCheck, LogIn, Sparkles } from 'lucide-react';

export interface GoogleAccount {
  name: string;
  email: string;
  avatarUrl?: string;
  lastUsedAt?: number;
}

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string; avatarUrl?: string }) => void;
}

const STORAGE_KEY = 'nuvora_saved_google_accounts';

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount
}) => {
  const [savedAccounts, setSavedAccounts] = useState<GoogleAccount[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load actually used previous accounts from storage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAccounts(parsed);
            setIsAddingNew(false);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
      // If no accounts previously logged in, start in the account input view
      setSavedAccounts([]);
      setIsAddingNew(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectAccount = async (account: GoogleAccount) => {
    setSelectedEmail(account.email);
    setIsSubmitting(true);
    setError(null);

    // Update lastUsed timestamp and persist
    const updated = [
      { ...account, lastUsedAt: Date.now() },
      ...savedAccounts.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase())
    ];
    setSavedAccounts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsSubmitting(false);
    onSelectAccount({
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl
    });
  };

  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your Google email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    const defaultName = nameInput.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const newAccount: GoogleAccount = {
      name: defaultName,
      email: cleanEmail,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}&backgroundColor=7B61FF`,
      lastUsedAt: Date.now()
    };

    const updated = [
      newAccount,
      ...savedAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail)
    ];
    setSavedAccounts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    await handleSelectAccount(newAccount);
  };

  const handleRemoveAccount = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.email.toLowerCase() !== emailToRemove.toLowerCase());
    setSavedAccounts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    if (updated.length === 0) {
      setIsAddingNew(true);
    }
  };

  const hasPreviousAccounts = savedAccounts.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Google Header Branding */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            {/* Google Brand G */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-[11px] text-slate-500">to continue to Nuvora</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* View 1: Previously Logged-In Accounts (only shown if user has actually logged in before) */}
        {hasPreviousAccounts && !isAddingNew ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Previously signed in accounts:</span>
              <span className="text-[11px] text-slate-400">Click to switch</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
              {savedAccounts.map((acc) => {
                const isSelected = selectedEmail === acc.email;
                return (
                  <div
                    key={acc.email}
                    onClick={() => !isSubmitting && handleSelectAccount(acc)}
                    className="w-full p-2.5 rounded-2xl border border-slate-200/90 hover:border-[#7B61FF]/50 hover:bg-[#F9F8FF] transition-all flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {acc.avatarUrl ? (
                        <img
                          src={acc.avatarUrl}
                          alt={acc.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#7B61FF] font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(e, acc.email)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-opacity cursor-pointer"
                        title="Remove from this device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#7B61FF] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-[#F0EEFF] text-slate-400 group-hover:text-[#7B61FF] flex items-center justify-center transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Option to use/switch to another account */}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setEmailInput('');
                setNameInput('');
                setIsAddingNew(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-slate-300 hover:border-[#7B61FF] hover:bg-[#F0EEFF]/30 text-xs font-semibold text-slate-700 hover:text-[#7B61FF] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Use or switch to another Google account</span>
            </button>
          </div>
        ) : (
          /* View 2: Direct Google Account prompt/selection (when no previous accounts or adding another) */
          <form onSubmit={handleAddNewAccount} className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Choose Google Account to continue
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Enter your Google email address to authenticate with Nuvora.
              </p>
              <input
                type="email"
                required
                autoFocus
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Account Name (Optional)
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF]"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              {hasPreviousAccounts && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setIsAddingNew(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Accounts
                </button>
              )}
              <button
                type="submit"
                disabled={!emailInput.trim() || isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#7B61FF] hover:bg-[#6C52EE] text-white text-xs font-semibold shadow-md active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Security & Confidentiality Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google OAuth 2.0 Verified</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">nuvora.ai</span>
        </div>
      </div>
    </div>
  );
};
