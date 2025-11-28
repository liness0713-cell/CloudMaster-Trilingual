export interface ContentText {
  en: string;
  zh: string;
  jp: string;
  jp_ruby: string; // HTML string with <ruby> tags
}

export interface QuizOption {
  id: number;
  text: ContentText;
}

export interface QuizQuestion {
  id: string;
  context: ContentText | null; // Optional scenario description
  question: ContentText;
  options: QuizOption[];
  correctId: number;
  explanation: ContentText;
}

export interface StudyModule {
  id: string;
  title: ContentText;
  description: ContentText;
  keyPoints: ContentText[];
}

export interface ExamDomain {
  id: string;
  title: string; // English title for internal tracking
  displayTitle: ContentText;
  percentage: number;
  description: ContentText;
}

export interface AwsExam {
  code: string;
  name: string;
  level: 'Foundational' | 'Associate' | 'Professional' | 'Specialty';
  description: string;
  color: string;
}

export type ViewState = 'HOME' | 'SYLLABUS' | 'STUDY' | 'QUIZ' | 'SIMULATION';

export enum LanguageMode {
  ALL = 'ALL', // Show all languages
  EN = 'EN',
  ZH = 'ZH',
  JP = 'JP',
  JP_RUBY = 'JP_RUBY'
}