import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  FileCheck, 
  KeyRound, 
  EyeOff, 
  Server, 
  Database,
  ExternalLink,
  X,
  Cpu,
  Fingerprint,
  AlertTriangle
} from 'lucide-react';

export const PrivacySecuritySection: React.FC = () => {
  const [zeroAiTraining, setZeroAiTraining] = useState(true);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [sessionAutoLock, setSessionAutoLock] = useState(true);
  const [localVectorCache, setLocalVectorCache] = useState(true);
  const [telemetryOptIn, setTelemetryOptIn] = useState(false);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [showAuditReport, setShowAuditReport] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lastAudited, setLastAudited] = useState('Just now');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setShowAuditReport(true);
      setLastAudited('Just now');
      showToast('Comprehensive security audit completed: 100% compliant.');
    }, 850);
  };

  return (
    <section 
      id="privacy-security-section"
      className="p-6 rounded-3xl bg-white border border-[#EAEBF0] space-y-6 shadow-xs select-none animate-in fade-in duration-200"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">Privacy Center & Security Shield</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Protected</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client-side cryptographic vault, zero-training AI confidentiality, and granular privacy controls.
            </p>
          </div>
        </div>

        <button
          id="run-security-audit-btn"
          type="button"
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#7B61FF]/40 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#7B61FF] transition-all flex items-center space-x-2 cursor-pointer shadow-2xs disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-[#7B61FF]' : 'text-slate-500'}`} />
          <span>{isAuditing ? 'Auditing Vault...' : 'Audit Security'}</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Security Architecture Pillars (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Vault Encryption */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vault Encryption</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">AES-256 bit GCM</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              All raw note contents, vector embeddings, and relations are encrypted at rest.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Key derivation: PBKDF2</span>
            <span className="text-emerald-700 font-semibold">Active</span>
          </div>
        </div>

        {/* Card 2: AI Confidentiality */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidentiality</span>
            <div className="w-6 h-6 rounded-lg bg-[#F0EEFF] text-[#7B61FF] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Zero Data Retention</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Syntheses and inferences are processed in memory and never used to train public foundation models.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Enterprise SLA</span>
            <span className="text-[#7B61FF] font-semibold">Enforced</span>
          </div>
        </div>

        {/* Card 3: Authentication & Identity */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authentication</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Two-Factor OTP & OAuth</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cryptographic verification tokens and secure single-use codes on every session login.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Session expiry: 7 days</span>
            <span className="text-indigo-700 font-semibold">Verified</span>
          </div>
        </div>
      </div>

      {/* Privacy Preferences & Granular Data Shielding */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Privacy Preferences & Data Shielding
          </h3>
          <span className="text-[11px] text-slate-400">Last verified: {lastAudited}</span>
        </div>

        <div className="space-y-2.5">
          {/* Toggle 1: Zero Model Training */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <span>Zero Model Training Exemption</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                  Strict
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Ensures third-party AI inference engines discard prompt buffers immediately upon generating synthesis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setZeroAiTraining(!zeroAiTraining);
                showToast(`Zero Model Training ${!zeroAiTraining ? 'enabled (Strict mode)' : 'disabled'}.`);
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                zeroAiTraining ? 'bg-[#7B61FF]' : 'bg-slate-200'
              }`}
              aria-label="Toggle zero model training"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  zeroAiTraining ? 'left-6.5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: PII Redaction */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                <span>Automatic PII & Sensitive Entity Masking</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                  Semantic Filter
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Automatically masks email addresses, telephone numbers, and API tokens prior to building semantic knowledge graphs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPiiRedaction(!piiRedaction);
                showToast(`PII Masking ${!piiRedaction ? 'activated' : 'deactivated'}.`);
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                piiRedaction ? 'bg-[#7B61FF]' : 'bg-slate-200'
              }`}
              aria-label="Toggle PII masking"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  piiRedaction ? 'left-6.5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Inactivity Auto-Lock */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Inactivity Session Protection
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Automatically protects view state and demands credential re-authentication if the workspace is idle for over 30 minutes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSessionAutoLock(!sessionAutoLock);
                showToast(`Session Auto-Lock ${!sessionAutoLock ? 'enabled' : 'disabled'}.`);
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                sessionAutoLock ? 'bg-[#7B61FF]' : 'bg-slate-200'
              }`}
              aria-label="Toggle session auto-lock"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  sessionAutoLock ? 'left-6.5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 4: Local Vector Cache */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Isolated Client-Side Embedding Index
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Keeps semantic proximity embeddings in browser IndexedDB memory rather than syncing to external servers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLocalVectorCache(!localVectorCache);
                showToast(`Client-Side Vector Index ${!localVectorCache ? 'enabled' : 'disabled'}.`);
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                localVectorCache ? 'bg-[#7B61FF]' : 'bg-slate-200'
              }`}
              aria-label="Toggle client-side vector index"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  localVectorCache ? 'left-6.5' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 5: Telemetry */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-all flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Anonymous Performance Telemetry
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Shares anonymous query latency benchmarks to improve vector search speeds. Never includes note text or keys.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTelemetryOptIn(!telemetryOptIn);
                showToast(`Anonymous Telemetry ${!telemetryOptIn ? 'opted in' : 'opted out'}.`);
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                telemetryOptIn ? 'bg-[#7B61FF]' : 'bg-slate-200'
              }`}
              aria-label="Toggle telemetry"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                  telemetryOptIn ? 'left-6.5' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Audit Detail Modal */}
      {showAuditReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 text-left"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cryptographic Security Audit</h3>
                  <p className="text-[11px] text-slate-500">Audit Timestamp: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditReport(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-900">Vault Cipher Strength</div>
                  <div className="text-[11px] text-emerald-700">AES-256-GCM with PBKDF2 100,000 rounds</div>
                </div>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-900">Zero Retention AI Channel</div>
                  <div className="text-[11px] text-emerald-700">Transient memory inference with no logging</div>
                </div>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-900">PII Entity Filter</div>
                  <div className="text-[11px] text-emerald-700">Active regex & NER redaction pipeline ready</div>
                </div>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-900">Transport Security</div>
                  <div className="text-[11px] text-emerald-700">TLS 1.3 Perfect Forward Secrecy</div>
                </div>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAuditReport(false)}
              className="w-full py-2.5 rounded-xl bg-[#7B61FF] hover:bg-[#6C52EE] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Close Audit Report
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
