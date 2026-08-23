import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles,
  Key,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  HelpCircle,
  Clock,
  CheckCheck,
  Activity,
  Server,
  ExternalLink
} from 'lucide-react';
import { Question, AdminDraftItem, AdminApiKeyConfig, AdminSystemStats } from '../types';
import { 
  fetchQuestions, 
  createQuestion,
  updateQuestion,
  deleteQuestion,
  verifyAdminPassword,
  fetchAdminStatsApi,
  fetchAdminKeysApi,
  saveAdminKeysApi,
  fetchAdminDraftsApi,
  publishAdminDraftApi,
  batchPublishAdminDraftsApi,
  batchRejectAdminDraftsApi,
  deleteAdminDraftApi,
  updateAdminDraftApi
} from '../services/api';

import { AdminDashboardTab } from '../components/admin/AdminDashboardTab';
import { AdminExtractTab } from '../components/admin/AdminExtractTab';
import { AdminDraftsQueueTab } from '../components/admin/AdminDraftsQueueTab';
import { AdminApiKeysTab } from '../components/admin/AdminApiKeysTab';
import { AdminQuestionsTab } from '../components/admin/AdminQuestionsTab';
import { AdminSystemHealthWidget } from '../components/admin/AdminSystemHealthWidget';
import { AdminActiveUsersTab } from '../components/admin/AdminActiveUsersTab';

interface AdminScreenProps {
  onBackToApp: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBackToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Tab Navigation: 'dashboard' | 'active_users' | 'extract' | 'drafts' | 'keys' | 'questions' | 'health'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active_users' | 'extract' | 'drafts' | 'keys' | 'questions' | 'health'>('dashboard');

  // Core Data States
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [keys, setKeys] = useState<AdminApiKeyConfig[]>([]);
  const [drafts, setDrafts] = useState<AdminDraftItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  // Check stored session auth
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('varsity_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      loadAllAdminData();
    }
  }, []);

  const loadAllAdminData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingStats(true);
    try {
      const [statsData, keysData, draftsData, questionsData] = await Promise.allSettled([
        fetchAdminStatsApi(),
        fetchAdminKeysApi(),
        fetchAdminDraftsApi(),
        fetchQuestions(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (keysData.status === 'fulfilled') setKeys(keysData.value);
      if (draftsData.status === 'fulfilled') setDrafts(draftsData.value);
      if (questionsData.status === 'fulfilled') setQuestions(questionsData.value);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifying(true);

    try {
      const isValid = await verifyAdminPassword(passwordInput);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('varsity_admin_auth', 'true');
        loadAllAdminData();
      } else {
        setAuthError('ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড দিন।');
      }
    } catch (err) {
      setAuthError('সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি।');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('varsity_admin_auth');
    setPasswordInput('');
  };

  // Staging Draft Actions
  const handleApproveSingleDraft = async (id: string) => {
    await publishAdminDraftApi(id);
    await loadAllAdminData();
  };

  const handleBatchApproveDrafts = async (ids: string[]) => {
    await batchPublishAdminDraftsApi(ids);
    await loadAllAdminData();
  };

  const handleBatchRejectDrafts = async (ids: string[]) => {
    await batchRejectAdminDraftsApi(ids);
    await loadAllAdminData();
  };

  const handleDeleteDraft = async (id: string) => {
    await deleteAdminDraftApi(id);
    await loadAllAdminData();
  };

  const handleUpdateDraft = async (id: string, payload: any) => {
    await updateAdminDraftApi(id, payload);
    await loadAllAdminData();
  };

  // Keys Actions
  const handleSaveKeys = async (updatedKeys: AdminApiKeyConfig[]) => {
    await saveAdminKeysApi(updatedKeys);
    await loadAllAdminData();
  };

  // Question Bank Actions
  const handleCreateQuestion = async (
    q: Partial<Question>,
    files?: { questionImageFile?: File | null; explanationImageFile?: File | null }
  ) => {
    await createQuestion(q, files);
    await loadAllAdminData();
  };

  const handleUpdateQuestion = async (
    id: string,
    q: Partial<Question>,
    files?: { questionImageFile?: File | null; explanationImageFile?: File | null }
  ) => {
    await updateQuestion(id, q, files);
    await loadAllAdminData();
  };

  const handleDeleteQuestion = async (id: string) => {
    await deleteQuestion(id);
    await loadAllAdminData();
  };

  // If Not Authenticated, show Modern Security Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
          <button
            id="admin-btn-back-to-app"
            onClick={onBackToApp}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 mx-auto px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>স্টুডেন্ট অ্যাপ্লিকেশনে ফিরে যান</span>
          </button>

          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Database className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-center text-2xl font-black text-white tracking-tight">
            PrepTest Control Center
          </h2>
          <p className="mt-1 text-center text-xs text-slate-400">
            নিরাপদ অ্যাডমিন অ্যাক্সেস ও AI পাইপলাইন ম্যানেজমেন্ট
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
          <div className="bg-slate-900/90 border border-slate-800/90 py-8 px-6 shadow-2xl rounded-3xl backdrop-blur-xl sm:px-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  অ্যাডমিন সিকিউরিটি পাসওয়ার্ড
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="পাসওয়ার্ড প্রদান করুন..."
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    required
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>End-to-End Staging Security Protocol</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="bg-slate-950/80 text-white border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand and back */}
            <div className="flex items-center gap-3">
              <button
                id="admin-btn-back-to-app"
                onClick={onBackToApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium border border-slate-800 transition-all cursor-pointer shadow-sm hover:border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">স্টুডেন্ট অ্যাপে ফিরুন</span>
                <span className="sm:hidden">অ্যাপ</span>
              </button>

              <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">JACHAI Admin Hub</h1>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      v2.5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden md:block">AI ডেটা পাইপলাইন ও লাইভ ম্যানেজমেন্ট</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                id="admin-btn-refresh-stats"
                onClick={loadAllAdminData}
                disabled={isLoading}
                title="রিফ্রেশ করুন"
                className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer shadow-sm ${
                  isLoading ? 'animate-spin text-indigo-400' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                id="admin-btn-logout"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs sm:text-sm font-medium transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar - Sleek Glassmorphism Segmented Control */}
          <div className="py-2.5 border-t border-slate-800/80">
            <nav className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md">
              {/* Tab 1: Dashboard */}
              <button
                id="admin-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                  activeTab === 'dashboard'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === 'dashboard' && (
                  <motion.div
                    layoutId="admin-active-nav-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>ড্যাশবোর্ড ও ওভারভিউ</span>
                </span>
              </button>

              {/* Tab: Active Users Monitoring */}
              <button
                id="admin-tab-active-users"
                onClick={() => setActiveTab('active_users')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                  activeTab === 'active_users'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === 'active_users' && (
                  <motion.div
                    layoutId="admin-active-nav-pill"
                    className="absolute inset-0 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>লাইভ অ্যাক্টিভ ইউজার</span>
                </span>
              </button>

              {/* Tab 2: AI Extract */}
              <button
                id="admin-tab-extract"
                onClick={() => setActiveTab('extract')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                  activeTab === 'extract'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === 'extract' && (
                  <motion.div
                    layoutId="admin-active-nav-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI ডেটা এক্সট্রাক্টর</span>
                </span>
              </button>

              {/* Tab 3: Drafts Queue */}
              <button
                id="admin-tab-drafts"
                onClick={() => setActiveTab('drafts')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                  activeTab === 'drafts'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === 'drafts' && (
                  <motion.div
                    layoutId="admin-active-nav-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>অনুমোদন কিউ</span>
                  {stats && stats.pendingDrafts > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                      {stats.pendingDrafts}
                    </span>
                  )}
                </span>
              </button>

              {/* Tab 4: API Keys & Failover */}
              <button
                id="admin-tab-keys"
                onClick={() => setActiveTab('keys')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                  activeTab === 'keys'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === 'keys' && (
                  <motion.div
                    layoutId="admin-active-nav-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>এপিআই কী ও ফেইলওভার</span>
                  {stats && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/80">
                      {stats.openRouterKeysCount} Keys
                    </span>
                  )}
                </span>
              </button>

              {/* Tab 5: System Health */}
              <button
                id="admin-tab-health"
                onClick={() => setActiveTab('health')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                  activeTab === 'health'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === 'health' && (
                  <motion.div
                    layoutId="admin-active-nav-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>সিস্টেম হেলথ ও ল্যাটেন্সি</span>
                </span>
              </button>

              {/* Tab 6: Questions Bank */}
              <button
                id="admin-tab-questions"
                onClick={() => setActiveTab('questions')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                  activeTab === 'questions'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === 'questions' && (
                  <motion.div
                    layoutId="admin-active-nav-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>লাইভ প্রশ্নব্যাংক ({questions.length})</span>
                </span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Dedicated Admin Portal Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-300">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>
              <strong>স্বাধীন অ্যাডমিন পোর্টাল:</strong> সম্পূর্ণ আইসোলেটেড অ্যাডমিন হাব ব্রাউজ করতে সরাসরি পোর্টাল ব্যবহার করুন।
            </span>
          </div>
          <a
            href="/admin-portal"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition cursor-pointer whitespace-nowrap"
          >
            পোর্টাল ওপেন করুন <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            stats={stats}
            isLoadingStats={isLoadingStats}
            onRefreshStats={loadAllAdminData}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'active_users' && <AdminActiveUsersTab />}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-400" />
                  রিয়েল-টাইম ওপেনরাউটার হেলথ ও ল্যাটেন্সি টেলিমেট্রি
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  OpenRouter ক্লাউড এন্ডপয়েন্ট রেসপন্স স্পিড, ল্যাটেন্সি ট্রেন্ড এবং কী-পুল ব্যবহারের রিয়েল-টাইম লাইভ ট্র্যাকার
                </p>
              </div>
            </div>
            <AdminSystemHealthWidget
              onNavigateToKeys={() => setActiveTab('keys')}
            />
          </div>
        )}

        {activeTab === 'extract' && (
          <AdminExtractTab
            onExtractionComplete={loadAllAdminData}
            onNavigateToDrafts={() => setActiveTab('drafts')}
          />
        )}

        {activeTab === 'drafts' && (
          <AdminDraftsQueueTab
            drafts={drafts}
            isLoading={isLoading}
            onRefresh={loadAllAdminData}
            onApprovePublish={handleApproveSingleDraft}
            onBatchApprovePublish={handleBatchApproveDrafts}
            onBatchReject={handleBatchRejectDrafts}
            onDeleteDraft={handleDeleteDraft}
            onUpdateDraft={handleUpdateDraft}
            onNavigateToExtract={() => setActiveTab('extract')}
          />
        )}

        {activeTab === 'keys' && (
          <AdminApiKeysTab
            keys={keys}
            isLoading={isLoading}
            onRefreshKeys={loadAllAdminData}
            onSaveKeys={handleSaveKeys}
          />
        )}

        {activeTab === 'questions' && (
          <AdminQuestionsTab
            questions={questions}
            isLoading={isLoading}
            onRefresh={loadAllAdminData}
            onCreateQuestion={handleCreateQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}
      </main>
    </div>
  );
};

export default AdminScreen;
