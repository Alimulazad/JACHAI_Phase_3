import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { X, Lock, Phone, User, School, CheckCircle2, AlertCircle, LogIn, UserPlus, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { UniversityUnit, User as UserType, UserProgress } from '../types';
import { UNIVERSITIES_DATA } from '../data/admissionData';
import { loginUserApi, registerUserApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType, progress: UserProgress) => void;
  initialMode?: 'login' | 'register';
}

const NAVY = '#0A2540';
const ORANGE = '#FF6B00';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4c-2 1.4-4.6 2.3-7.7 2.3-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.8 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.6 5.4C39.9 37 44 31.5 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"
      />
    </svg>
  );
}

// Custom PrepTest Logo with Brain & Checkmark Emblem
function PrepTestLogo() {
  const words = ['টেস্ট', 'দাও', 'বেস্ট', 'হও'];
  return (
    <div className="flex flex-col items-center justify-center select-none text-center">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-[#0A2540] flex items-center justify-center text-white p-1.5 shadow-md shadow-slate-900/10 border border-slate-700/30">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" opacity="0.2" />
            <path
              d="M20 34c2-6 8-10 15-10 8 0 14 5 14 12 0 6-4 10-9 12M24 26c0-4 4-8 9-8"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M18 32l10 10 22-22"
              stroke="#FF6B00"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-2xl font-black tracking-tight text-[#0A2540]">
          Prep<span className="text-[#FF6B00]">Test</span>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs font-extrabold text-[#0A2540]">
        {words.map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
            className="inline-block"
          >
            {w}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// Floating Field Component with Mobile Keyboard Scroll Guard
interface FloatingFieldProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

const FloatingField: React.FC<FloatingFieldProps> = ({
  id,
  type,
  label,
  value,
  onChange,
  icon: Icon,
  required,
  placeholder = '',
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFloating = isFocused || value.length > 0;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Smooth scroll into view on mobile so virtual keyboard doesn't hide input
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  return (
    <div ref={containerRef} className="relative pt-1.5">
      <div
        className={`relative flex items-center rounded-2xl border transition-all duration-200 bg-white ${
          isFocused
            ? 'border-[#FF6B00] ring-3 ring-[#FF6B00]/15 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="absolute left-3.5 pointer-events-none z-10 transition-colors">
          <Icon className={`w-4 h-4 ${isFocused ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
        </div>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          required={required}
          placeholder={isFocused ? placeholder : ''}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-3.5 py-3 rounded-2xl border-none outline-none text-base sm:text-sm font-semibold text-[#0A2540] bg-transparent transition-all"
        />

        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            y: isFloating ? -24 : 0,
            scale: isFloating ? 0.82 : 1,
            x: isFloating ? -8 : 0,
            color: isFocused ? '#FF6B00' : isFloating ? '#0A2540' : '#8592A6',
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute left-10 pointer-events-none text-xs sm:text-sm origin-left z-10 select-none bg-white px-1 font-bold rounded-sm"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </motion.label>
      </div>
    </div>
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('ঢাকা কলেজ');
  const [examYear, setExamYear] = useState('HSC-26');
  const [targetUni, setTargetUni] = useState<UniversityUnit>('du_a');
  const [avatarColor, setAvatarColor] = useState('#0A2540');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const cardContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const colorPresets = ['#0A2540', '#FF6B00', '#059669', '#E11D48', '#7C3AED', '#0F766E'];
  const batches = ['HSC-25', 'HSC-26', 'HSC-27', '2nd Timer'];

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setShakeTrigger((prev) => prev + 1);
  };

  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    setErrorMessage(null);
    setSuccessMessage(`${provider} অ্যাকাউন্ট ইন্টিগ্রেট করা হচ্ছে...`);
    setIsLoading(true);

    // Auto demo login with social credential
    setTimeout(async () => {
      try {
        const demoPhone = provider === 'Google' ? '01700000000' : '01800000000';
        const res = await loginUserApi({ phone: demoPhone, password: 'password123' }).catch(() => null);
        
        if (res) {
          setSuccessMessage(`${provider} এর মাধ্যমে সফলভাবে সাইন-ইন করা হয়েছে!`);
          setTimeout(() => {
            onSuccess(res.user, res.progress);
            onClose();
          }, 400);
        } else {
          // Register user on the fly
          const regRes = await registerUserApi({
            phone: demoPhone,
            password: 'password123',
            name: `${provider} ইউজার`,
            college: 'ঢাকা কলেজ',
            examYear: 'HSC-26',
            targetUniversity: 'du_a',
            avatarBgColor: provider === 'Google' ? '#FF6B00' : '#1877F2',
          });
          setSuccessMessage(`${provider} দিয়ে অ্যাকাউন্ট তৈরি সফল হয়েছে!`);
          setTimeout(() => {
            onSuccess(regRes.user, regRes.progress);
            onClose();
          }, 500);
        }
      } catch (err: any) {
        triggerError('সোশ্যাল লগইনে সমস্যা হয়েছে। অনুগ্রহ করে ফোন ও পাসওয়ার্ড ব্যবহার করুন।');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      triggerError('অনুগ্রহ করে আপনার মোবাইল নম্বর বা ইমেইল দিন');
      return;
    }
    if (!password || password.length < 4) {
      triggerError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      triggerError('অনুগ্রহ করে আপনার পুরো নাম লিখুন');
      return;
    }

    try {
      setIsLoading(true);
      if (mode === 'login') {
        const res = await loginUserApi({
          phone: cleanPhone,
          password,
        });
        setSuccessMessage('লগইন সফল হয়েছে! স্বাগত!');
        setTimeout(() => {
          onSuccess(res.user, res.progress);
          onClose();
        }, 400);
      } else {
        const res = await registerUserApi({
          phone: cleanPhone,
          password,
          name: name.trim(),
          college: college.trim(),
          examYear,
          targetUniversity: targetUni,
          avatarBgColor: avatarColor,
        });

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.65 },
            colors: ['#0A2540', '#FF6B00', '#059669', '#7C3AED'],
            disableForReducedMotion: true,
          });
        } catch (_) {}

        setSuccessMessage('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ৫০ ওয়েলকাম পয়েন্ট যুক্ত হয়েছে!');
        setTimeout(() => {
          onSuccess(res.user, res.progress);
          onClose();
        }, 650);
      }
    } catch (err: any) {
      triggerError(err.message || 'একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto min-h-dvh">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0A2540]/60 backdrop-blur-md"
        />

        {/* Ambient Floating Orbs */}
        <div className="fixed top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#0A2540]/20 blur-3xl pointer-events-none" />

        {/* PrepTest Glass Card Container */}
        <motion.div
          ref={cardContainerRef}
          layout
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative z-50 w-full max-w-md my-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
        >
          {/* Scrollable Body */}
          <div className="overflow-y-auto p-6 sm:p-7 space-y-5 custom-scrollbar">
            {/* Header Close Button */}
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black tracking-wider uppercase text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded-full">
                PrepTest Auth
              </span>
              <button
                id="btn-close-auth-modal"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-[#0A2540] hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PrepTest Logo & Tagline */}
            <PrepTestLogo />

            {/* Sliding Pill Tab Switcher */}
            <div className="relative bg-[#F1F4F8] p-1 rounded-full flex items-center border border-slate-200/60 shadow-inner">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#0A2540] rounded-full shadow-md"
                animate={{
                  x: mode === 'login' ? '0%' : '100%',
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
              <button
                id="tab-auth-login"
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন</span>
              </button>

              <button
                id="tab-auth-register"
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>রেজিস্ট্রেশন</span>
              </button>
            </div>

            {/* Feedback Alert Messages */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              animate={{
                x: shakeTrigger ? [0, -10, 10, -8, 8, -4, 4, 0] : 0,
              }}
              transition={{ duration: 0.4 }}
              className="space-y-3.5"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3.5"
                >
                  {/* Phone / Email Field */}
                  <FloatingField
                    id="input-auth-phone"
                    type="text"
                    label="মোবাইল নম্বর / ইমেইল"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={Phone}
                    required
                    placeholder="যেমন: 01712345678"
                    autoComplete="username"
                  />

                  {/* Password Field */}
                  <FloatingField
                    id="input-auth-password"
                    type="password"
                    label="পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                    required
                    placeholder="কমপক্ষে ৪ অক্ষর"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />

                  {/* Additional Fields for Registration */}
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3.5 pt-1"
                    >
                      <FloatingField
                        id="input-auth-name"
                        type="text"
                        label="শিক্ষার্থীর পূর্ণ নাম"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={User}
                        required
                        placeholder="যেমন: আলিমুল আজাদ"
                        autoComplete="name"
                      />

                      <FloatingField
                        id="input-auth-college"
                        type="text"
                        label="কলেজের নাম"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        icon={School}
                        placeholder="যেমন: ঢাকা কলেজ"
                      />

                      {/* HSC Batch */}
                      <div>
                        <label className="block text-xs font-bold text-[#0A2540] mb-1.5">
                          এইচএসসি ব্যাচ
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {batches.map((b) => (
                            <button
                              type="button"
                              key={b}
                              onClick={() => setExamYear(b)}
                              className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                examYear === b
                                  ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Target University */}
                      <div>
                        <label className="block text-xs font-bold text-[#0A2540] mb-1.5">
                          টার্গেট বিশ্ববিদ্যালয়
                        </label>
                        <select
                          id="select-auth-target-uni"
                          value={targetUni}
                          onChange={(e) => setTargetUni(e.target.value as UniversityUnit)}
                          className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-white text-[#0A2540] font-semibold outline-none focus:border-[#FF6B00]"
                        >
                          {UNIVERSITIES_DATA.map((uni) => (
                            <option key={uni.id} value={uni.id}>
                              {uni.name} - {uni.fullName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Avatar Color Picker */}
                      <div>
                        <label className="block text-xs font-bold text-[#0A2540] mb-1.5">
                          অবতার থিম কালার
                        </label>
                        <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 transition-colors"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {name ? name.charAt(0) : '🧑‍🎓'}
                          </div>
                          <div className="flex gap-2">
                            {colorPresets.map((c) => (
                              <button
                                type="button"
                                key={c}
                                onClick={() => setAvatarColor(c)}
                                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                                  avatarColor === c
                                    ? 'scale-125 ring-2 ring-[#FF6B00] ring-offset-1'
                                    : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Forgot Password Link */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() =>
                      triggerError('পাসওয়ার্ড রিসেটের জন্য হেল্পডেস্কে মেইল করুন support@preptest.bd')
                    }
                    className="text-xs font-extrabold text-[#FF6B00] hover:underline cursor-pointer"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                id="btn-auth-submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#0A2540] hover:bg-[#06182a] active:scale-98 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>প্রসেস করা হচ্ছে...</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4 text-[#FF6B00]" />
                    <span>লগইন করুন</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                    <span>অ্যাকাউন্ট তৈরি করুন</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 absolute">
                  অথবা
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-[#0A2540] transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <GoogleIcon />
                  <span>গুগল</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-[#0A2540] transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <FacebookIcon />
                  <span>ফেসবুক</span>
                </button>
              </div>

              {/* Footer Toggle text */}
              <div className="text-center pt-2 text-xs text-slate-500 font-semibold">
                {mode === 'login' ? (
                  <span>
                    নতুন এখানে?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMessage(null);
                      }}
                      className="font-extrabold text-[#FF6B00] hover:underline cursor-pointer"
                    >
                      রেজিস্ট্রেশন করুন
                    </button>
                  </span>
                ) : (
                  <span>
                    আগে থেকেই অ্যাকাউন্ট আছে?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage(null);
                      }}
                      className="font-extrabold text-[#FF6B00] hover:underline cursor-pointer"
                    >
                      লগইন করুন
                    </button>
                  </span>
                )}
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
