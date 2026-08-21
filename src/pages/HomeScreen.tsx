import React from 'react';
import {
  Sparkles,
  Zap,
  BookOpen,
  PenSquare,
  Bot,
  Flame,
  User,
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldCheck,
  Award,
  Calendar,
  ChevronRight,
  TrendingUp,
  LogIn,
  Layers,
  Sparkle,
  Check,
  Smile,
  BookMarked,
  Trophy,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';
import { UserProgress, NavigationTab, Question, User as UserType } from '../types';
import { UNIVERSITIES_DATA, INITIAL_QUESTIONS } from '../data/admissionData';
import QuestionCard from '../components/QuestionCard';
import WeakTopicsCard from '../components/WeakTopicsCard';
import KnowledgeCarousel from '../components/KnowledgeCarousel';

interface HomeScreenProps {
  progress: UserProgress;
  currentUser: UserType | null;
  questions?: Question[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenAvatarModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenAITutor: () => void;
  onSelectPracticeSubject?: (subjectId: string) => void;
  onPracticeTopic?: (chapterId: string) => void;
  onAskAIAboutTopic?: (topicName: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  currentUser,
  questions = [],
  onNavigate,
  onOpenAvatarModal,
  onOpenAuthModal,
  onOpenAITutor,
  onPracticeTopic,
  onAskAIAboutTopic,
}) => {
  // Target university data
  const targetUni =
    UNIVERSITIES_DATA.find((u) => u.id === (currentUser?.target_university || progress.targetUniversity)) ||
    UNIVERSITIES_DATA[0];

  // Daily challenge question
  const dailyQuestion: Question = INITIAL_QUESTIONS[0];

  const isLoggedIn = !!currentUser;
  const streakCount = currentUser ? progress.streakDays || 0 : progress.streakDays || 0;

  // Real journey tasks calculation from progress.completedJourneyTasks & user state
  const completedJourney = progress.completedJourneyTasks || [];
  const isAccountCreated = isLoggedIn || completedJourney.includes('account_created');
  const isMockAttempted =
    progress.examsCompleted > 0 ||
    completedJourney.includes('first_practice') ||
    completedJourney.includes('first_exam');
  const isAvatarDone =
    (isLoggedIn && !!currentUser?.name) ||
    completedJourney.includes('avatar_created') ||
    completedJourney.includes('avatar_customized') ||
    !!progress.avatarSeed;

  const journeyTasks = [
    {
      id: 'account',
      title: isAccountCreated ? 'অ্যাকাউন্ট খোলা হয়েছে' : 'অ্যাকাউন্ট খোলো',
      isCompleted: isAccountCreated,
      action: () => (!isLoggedIn ? onOpenAuthModal('register') : onOpenAvatarModal()),
    },
    {
      id: 'first_exam',
      title: isMockAttempted ? '১টি মক টেস্ট বা দ্রুত প্র্যাকটিস সম্পন্ন' : '১টি মক টেস্ট বা দ্রুত প্র্যাকটিস দাও',
      isCompleted: isMockAttempted,
      action: () => onNavigate('exam'),
    },
    {
      id: 'avatar',
      title: isAvatarDone ? 'তোমার অ্যাভাটার তৈরি হয়েছে' : 'তোমার অ্যাভাটার বানাও',
      isCompleted: isAvatarDone,
      action: onOpenAvatarModal,
    },
  ];

  const completedCount = journeyTasks.filter((t) => t.isCompleted).length;
  const journeyPercent = Math.round((completedCount / journeyTasks.length) * 100);

  const hasAvatar = !!(currentUser && currentUser.avatar && currentUser.avatar.trim() !== '');

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto px-1 sm:px-2 pt-1">
      {/* Banner Card: KnowledgeCarousel if avatar is created, or Avatar CTA Banner if not created */}
      {hasAvatar ? (
        <KnowledgeCarousel />
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#047857] text-white p-4 sm:p-5 shadow-sm border border-emerald-900/30">
          {/* Background decorative circles & pattern */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 right-24 w-32 h-32 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="max-w-[65%] sm:max-w-md">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-[11px] font-bold mb-1.5 backdrop-blur-xs">
                JACHAI — প্রস্তুতি ও মূল্যায়ন
              </div>

              <h2 className="text-base sm:text-xl font-black tracking-tight leading-snug mb-3 text-white">
                "যাচাই করো নিজেকে, ভর্তি যুদ্ধে বাঁচাইতে"
              </h2>

              <button
                id="btn-banner-avatar-cta"
                onClick={onOpenAvatarModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#0F766E] hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-full transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>প্রোফাইল ও অ্যাভাটার</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Avatar Graphic Illustration */}
            <div
              onClick={onOpenAvatarModal}
              className="flex items-center justify-end shrink-0 cursor-pointer group"
            >
              <div className="relative flex items-center -space-x-3 sm:-space-x-4">
                {/* Girl Avatar Representation */}
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-purple-800 to-pink-600 border-2 border-white/80 p-1 flex items-center justify-center shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <div className="w-full h-full rounded-full bg-purple-900/60 flex flex-col items-center justify-center text-center">
                    <Smile className="w-7 h-7 sm:w-9 sm:h-9 text-pink-200" />
                  </div>
                </div>

                {/* Boy with Headphones Avatar Representation */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border-2 border-white p-1 flex items-center justify-center shadow-lg transform rotate-3 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-blue-950/60 flex flex-col items-center justify-center text-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. চারটা quick-action আইকন বাটন এক সারিতে: প্রশ্নব্যাংক, দ্রুত প্র্যাকটিস, মক পরীক্ষা, চর্চা AI */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* Button 1: প্রশ্নব্যাংক */}
        <button
          id="btn-quick-question-bank"
          onClick={() => onNavigate('question_bank')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-50/60 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-2xs hover:shadow-xs group cursor-pointer active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAA338] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-amber-500/20">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 mt-2 text-center leading-tight whitespace-nowrap">
            প্রশ্নব্যাংক
          </span>
        </button>

        {/* Button 2: দ্রুত প্র্যাকটিস */}
        <button
          id="btn-quick-practice"
          onClick={() => onNavigate('exam')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-yellow-50/60 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all shadow-2xs hover:shadow-xs group cursor-pointer active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FACC15] text-amber-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-yellow-500/20">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 fill-current stroke-[2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 mt-2 text-center leading-tight whitespace-nowrap">
            দ্রুত প্র্যাকটিস
          </span>
        </button>

        {/* Button 3: মক পরীক্ষা */}
        <button
          id="btn-quick-mock-exam"
          onClick={() => onNavigate('exam')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-rose-50/60 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 transition-all shadow-2xs hover:shadow-xs group cursor-pointer active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F43F5E] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-rose-500/20">
            <PenSquare className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 mt-2 text-center leading-tight whitespace-nowrap">
            মক পরীক্ষা
          </span>
        </button>

        {/* Button 4: চর্চা AI */}
        <button
          id="btn-quick-ai-tutor"
          onClick={onOpenAITutor}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-indigo-50/60 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-2xs hover:shadow-xs group cursor-pointer active:scale-95"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-indigo-500/20">
            <Bot className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 mt-2 text-center leading-tight whitespace-nowrap">
            চর্চা AI
          </span>
        </button>
      </div>

      {/* 4. "তোমার যাত্রা শুরু হোক" onboarding checklist card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
          তোমার যাত্রা শুরু হোক
        </h3>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(journeyPercent, 4)}%` }}
          />
        </div>

        {/* Status text matching screenshot */}
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="text-[#D97706] dark:text-amber-400 font-bold">{journeyPercent}% হয়েছে</span>
          <span className="text-slate-400 dark:text-slate-500 mx-1">-</span>
          <span className="text-[#D97706] dark:text-amber-400">{journeyPercent === 100 ? 'সব সম্পন্ন হয়েছে!' : 'চালিয়ে যাও'}</span>
        </div>

        {/* Checklist Task Items */}
        <div className="space-y-2.5 pt-1">
          {journeyTasks.map((task) => (
            <div
              key={task.id}
              onClick={task.action}
              className="flex items-center gap-3 cursor-pointer group select-none transition-colors"
            >
              {/* Dot indicator matching screenshot style */}
              {task.isCompleted ? (
                <div className="w-4 h-4 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-[#F59E0B] shrink-0 transition-colors" />
              )}

              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  task.isCompleted
                    ? 'text-slate-700 dark:text-slate-200 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                }`}
              >
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Topics Compact View (Max 2 topics) */}
      <WeakTopicsCard
        progress={progress}
        questions={questions}
        maxTopics={2}
        onPracticeTopic={(chapterId) => onPracticeTopic && onPracticeTopic(chapterId)}
        onAskAIAboutTopic={(topicName) => onAskAIAboutTopic && onAskAIAboutTopic(topicName)}
      />

      {/* 5. Target University & Points Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#1E3A8A] dark:bg-slate-800 text-white flex items-center justify-between shadow-xs border border-blue-900 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500/20 flex items-center justify-center text-amber-300 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-blue-200 dark:text-blue-300 font-bold uppercase tracking-wider">
                টার্গেট ভার্সিটি: {targetUni.shortCode}
              </div>
              <div className="font-bold text-sm sm:text-base text-white">{targetUni.name}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-blue-200 dark:text-blue-300">ভর্তি পরীক্ষা</div>
            <div className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1 justify-end font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{targetUni.examDate || 'শীঘ্রই আসছে'}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-around text-center">
          <div>
            <div className="text-base sm:text-lg font-bold text-[#1E3A8A] dark:text-blue-400 font-mono">
              {progress.points || 0}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">পয়েন্টস</div>
          </div>
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {progress.examsCompleted || 0}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">টেস্ট সম্পন্ন</div>
          </div>
        </div>
      </div>

      {/* 6. Daily Admission Challenge Question */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <h3 className="font-bold text-[#1E3A8A] dark:text-blue-400 text-sm sm:text-base">
              আজকের পদার্থবিজ্ঞান স্পেশাল প্রশ্ন
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#1E40AF] dark:text-blue-300 bg-[#DBEAFE] dark:bg-blue-950/60 px-2 py-0.5 rounded-md uppercase font-mono border border-blue-200/50 dark:border-blue-800/60">
            Daily Challenge
          </span>
        </div>

        <QuestionCard
          question={dailyQuestion}
          index={0}
          mode="practice"
          onAskAI={() => onOpenAITutor()}
        />
      </div>
    </div>
  );
};

export default HomeScreen;



