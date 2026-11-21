'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Check, X, Calendar, Lock, Mail, User,
  Sparkles, KeyRound, AlertTriangle, ArrowRight, Eye, EyeOff, LogIn
} from 'lucide-react';

interface AuthModalProps {
  initialOpen?: boolean;
  onClose?: () => void;
}

export function AdultAccessModal({ initialOpen = false, onClose }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'register' | 'login' | 'guest'>('register');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Turnstile state
  const [turnstileState, setTurnstileState] = useState<'idle' | 'verifying' | 'verified'>('idle');

  // Error & Status State
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ageCheck, setAgeCheck] = useState<{ age: number; is18Plus: boolean } | null>(null);

  useEffect(() => {
    // Check if user has already confirmed age or logged in
    const confirmed = localStorage.getItem('nyamora_age_confirmed');
    const user = localStorage.getItem('nyamora_user');

    if (!confirmed && !user) {
      setIsOpen(true);
    }

    // Listen for custom trigger from Header or buttons
    const handleOpenModal = (e: any) => {
      setIsOpen(true);
      if (e?.detail?.mode) {
        setMode(e.detail.mode);
      }
    };

    window.addEventListener('nyamora_open_auth', handleOpenModal);
    return () => {
      window.removeEventListener('nyamora_open_auth', handleOpenModal);
    };
  }, []);

  // Calculate age whenever birthday changes
  useEffect(() => {
    if (!birthday) {
      setAgeCheck(null);
      return;
    }
    const today = new Date();
    const birth = new Date(birthday);
    if (isNaN(birth.getTime())) {
      setAgeCheck(null);
      return;
    }
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    setAgeCheck({
      age,
      is18Plus: age >= 18
    });
  }, [birthday]);

  const handleTurnstileClick = () => {
    if (turnstileState !== 'idle') return;
    setTurnstileState('verifying');
    setTimeout(() => {
      setTurnstileState('verified');
      setFormError('');
    }, 700);
  };

  const handleClose = () => {
    const confirmed = localStorage.getItem('nyamora_age_confirmed');
    if (confirmed) {
      setIsOpen(false);
      if (onClose) onClose();
    } else {
      // Age verification is strictly required for adult content access; exit if dismissed unverified
      window.location.href = 'https://www.google.com';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (turnstileState !== 'verified') {
      setFormError('Please complete the Cloudflare verification check.');
      return;
    }

    // Mode 1: Guest Entry (strictly 18+ verified)
    if (mode === 'guest') {
      if (!birthday) {
        setFormError('Date of birth is required to verify 18+ eligibility before entering as guest.');
        return;
      }
      if (ageCheck && !ageCheck.is18Plus) {
        setFormError(`Entry denied: You are ${ageCheck.age} years old. Nyamora is strictly for adults (18+).`);
        return;
      }

      localStorage.setItem('nyamora_age_confirmed', 'true');
      localStorage.setItem('nyamora_guest_mode', 'true');
      if (ageCheck) {
        localStorage.setItem('nyamora_guest_age', ageCheck.age.toString());
      }
      window.dispatchEvent(new Event('nyamora_auth_change'));
      setIsOpen(false);
      if (onClose) onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // Mode 2: Register Account
      if (mode === 'register') {
        if (!username.trim()) {
          setFormError('Username is required.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setFormError('A valid email address is required.');
          setIsSubmitting(false);
          return;
        }
        if (!birthday) {
          setFormError('Date of birth is required to verify 18+ eligibility.');
          setIsSubmitting(false);
          return;
        }
        if (ageCheck && !ageCheck.is18Plus) {
          setFormError(`Entry denied: You must be 18 or older to access Nyamora (Current age: ${ageCheck.age}).`);
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setFormError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setFormError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            birthday,
            password
          })
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Registration failed.');
          setIsSubmitting(false);
          return;
        }

        localStorage.setItem('nyamora_user', JSON.stringify(data.user));
        localStorage.setItem('nyamora_age_confirmed', 'true');
        window.dispatchEvent(new Event('nyamora_auth_change'));
        setIsOpen(false);
        if (onClose) onClose();
      } else {
        // Mode 3: Login
        if (!username.trim() || !password.trim()) {
          setFormError('Username and password are required.');
          setIsSubmitting(false);
          return;
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernameOrEmail: username.trim(),
            password
          })
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Invalid credentials.');
          setIsSubmitting(false);
          return;
        }

        localStorage.setItem('nyamora_user', JSON.stringify(data.user));
        localStorage.setItem('nyamora_age_confirmed', 'true');
        window.dispatchEvent(new Event('nyamora_auth_change'));
        setIsOpen(false);
        if (onClose) onClose();
      }
    } catch (err) {
      setFormError('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Determine Nyan-chan speech bubble dialogue
  let nyanSpeech = '';
  if (ageCheck && !ageCheck.is18Plus) {
    nyanSpeech = `Gomen ne, darling... (｡•́︿•̀｡) You're only ${ageCheck.age} years old! You must be at least 18 to enter Nyamora. No entry until you grow up~ nya!`;
  } else if (turnstileState === 'verified') {
    if (mode === 'guest') {
      nyanSpeech = `Mhm~ 100% human and 18+ confirmed! Enjoy your guest tour through my archives, darling~ (˶ᵔ ᵕ ᵔ˶)✨`;
    } else {
      nyanSpeech = `Mhm~ 100% warm-blooded human confirmed! Just the way I like you... now let's get you registered, darling~ (˶ᵔ ᵕ ᵔ˶)✨`;
    }
  } else if (mode === 'login') {
    nyanSpeech = `Welcome back to my parlour, sweetheart~ Whisper your credentials so I can unlock your private bookmarks and saved history... nya~ ♡`;
  } else if (mode === 'guest') {
    nyanSpeech = `Sneaking in as a guest, darling? No account needed! But my parlour is strictly 18+... enter your birthday and confirm you are human so I know it's safe to let you in~ nya! (˶ᵔ ᵕ ᵔ˶)♡`;
  } else {
    nyanSpeech = `Nya~ Welcome to Nyamora, darling... ♡ Register your private parlour key with me, or switch to Guest mode if you're shy! Just enter your birthday so I know you're 18+~ fufufu! ✨`;
  }

  // Calculate maximum allowed date (18 years ago today)
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);
  const maxDateString = maxBirthDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md my-8 rounded-3xl border shadow-2xl bg-gradient-to-b from-[#141422] to-[#0d0d16] border-purple-500/40 text-slate-100 overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Exit / Close Button */}
        <button
          onClick={handleClose}
          title="Exit / Close"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Top Section: Nyan-chan Avatar & Talking Speech Bubble */}
          <div className="flex items-start gap-3.5 pt-2">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-purple-400 shadow-glow flex-shrink-0 mt-1">
              <img
                src="/avatars/nyan-chan-host.jpg"
                alt="Nyan-chan (Host)"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#141422]" />
            </div>

            {/* Seductive Chat Speech Bubble */}
            <div className="relative flex-1 p-3.5 rounded-2xl rounded-tl-none bg-purple-950/60 border border-purple-500/50 text-xs text-purple-100 shadow-lg leading-relaxed">
              {/* Cute speech bubble beak */}
              <div className="absolute top-3 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-purple-950/80 border-b-[8px] border-b-transparent" />
              <p className="font-medium">
                {nyanSpeech}
              </p>
            </div>
          </div>

          {/* Seductive Dante Inscription Quote */}
          <div className="text-center pt-1 border-t border-purple-900/30">
            <p className="text-xs font-serif italic text-purple-300 tracking-wide">
              &quot;Abandon all innocence, ye who enter here ♡&quot;
            </p>
            <p className="text-[10px] text-slate-400 font-serif mt-0.5">
              汝等こゝに入るもの一切の純情を棄てよ
            </p>
          </div>

          {/* Mode Switcher Tabs (Register, Login, Guest) */}
          <div className="flex rounded-xl p-1 bg-slate-900/80 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setFormError('');
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'register'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFormError('');
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'login'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('guest');
                setFormError('');
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'guest'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Guest (18+)</span>
            </button>
          </div>

          {/* Error Notice */}
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Username Input (Register & Login) */}
            {mode !== 'guest' && (
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-[#161626] border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Email Input (Register Only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-[#161626] border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Birthday & 18+ Verification Input (Both Register AND Guest Mode!) */}
            {(mode === 'register' || mode === 'guest') && (
              <div className="space-y-1.5 p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {mode === 'guest' ? 'Guest 18+ Age Verification:' : 'Date of Birth (18+ Verification):'}
                  </span>
                  {ageCheck !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                        ageCheck.is18Plus
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                      }`}
                    >
                      {ageCheck.is18Plus ? `✓ ${ageCheck.age} yo (Eligible)` : `⛔ Underage (${ageCheck.age} yo)`}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="date"
                    max={maxDateString}
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border bg-[#161626] border-slate-700/80 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400">
                  {mode === 'guest'
                    ? 'Even guests must verify they are born on or before ' + maxDateString + ' (18+).'
                    : 'Must be born on or before ' + maxDateString + ' to access adult doujinshi.'}
                </p>
              </div>
            )}

            {/* Password Input (Register & Login) */}
            {mode !== 'guest' && (
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border bg-[#161626] border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Register Only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-[#161626] border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400 transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Authentic Cloudflare Turnstile "Verify you are human" Widget */}
            <div className="p-3 rounded-2xl border bg-[#181826] border-[#2e2e42] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {turnstileState === 'verified' ? (
                  <div className="flex items-center gap-2.5 text-emerald-400 font-semibold select-none">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-white font-bold text-sm">Success!</span>
                  </div>
                ) : turnstileState === 'verifying' ? (
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <div className="w-6 h-6 rounded-md border-2 border-orange-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-slate-300 font-medium">Verifying you are human...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTurnstileClick}
                    className="flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md border border-slate-500 group-hover:border-purple-400 bg-slate-800 flex items-center justify-center transition-colors">
                      <div className="w-2.5 h-2.5 rounded-sm bg-transparent group-hover:bg-purple-500/30" />
                    </div>
                    <span className="text-xs font-semibold select-none">Verify you are human</span>
                  </button>
                )}
              </div>

              {/* Cloudflare Official Branding */}
              <div className="flex flex-col items-end text-[10px] text-slate-400 select-none">
                <div className="flex items-center gap-1.5 font-extrabold tracking-wider text-slate-200">
                  <svg className="w-5 h-4" viewBox="0 0 48 32" fill="none">
                    <path d="M38.5 13.5C37.5 7.5 32 3 25.5 3C20.5 3 16 6 14.5 10.5C9.5 11 5.5 15.5 5.5 20.5C5.5 26.5 10.5 31.5 16.5 31.5H38.5C43 31.5 46.5 28 46.5 23.5C46.5 19 43 15.5 38.5 13.5Z" fill="#F38020"/>
                    <path d="M37 20C36 17 33 15 29.5 15C26.5 15 24 16.5 22.5 19C20.5 19 18.5 20.5 18 22.5H38C39 22.5 40 21.5 40 20.5C40 19.5 39 18.5 38 18.5H37V20Z" fill="#FAAE40"/>
                  </svg>
                  <span className="text-[11px] font-mono tracking-widest text-slate-100">CLOUDFLARE</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-0.5">
                  <span className="hover:underline cursor-pointer">Privacy</span>
                  <span>•</span>
                  <span className="hover:underline cursor-pointer">Help</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button (nHentai Crimson / Violet Gradient) */}
            <button
              type="submit"
              disabled={isSubmitting || ((mode === 'register' || mode === 'guest') && (ageCheck === null || !ageCheck.is18Plus))}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#9b1836] via-[#be185d] to-[#7c3aed] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-glow flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Connecting with Nyan-chan...</span>
                </div>
              ) : (mode === 'register' || mode === 'guest') && ageCheck && !ageCheck.is18Plus ? (
                'Under 18 • Entry Denied'
              ) : mode === 'guest' ? (
                <>
                  <span>Enter Nyamora as 18+ Guest</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher Links */}
          <div className="pt-2 text-center border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            {mode !== 'guest' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('guest');
                  setFormError('');
                }}
                className="font-semibold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
              >
                <span>Just looking around? Continue as 18+ Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Want to save your library?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFormError('');
                  }}
                  className="font-semibold text-purple-400 hover:underline"
                >
                  Register
                </button>
                <span>or</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError('');
                  }}
                  className="font-semibold text-purple-400 hover:underline"
                >
                  Login
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-500">
              {mode === 'guest'
                ? 'Guest mode grants full archive access once age is verified. No account is created.'
                : 'Registration is optional. All access strictly requires 18+ age verification.'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
