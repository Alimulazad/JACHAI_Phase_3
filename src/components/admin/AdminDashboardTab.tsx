import React from 'react';
import {
  Database,
  HelpCircle,
  Layers,
  Sparkles,
  Key,
  Users,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  RefreshCw,
  HardDrive,
  Cpu,
  CheckCheck,
} from 'lucide-react';
import { AdminSystemStats } from '../../types';
import { AdminSystemHealthWidget } from './AdminSystemHealthWidget';

interface AdminDashboardTabProps {
  stats: AdminSystemStats | null;
  isLoadingStats: boolean;
  onRefreshStats: () => void;
  onNavigateTab: (tab: 'extract' | 'drafts' | 'questions' | 'keys') => void;
}


export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  stats,
  isLoadingStats,
  onRefreshStats,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              সিস্টেম সচল • প্রোডাকশন রেডি ডেটাবেজ
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              যাচাই অ্যাডমিন কন্ট্রোল সেন্টার
            </h2>
            <p className="text-slate-300 text-sm md:text-base mt-1 max-w-2xl">
              আইসোলেটেড এআই ডেটা এক্সট্রাকশন পাইপলাইন, হিউম্যান-ইন-দ্য-লুপ ড্রাফট ভেরিফিকেশন এবং ওপেনরাউটার মাল্টি-কি ফেইলওভার ম্যানেজমেন্ট।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshStats}
              disabled={isLoadingStats}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
              রিফ্রেশ মেট্রিক্স
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Questions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">মোট প্রশ্ন</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats ? stats.totalQuestions.toLocaleString('bn-BD') : '...'}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">লাইভ PostgreSQL ডেটাবেজে</span>
          </div>
        </div>

        {/* Total Topics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">টপিক ও সিলেবাস</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats ? stats.totalTopics.toLocaleString('bn-BD') : '...'}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">সাবটপিক ও চ্যাপ্টার</span>
          </div>
        </div>

        {/* Knowledge Snippets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">নলেজ স্নপেট</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats ? stats.totalSnippets.toLocaleString('bn-BD') : '...'}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">শর্টকাট ও ফর্মুলা চার্ট</span>
          </div>
        </div>

        {/* Pending Drafts */}
        <div
          onClick={() => onNavigateTab('drafts')}
          className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">পেন্ডিং ড্রাফট</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 flex items-center gap-2">
              {stats ? stats.pendingDrafts.toLocaleString('bn-BD') : '0'}
              {stats && stats.pendingDrafts > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
              )}
            </div>
            <span className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
              রিভিউ অপেক্ষমাণ <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">শিক্ষার্থী একাউন্ট</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats ? stats.totalUsers.toLocaleString('bn-BD') : '...'}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">নিবন্ধিত শিক্ষার্থী</span>
          </div>
        </div>

        {/* API Keys */}
        <div
          onClick={() => onNavigateTab('keys')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">এপিআই কি পুল</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {stats ? stats.openRouterKeysCount.toLocaleString('bn-BD') : '...'}
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              স্বয়ংক্রিয় ফেইলওভার <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Real-time System Health & OpenRouter Telemetry Widget */}
      <AdminSystemHealthWidget
        onNavigateToKeys={() => onNavigateTab('keys')}
      />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action 1: Extract */}
        <div
          onClick={() => onNavigateTab('extract')}
          className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">এআই ডেটা এক্সট্রাকশন</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            বইয়ের টেক্সট, পিডিএফ বা ছবি থেকে স্বয়ংক্রিয়ভাবে এমসিকিউ প্রশ্ন, টপিক বা নলেজ স্নপেট তৈরি করুন।
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 gap-1">
            এক্সট্রাকশন স্টুডিওতে যান <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 2: Review Queue */}
        <div
          onClick={() => onNavigateTab('drafts')}
          className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
            <CheckCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">পেন্ডিং ড্রাফট কিউ</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            এআই দ্বারা জেনারেটকৃত প্রশ্ন ও ডেটা যাচাই করুন, সংশোধন করুন এবং ১-ক্লিকে লাইভ ডেটাবেজে প্রকাশ করুন।
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-700 gap-1">
            অনুমোদন কিউ দেখুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 3: Live DB */}
        <div
          onClick={() => onNavigateTab('questions')}
          className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">লাইভ প্রশ্ন ও টপিক</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            প্রোডাকশন SQLite ডেটাবেজের সকল প্রশ্ন ব্রাউজ করুন, নতুন প্রশ্ন যুক্ত করুন বা পরিবর্তন করুন।
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-700 gap-1">
            ডেটাবেজ ব্রাউজ করুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 4: API Settings */}
        <div
          onClick={() => onNavigateTab('keys')}
          className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">এপিআই কি ও ফেইলওভার</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            ওপেনরাউটার একাধিক ফ্রি ও পেইড কী ম্যানেজ করুন, ল্যাটেন্সি টেস্ট করুন এবং অটো-ফেইলওভার নিয়ন্ত্রণ করুন।
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-700 gap-1">
            কী কনফিগার করুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* System Status & Architecture Architecture Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-600" />
          সিস্টেম আর্কিটেকচার ও ডেটা সেফটি গ্যারান্টি
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              জিরো-ডিসরাপশন আইসোলেশন
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              অ্যাডমিন প্যানেলের সমস্ত নতুন এআই ফিচার ও ড্রাফট কিউ সম্পূর্ণ আলাদা এপিআই ও টেবিলে সংরক্ষিত। মূল স্টুডেন্ট অ্যাপে কোনো প্রভাব পড়ে না।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              হিউম্যান-ইন-দ্য-লুপ সেফটি
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              এআই নিষ্কাশিত ডেটা কখনোই সরাসরি লাইভ ডেটাবেজে যুক্ত হয় না। অ্যাডমিনের ম্যানুয়াল রিভিউ ও অনুমোদনের পরেই কেবল লাইভ ডেটাবেজে পৌঁছায়।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              নিরবচ্ছিন্ন মাল্টি-কি ফেইলওভার
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              কোনো এপিআই কী রেট লিমিট (429) বা সার্ভার এরর (500) পেলে সিস্টেম স্বয়ংক্রিয়ভাবে পরবর্তী কী-তে সুইচ করে, ব্যবহারকারীকে কোনো ত্রুটি দেখায় না।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
