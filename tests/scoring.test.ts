import { describe, it, expect } from 'vitest';

// Question Type
interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  questionText: string;
  correctAnswer: string;
  options?: QuestionOption[];
}

// Exam Scoring Logic Implementation
export function calculateExamScore(
  answers: Record<string, string>,
  questions: Question[],
  negativeMarking: number = 0.25
) {
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  for (const q of questions) {
    const selected = answers[q.id];
    if (!selected) {
      skippedCount++;
    } else if (selected.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
      correctCount++;
    } else {
      wrongCount++;
    }
  }

  const score = correctCount * 1.0 - wrongCount * negativeMarking;
  const accuracy = correctCount + wrongCount > 0 ? (correctCount / (correctCount + wrongCount)) * 100 : 0;

  return {
    correctCount,
    wrongCount,
    skippedCount,
    score: Math.max(0, Number(score.toFixed(2))),
    accuracy: Number(accuracy.toFixed(1)),
  };
}

describe('Exam Scoring Logic & Negative Marking', () => {
  const sampleQuestions: Question[] = [
    { id: 'q1', questionText: 'Q1', correctAnswer: 'A' },
    { id: 'q2', questionText: 'Q2', correctAnswer: 'B' },
    { id: 'q3', questionText: 'Q3', correctAnswer: 'C' },
    { id: 'q4', questionText: 'Q4', correctAnswer: 'D' },
  ];

  it('calculates perfect score when all answers are correct', () => {
    const answers = { q1: 'A', q2: 'B', q3: 'C', q4: 'D' };
    const result = calculateExamScore(answers, sampleQuestions, 0.25);

    expect(result.correctCount).toBe(4);
    expect(result.wrongCount).toBe(0);
    expect(result.skippedCount).toBe(0);
    expect(result.score).toBe(4.0);
    expect(result.accuracy).toBe(100.0);
  });

  it('applies negative marking (0.25) for incorrect answers', () => {
    const answers = { q1: 'A', q2: 'C', q3: 'C', q4: 'A' }; // q1 (correct), q2 (wrong), q3 (correct), q4 (wrong)
    const result = calculateExamScore(answers, sampleQuestions, 0.25);

    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(2);
    expect(result.skippedCount).toBe(0);
    expect(result.score).toBe(1.5); // 2 - (2 * 0.25) = 1.5
    expect(result.accuracy).toBe(50.0);
  });

  it('handles skipped questions without negative marking penalty', () => {
    const answers = { q1: 'A' }; // 1 correct, 3 skipped
    const result = calculateExamScore(answers, sampleQuestions, 0.25);

    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(0);
    expect(result.skippedCount).toBe(3);
    expect(result.score).toBe(1.0);
    expect(result.accuracy).toBe(100.0);
  });
});
