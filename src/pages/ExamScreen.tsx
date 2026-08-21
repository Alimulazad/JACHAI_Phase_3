import React, { useState, useEffect } from 'react';
import { Question, UserProgress, ExamHistoryItem } from '../types';
import { ExamFlowStep, ExamSetupState, ExamSessionResult, PresetExamConfig } from './exam/types';
import { ExamDashboardPage } from './exam/ExamDashboardPage';
import { ExamTopicSelectPage } from './exam/ExamTopicSelectPage';
import { ExamStandardSelectPage } from './exam/ExamStandardSelectPage';
import { ExamConfirmPage } from './exam/ExamConfirmPage';
import { ExamLivePage } from './exam/ExamLivePage';
import { ExamResultMascotPage } from './exam/ExamResultMascotPage';
import { ExamMilestonePage } from './exam/ExamMilestonePage';
import { ExamReviewPage } from './exam/ExamReviewPage';
import { EXAM_SUBJECTS } from './exam/examData';
import { calculateExamScore } from '../utils/scoring';

interface ExamScreenProps {
  questions: Question[];
  progress: UserProgress;
  initialChapterId?: string | null;
  onSaveProgress: (updated: UserProgress) => void;
  onAskAI?: (question: Question) => void;
  onFlowStateChange?: (isInSetupOrExam: boolean) => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  questions,
  progress,
  initialChapterId,
  onSaveProgress,
  onAskAI,
  onFlowStateChange,
}) => {
  const [currentStep, setCurrentStep] = useState<ExamFlowStep>('dashboard');

  // Setup State
  const [setupState, setSetupState] = useState<ExamSetupState>({
    subjectKey: 'chemistry',
    subjectName: 'রসায়ন',
    selectedSubTopicIds: [],
    selectedChapterIds: [],
    selectedPaperIds: [],
    questionCount: 30,
    standards: ['varsity', 'medical'],
    questionType: 'mcq',
    durationMinutes: 30,
    negativeMarking: true,
  });

  // Active Exam State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [examResult, setExamResult] = useState<ExamSessionResult | null>(null);

  // Notify App.tsx about flow state (to hide BottomNav)
  useEffect(() => {
    const isSetupOrExam = currentStep !== 'dashboard';
    if (onFlowStateChange) {
      onFlowStateChange(isSetupOrExam);
    }
  }, [currentStep, onFlowStateChange]);

  // Handle Initial Subject/Chapter if passed
  useEffect(() => {
    if (initialChapterId) {
      // Find subject corresponding to chapter
      if (initialChapterId.startsWith('chem')) {
        setSetupState((prev) => ({ ...prev, subjectKey: 'chemistry', subjectName: 'রসায়ন' }));
      } else if (initialChapterId.startsWith('phy')) {
        setSetupState((prev) => ({ ...prev, subjectKey: 'physics', subjectName: 'পদার্থবিজ্ঞান' }));
      } else if (initialChapterId.startsWith('m') || initialChapterId.startsWith('math')) {
        setSetupState((prev) => ({ ...prev, subjectKey: 'math', subjectName: 'উচ্চতর গণিত' }));
      } else if (initialChapterId.startsWith('bio')) {
        setSetupState((prev) => ({ ...prev, subjectKey: 'biology', subjectName: 'জীববিজ্ঞান' }));
      }
      setCurrentStep('topic_select');
    }
  }, [initialChapterId]);

  // Helper to filter / prepare questions
  const prepareQuestions = (config: ExamSetupState): Question[] => {
    let pool = [...questions];

    // Filter by subject
    if (config.subjectKey) {
      const subjectMapping: Record<string, string[]> = {
        chemistry: ['chemistry_1', 'chemistry_2'],
        physics: ['physics_1', 'physics_2'],
        math: ['math_1', 'math_2'],
        biology: ['biology_1', 'biology_2'],
        bangla: ['bangla'],
        english: ['english'],
        gk: ['gk'],
        ict: ['ict'],
        psychology: ['psychology'],
      };

      const validSubjectIds = subjectMapping[config.subjectKey] || [config.subjectKey];
      const filteredBySubject = pool.filter((q) => validSubjectIds.includes(q.subject_id));
      if (filteredBySubject.length > 0) {
        pool = filteredBySubject;
      }
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = Math.min(shuffled.length, config.questionCount || 30);
    return shuffled.slice(0, Math.max(5, count));
  };

  // 1. Dashboard: User selects Subject -> Step 1 (topic_select)
  const handleSelectSubject = (subjectKey: string) => {
    const subj = EXAM_SUBJECTS.find((s) => s.key === subjectKey);
    setSetupState((prev) => ({
      ...prev,
      subjectKey,
      subjectName: subj?.name || 'রসায়ন',
      presetId: null,
      presetOptionalSelected: [],
    }));
    setCurrentStep('topic_select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Dashboard: User selects Preset Exam -> Launches Exam directly
  const handleStartPresetExam = (preset: PresetExamConfig, optionalSelected: string[]) => {
    setSetupState({
      subjectKey: 'preset',
      subjectName: preset.title,
      selectedSubTopicIds: [],
      selectedChapterIds: [],
      selectedPaperIds: [],
      questionCount: preset.totalQuestions,
      standards: ['varsity', 'engineering'],
      questionType: 'mcq',
      durationMinutes: preset.durationMinutes,
      negativeMarking: true,
      presetId: preset.id,
      presetOptionalSelected: optionalSelected,
    });

    // Build preset question set across mandatory and optional subjects
    let presetQuestions: Question[] = [];
    
    // Shuffle and pick
    const allShuffled = [...questions].sort(() => Math.random() - 0.5);
    presetQuestions = allShuffled.slice(0, Math.min(preset.totalQuestions, allShuffled.length));

    setActiveQuestions(presetQuestions);
    setCurrentStep('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Step 1 (topic_select) -> Step 2 (standard_select)
  const handleTopicSelectNext = (data: {
    selectedSubTopicIds: string[];
    selectedChapterIds: string[];
    selectedPaperIds: string[];
    questionCount: number;
  }) => {
    setSetupState((prev) => ({
      ...prev,
      ...data,
    }));
    setCurrentStep('standard_select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Step 2 (standard_select) -> Step 3 (confirm)
  const handleStandardSelectNext = (standards: string[]) => {
    setSetupState((prev) => ({
      ...prev,
      standards,
    }));
    setCurrentStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Step 3 (confirm) -> Step 4 (live)
  const handleConfirmStartExam = (finalState: ExamSetupState) => {
    setSetupState(finalState);
    const prepared = prepareQuestions(finalState);
    setActiveQuestions(prepared);
    setCurrentStep('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 6. Step 4 (live) -> User Finishes Exam -> Step 5 (result_mascot)
  const handleFinishExam = (
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
    timeTakenSeconds: number
  ) => {
    const scoring = calculateExamScore(
      answers,
      activeQuestions,
      setupState.negativeMarking ? 0.25 : 0
    );

    const resultSummary: ExamSessionResult = {
      examTitle: setupState.presetId ? setupState.subjectName : 'মক পরীক্ষা',
      subjectName: setupState.subjectName,
      totalQuestions: scoring.totalMarks,
      score: scoring.score,
      totalMarks: scoring.totalMarks,
      correctCount: scoring.correctCount,
      wrongCount: scoring.wrongCount,
      skippedCount: scoring.skippedCount,
      pointsEarned: scoring.pointsEarned,
      timeTakenMinutes: Math.ceil(timeTakenSeconds / 60),
      timeTakenSeconds,
      questions: activeQuestions,
      userAnswers: answers,
      date: new Date().toLocaleDateString('bn-BD'),
    };

    setExamResult(resultSummary);

    // Update user progress
    const newHistoryItem: ExamHistoryItem = {
      id: 'exam_' + Date.now(),
      title: resultSummary.examTitle,
      subject: setupState.subjectName,
      totalQuestions: resultSummary.totalQuestions,
      score: resultSummary.score,
      correctCount: resultSummary.correctCount,
      wrongCount: resultSummary.wrongCount,
      skippedCount: resultSummary.skippedCount,
      timeTakenSeconds,
      date: new Date().toLocaleDateString('bn-BD'),
      tag: setupState.presetId ? 'Preset' : 'Mock Test',
    };

    const updatedProgress: UserProgress = {
      ...progress,
      points: (progress.points || 0) + scoring.pointsEarned,
      examsCompleted: (progress.examsCompleted || 0) + 1,
      totalCorrect: (progress.totalCorrect || 0) + scoring.correctCount,
      totalWrong: (progress.totalWrong || 0) + scoring.wrongCount,
      streakDays: Math.max(1, progress.streakDays || 1),
      examHistory: [newHistoryItem, ...(progress.examHistory || [])],
    };

    onSaveProgress(updatedProgress);
    setCurrentStep('result_mascot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render current flow step
  switch (currentStep) {
    case 'dashboard':
      return (
        <ExamDashboardPage
          onSelectSubject={handleSelectSubject}
          onStartPresetExam={handleStartPresetExam}
        />
      );

    case 'topic_select':
      return (
        <ExamTopicSelectPage
          subjectKey={setupState.subjectKey}
          onBack={() => {
            setCurrentStep('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNext={handleTopicSelectNext}
          onAddAnotherSubject={() => {
            setCurrentStep('dashboard');
          }}
        />
      );

    case 'standard_select':
      return (
        <ExamStandardSelectPage
          initialStandards={setupState.standards}
          onBack={() => {
            setCurrentStep('topic_select');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNext={handleStandardSelectNext}
        />
      );

    case 'confirm':
      return (
        <ExamConfirmPage
          setupData={setupState}
          onBack={() => {
            setCurrentStep('standard_select');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onStartExam={handleConfirmStartExam}
        />
      );

    case 'live':
      return (
        <ExamLivePage
          title={setupState.presetId ? setupState.subjectName : 'মক পরীক্ষা'}
          durationMinutes={setupState.durationMinutes}
          questions={activeQuestions}
          onFinishExam={handleFinishExam}
          onExit={() => {
            setCurrentStep('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );

    case 'result_mascot':
      if (!examResult) return null;
      return (
        <ExamResultMascotPage
          result={examResult}
          onNext={() => {
            setCurrentStep('result_milestone');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );

    case 'result_milestone':
      return (
        <ExamMilestonePage
          progress={progress}
          onNext={() => {
            setCurrentStep('result_review');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );

    case 'result_review':
      if (!examResult) return null;
      return (
        <ExamReviewPage
          result={examResult}
          bookmarkedIds={progress.bookmarks}
          onBookmarkQuestion={(qId) => {
            const isBookmarked = progress.bookmarks.includes(qId);
            const updatedBookmarks = isBookmarked
              ? progress.bookmarks.filter((id) => id !== qId)
              : [...progress.bookmarks, qId];
            onSaveProgress({
              ...progress,
              bookmarks: updatedBookmarks,
            });
          }}
          onBackToDashboard={() => {
            setCurrentStep('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );

    default:
      return (
        <ExamDashboardPage
          onSelectSubject={handleSelectSubject}
          onStartPresetExam={handleStartPresetExam}
        />
      );
  }
};

export default ExamScreen;
