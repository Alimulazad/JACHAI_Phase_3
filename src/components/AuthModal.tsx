import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { X, Lock, Phone, User, School, CheckCircle2, AlertCircle, LogIn, UserPlus, Loader2, Sparkles } from 'lucide-react';
import { UniversityUnit, User as UserType, UserProgress } from '../types';
import { UNIVERSITIES_DATA } from '../data/admissionData';
import { loginUserApi, registerUserApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType, progress: UserProgress) => void;
  initialMode?: 'login' | 'register';
}

// Custom Floating Label Input Field
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
  const isFloating = isFocused || value.length > 0;

  return (
    <div className="relative pt-1">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none z-10 transition-colors">
          <Icon className={`w-4 h-4 ${isFocused ? 'text-blue-600' : 'text-slate-400'}`} />
        </div>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          placeholder={isFocused ? placeholder : ''}
          autoComplete={autoComplete}
          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden bg-white/70 backdrop-blur-xs ${
            isFocused
              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white shadow-2xs'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        />

        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            y: isFloating ? -23 : 0,
            scale: isFloating ? 0.85 : 1,
            x: isFloating ? -8 : 0,
            color: isFocused ? '#1d4ed8' : isFloating ? '#334155' : '#64748b',
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute left-10 pointer-events-none text-xs sm:text-sm origin-left z-10 select-none bg-white px-1 rounded-sm font-bold"
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
  const [avatarColor, setAvatarColor] = useState('#2563eb');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  if (!isOpen) return null;

  const colorPresets = [
    '#2563eb', // blue
    '#059669', // emerald
    '#e11d48', // rose
    '#7c3aed', // violet
    '#d97706', // amber
    '#0f766e', // teal
  ];

  const batches = ['HSC-25', 'HSC-26', 'HSC-27', '2nd Timer'];

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setShakeTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      triggerError('অনুগ্রহ করে আপনার মোবাইল নম্বর দিন');
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

        // Trigger confetti burst on success
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#2563eb', '#059669', '#7c3aed', '#fbbf24'],
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Animated Backdrop with shifting ambient gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-md"
        />

        {/* Ambient Gradient Glow Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.35, 0.55, 0.35],
            x: [-20, 20, -20],
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="fixed -top-20 -left-20 w-80 h-80 rounded-full bg-blue-600/30 blur-3xl pointer-events-none z-50"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
            x: [20, -20, 20],
            y: [20, -20, 20],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="fixed -bottom-20 -right-20 w-80 h-80 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none z-50"
        />

        {/* Glassmorphism Modal Card */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative z-50 w-full max-w-md my-auto bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/60"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] text-white p-5 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-black text-xs font-serif shadow-xs">
                  যাচাই
                </div>
                <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-400/30">
                  JACHAI Auth
                </span>
              </div>
              <h3 className="text-lg font-black mt-1.5 tracking-tight text-white">
                {mode === 'login' ? 'অ্যাকাউন্টে লগইন করুন' : 'নতুন শিক্ষার্থী অ্যাকাউন্ট'}
              </h3>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {mode === 'login'
                  ? 'আপনার ফোন ও পাসওয়ার্ড দিয়ে প্রস্তুতি শুরু করুন'
                  : 'সকল প্র্যাকটিস ও স্কোর সুরক্ষিতভাবে সেভ থাকবে'}
              </p>
            </div>

            <button
              id="btn-close-auth-modal"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all relative z-10 cursor-pointer shrink-0 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decorative background shape */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          </div>

          {/* Tab switcher with smooth motion slider */}
          <div className="p-1.5 bg-slate-100/80 border-b border-slate-200/80 grid grid-cols-2 gap-1 relative text-xs font-bold">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`relative z-10 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'login' ? 'text-[#1E3A8A]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>লগইন করুন</span>
              {mode === 'login' && (
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>

            <button
              id="tab-auth-register"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`relative z-10 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'register' ? 'text-[#1E3A8A]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>নতুন অ্যাকাউন্ট</span>
              {mode === 'register' && (
                <motion.div
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Error / Success Feedback */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mx-4 mt-3.5 p-2.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-2xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mx-4 mt-3.5 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Body with Shake Animation on Error */}
          <motion.form
            onSubmit={handleSubmit}
            animate={{
              x: shakeTrigger ? [0, -10, 10, -8, 8, -4, 4, 0] : 0,
            }}
            transition={{ duration: 0.4 }}
            className="p-4 sm:p-5 space-y-4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Phone Number */}
                <FloatingField
                  id="input-auth-phone"
                  type="tel"
                  label="মোবাইল নম্বর"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                  required
                  placeholder="যেমন: 01712345678"
                  autoComplete="tel"
                />

                {/* Password */}
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
                    transition={{ duration: 0.2 }}
                    className="space-y-4 overflow-hidden pt-1"
                  >
                    {/* Name */}
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

                    {/* College */}
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
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        এইচএসসি ব্যাচ
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {batches.map((b) => (
                          <button
                            type="button"
                            key={b}
                            onClick={() => setExamYear(b)}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              examYear === b
                                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-2xs'
                                : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target University */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        টার্গেট বিশ্ববিদ্যালয়
                      </label>
                      <select
                        id="select-auth-target-uni"
                        value={targetUni}
                        onChange={(e) => setTargetUni(e.target.value as UniversityUnit)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white/80 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
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
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        অবতার থিম কালার
                      </label>
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50/80 rounded-xl border border-slate-200/80">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-2xs shrink-0 transition-colors"
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
                                  ? 'scale-125 ring-2 ring-[#1E3A8A] ring-offset-1'
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

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-auth-submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>প্রসেস করা হচ্ছে...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>লগইন করে ড্যাশবোর্ডে যান</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>অ্যাকাউন্ট রেজিস্টার করুন</span>
                </>
              )}
            </button>

            {/* Switch link */}
            <div className="text-center pt-1 text-xs text-slate-500 font-medium">
              {mode === 'login' ? (
                <span>
                  নতুন শিক্ষার্থী?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                    }}
                    className="font-extrabold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    এখনই রেজিস্টার করুন
                  </button>
                </span>
              ) : (
                <span>
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-extrabold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    লগইন করুন
                  </button>
                </span>
              )}
            </div>
          </motion.form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;

