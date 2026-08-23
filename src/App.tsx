import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { NavigationTab, UserProgress, Question, User } from './types';
import {
  getSavedUserData,
  saveUserData,
  fetchQuestions,
  getStoredUser,
  fetchCurrentUserApi,
  syncUserProgressToBackend,
  removeAuthToken,
  sendUserHeartbeatApi,
} from './services/api';
import { INITIAL_QUESTIONS } from './data/admissionData';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import HomeScreen from './pages/HomeScreen';
import ChorchaAITutor from './components/ChorchaAITutor';
import MoveableAIFab from './components/MoveableAIFab';
import AvatarCreatorModal from './components/AvatarCreatorModal';
import AuthModal from './components/AuthModal';
import { ScreenSkeletonLoader } from './components/common/SkeletonLoader';
import { useToast } from './context/ToastContext';
import { useTheme } from './context/ThemeContext';
import { useNetwork } from './context/NetworkContext';



// Code-split heavy routes to optimize initial bundle size & load performance
const QuestionBankScreen = lazy(() => import('./pages/QuestionBankScreen'));
const ExamScreen = lazy(() => import('./pages/ExamScreen'));
const HistoryScreen = lazy(() => import('./pages/HistoryScreen'));
const ProgressScreen = lazy(() => import('./pages/ProgressScreen'));
const AdminScreen = lazy(() => import('./pages/AdminScreen'));
import {
  Settings as SettingsIcon,
  X,
  Smartphone,
  RotateCcw,
  Sparkles,
  Database,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { isOnline, isOfflineMode, continueOffline, initialConnectionFailed, triggerReconnection, registerSyncCallback } = useNetwork();

  // Derive currentTab from path
  const getCurrentTabFromPath = (pathname: string): NavigationTab => {
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/questions') || pathname.startsWith('/question_bank')) return 'question_bank';
    if (pathname.startsWith('/exam')) return 'exam';
    if (pathname.startsWith('/history')) return 'history';
    if (pathname.startsWith('/progress')) return 'progress';
    return 'home';
  };

  const currentTab = getCurrentTabFromPath(location.pathname);

  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [userProgress, setUserProgress] = useState<UserProgress>(getSavedUserData());
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [aiTutorInitialQuestion, setAiTutorInitialQuestion] = useState<Question | null>(null);
  const [aiTutorInitialTopicPrompt, setAiTutorInitialTopicPrompt] = useState<string | null>(null);
  const [examInitialChapterId, setExamInitialChapterId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExamFlowActive, setIsExamFlowActive] = useState(false);

  // Load questions from PostgreSQL API
  const loadDatabaseQuestions = useCallback(async () => {
    try {
      setIsLoadingQuestions(true);
      const data = await fetchQuestions();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
      }
    } catch (e) {
      console.warn('Questions sync notice:', e);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  // Register reconnection sync callback
  useEffect(() => {
    const unregister = registerSyncCallback('main-app-sync', async () => {
      console.log('Network restored - syncing questions and profile');
      await loadDatabaseQuestions();
      const authData = await fetchCurrentUserApi();
      if (authData) {
        setCurrentUser(authData.user);
        if (authData.progress) {
          setUserProgress(authData.progress);
        }
      }
    });
    return unregister;
  }, [registerSyncCallback, loadDatabaseQuestions]);

  // Check auth session on startup
  useEffect(() => {
    async function checkAuth() {
      const authData = await fetchCurrentUserApi();
      if (authData) {
        setCurrentUser(authData.user);
        if (authData.progress) {
          setUserProgress(authData.progress);
        }
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    loadDatabaseQuestions();
  }, [loadDatabaseQuestions]);

  // Real-time Active User Heartbeat & Telemetry Tracking
  useEffect(() => {
    const getPageName = (path: string) => {
      if (path.startsWith('/admin')) return 'অ্যাডমিন ড্যাশবোর্ড';
      if (path.startsWith('/questions')) return 'প্রশ্নব্যাংক এক্সপ্লোরার';
      if (path.startsWith('/exam')) return 'মডেল টেস্ট পরীক্ষা';
      if (path.startsWith('/progress')) return 'অগ্রগতি ড্যাশবোর্ড';
      if (path.startsWith('/history')) return 'পরীক্ষার ইতিহাস';
      return 'হোমপেজ ও ড্যাশবোর্ড';
    };

    const emitHeartbeat = () => {
      let deviceInfo = 'Desktop / PC';
      if (/Android/i.test(navigator.userAgent)) deviceInfo = 'Android Phone';
      else if (/iPhone/i.test(navigator.userAgent)) deviceInfo = 'iPhone';
      else if (/iPad/i.test(navigator.userAgent)) deviceInfo = 'iPad Tablet';

      sendUserHeartbeatApi({
        page: getPageName(location.pathname),
        targetUniversity: userProgress.targetUniversity,
        device: deviceInfo,
      }).catch(() => {});
    };

    emitHeartbeat();
    const interval = setInterval(emitHeartbeat, 30000); // Heartbeat every 30 seconds
    return () => clearInterval(interval);
  }, [location.pathname, userProgress.targetUniversity]);


  const handleUpdateProgress = (updated: Partial<UserProgress>) => {
    setUserProgress((prev) => {
      const next = { ...prev, ...updated };
      saveUserData(next);
      if (currentUser) {
        syncUserProgressToBackend(next);
      }
      return next;
    });
  };

  const handleLoginSuccess = (user: User, progress: UserProgress) => {
    setCurrentUser(user);
    if (progress) {
      setUserProgress(progress);
    }
    toast.success(`স্বাগতম, ${user.name}! আপনার প্রস্তুতি অগ্রগতি সিঙ্ক হয়েছে।`);
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    toast.info('সফলভাবে লগআউট হয়েছে');
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenAITutorForQuestion = (q: Question) => {
    setAiTutorInitialQuestion(q);
    setAiTutorInitialTopicPrompt(null);
    setIsAITutorOpen(true);
  };

  const handleAskAIAboutTopic = (topicName: string) => {
    setAiTutorInitialQuestion(null);
    setAiTutorInitialTopicPrompt(
      `আমাকে ${topicName} টপিকটা সংক্ষেপে, সহজ বাংলায় বুঝিয়ে দাও, HSC/ভর্তি পরীক্ষার প্রেক্ষাপটে।`
    );
    setIsAITutorOpen(true);
  };

  const handlePracticeTopic = (chapterId: string) => {
    setExamInitialChapterId(chapterId);
    navigate('/exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleBookmark = (id: string) => {
    const exists = userProgress.bookmarks.includes(id);
    const newBookmarks = exists
      ? userProgress.bookmarks.filter((b) => b !== id)
      : [...userProgress.bookmarks, id];
    handleUpdateProgress({ bookmarks: newBookmarks });
    toast.info(exists ? 'বুকমার্ক থেকে সরানো হয়েছে' : 'বুকমার্কে যোগ করা হয়েছে');
  };

  const navigateToTab = (tab: NavigationTab) => {
    const routeMap: Record<NavigationTab, string> = {
      home: '/',
      question_bank: '/questions',
      exam: '/exam',
      history: '/history',
      progress: '/progress',
      admin: '/admin',
    };
    navigate(routeMap[tab]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Header Navbar */}


      {/* Top Header Navbar */}
      {!(currentTab === 'exam' && isExamFlowActive) && (
        <Navbar
          progress={userProgress}
          currentUser={currentUser}
          onOpenAvatarModal={() => {
            if (!currentUser) {
              handleOpenAuthModal('login');
            } else {
              setIsAvatarModalOpen(true);
            }
          }}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
          onOpenAITutor={() => {
            setAiTutorInitialQuestion(null);
            setAiTutorInitialTopicPrompt(null);
            setIsAITutorOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNavigateToAdmin={() => navigate('/admin')}
        />
      )}

      {/* Main View Area with Animated Route Transitions */}
      <main className={`grow max-w-4xl w-full mx-auto ${currentTab === 'exam' && isExamFlowActive ? 'p-0 max-w-full' : 'px-3 sm:px-4 pt-4'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full h-full pb-20 sm:pb-24"
          >
            <Suspense fallback={<ScreenSkeletonLoader />}>
              <Routes location={location}>
                <Route
                  path="/"
                  element={
                    <HomeScreen
                      progress={userProgress}
                      currentUser={currentUser}
                      questions={questions}
                      onNavigate={navigateToTab}
                      onOpenAvatarModal={() => {
                        if (!currentUser) {
                          handleOpenAuthModal('login');
                        } else {
                          setIsAvatarModalOpen(true);
                        }
                      }}
                      onOpenAuthModal={handleOpenAuthModal}
                      onOpenAITutor={() => {
                        setAiTutorInitialQuestion(null);
                        setAiTutorInitialTopicPrompt(null);
                        setIsAITutorOpen(true);
                      }}
                      onPracticeTopic={handlePracticeTopic}
                      onAskAIAboutTopic={handleAskAIAboutTopic}
                    />
                  }
                />
                <Route
                  path="/questions"
                  element={
                    <QuestionBankScreen
                      questions={questions}
                      bookmarks={userProgress.bookmarks}
                      onToggleBookmark={handleToggleBookmark}
                      onAskAI={handleOpenAITutorForQuestion}
                      isLoading={isLoadingQuestions}
                    />
                  }
                />
                <Route
                  path="/question_bank"
                  element={<Navigate to="/questions" replace />}
                />
                <Route
                  path="/exam"
                  element={
                    <ExamScreen
                      questions={questions}
                      progress={userProgress}
                      initialChapterId={examInitialChapterId}
                      onSaveProgress={handleUpdateProgress}
                      onAskAI={handleOpenAITutorForQuestion}
                      onFlowStateChange={setIsExamFlowActive}
                    />
                  }
                />
                <Route
                  path="/history"
                  element={
                    <HistoryScreen
                      questions={questions}
                      progress={userProgress}
                      onSaveProgress={handleUpdateProgress}
                      onAskAI={handleOpenAITutorForQuestion}
                    />
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <ProgressScreen
                      progress={userProgress}
                      currentUser={currentUser}
                      questions={questions}
                      onOpenAuthModal={handleOpenAuthModal}
                      onOpenAITutor={() => {
                        setAiTutorInitialQuestion(null);
                        setAiTutorInitialTopicPrompt(null);
                        setIsAITutorOpen(true);
                      }}
                      onPracticeTopic={handlePracticeTopic}
                      onAskAIAboutTopic={handleAskAIAboutTopic}
                    />
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminScreen
                      onBackToApp={() => {
                        navigate('/');
                        loadDatabaseQuestions();
                      }}
                    />
                  }
                />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      {currentTab !== 'admin' && !(currentTab === 'exam' && isExamFlowActive) && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={navigateToTab}
          mistakesCount={userProgress.pastMistakes.filter((m) => !m.resolved).length}
        />
      )}

      {/* Moveable Draggable AI Floating Action Button (FAB) */}
      {!(currentTab === 'exam' && isExamFlowActive) && (
        <MoveableAIFab
          onOpenAITutor={() => {
            setAiTutorInitialQuestion(null);
            setIsAITutorOpen(true);
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* JACHAI AI Admission Tutor Drawer/Modal */}
      <ChorchaAITutor
        isOpen={isAITutorOpen}
        onClose={() => {
          setIsAITutorOpen(false);
          setAiTutorInitialQuestion(null);
          setAiTutorInitialTopicPrompt(null);
        }}
        initialQuestion={aiTutorInitialQuestion}
        initialTopicPrompt={aiTutorInitialTopicPrompt}
      />

      {/* Avatar & Profile Creator Modal */}
      <AvatarCreatorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        progress={userProgress}
        currentUser={currentUser}
        onSave={handleUpdateProgress}
        onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
      />

      {/* Settings & System Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">সেটিংস ও সিস্টেম তথ্য</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                aria-label="সেটিংস বন্ধ করুন"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              {/* Appearance / Night Study Mode */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
                  থিম ও রিডিং মোড
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>লাইট</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-950 text-indigo-200 border-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>নাইট স্টাডি</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold cursor-pointer transition-all ${
                      theme === 'system'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-slate-500" />
                    <span>সিস্টেম</span>
                  </button>
                </div>
              </div>

              {/* Auth Status Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>অথেনটিকেশন স্ট্যাটাস</span>
                  </div>
                  {currentUser ? (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      লগইন সক্রিয়
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      গেস্ট মোড
                    </span>
                  )}
                </div>
                {currentUser ? (
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mt-1.5">
                    <div><strong>নাম:</strong> {currentUser.name}</div>
                    <div><strong>ফোন:</strong> {currentUser.phone}</div>
                    <div><strong>টার্গেট:</strong> {currentUser.target_university?.toUpperCase()} ({currentUser.exam_year})</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">আপনার নিজস্ব একাউন্ট তৈরি করুন</span>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        handleOpenAuthModal('login');
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      লগইন / রেজিস্টার
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Shortcut */}
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                    <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>JACHAI অ্যাডমিন কন্ট্রোল সেন্টার</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      navigate('/admin');
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    প্রবেশ করুন
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  প্রশ্ন সম্পাদনা, নতুন প্রশ্ন ড্রাফট ও এআই এক্সট্রাকশন পরিচালনা করুন।
                </p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>PWA ও অফলাইন ফ্রেন্ডলি</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  PrepTest অ্যান্ড্রয়েড হোমস্ক্রিনে ইনস্টল করে অফলাইন ক্যাশ সহ দ্রুত ব্যবহার করা যায়।
                </p>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    if (confirm('আপনি কি নিশ্চিত যে সমস্ত লোকাল ক্যাশ ডেটা রিসেট করতে চান?')) {
                      localStorage.clear();
                      toast.info('লোকাল ক্যাশ রিসেট সম্পন্ন হয়েছে');
                      setTimeout(() => window.location.reload(), 500);
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>সকল লোকাল ডেটা রিসেট করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
