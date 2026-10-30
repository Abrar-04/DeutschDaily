export type Level = 'A2' | 'B1' | 'B2';
export type LevelFilter = Level | 'All';

export interface QuizQuestion {
  question: string;
  options: [string, string, string];
  answer: number;
  explanation: string;
}

export interface Story {
  id: string;
  level: Level;
  title: string;
  subtitle: string;
  category: string;
  emoji: string;
  color: 'peach' | 'lavender' | 'sage' | 'sky' | 'butter' | 'rose';
  german: string[];
  english: string[];
  questions: [QuizQuestion, QuizQuestion, QuizQuestion];
}
