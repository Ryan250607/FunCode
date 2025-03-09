export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'solved' | 'attempted' | 'unsolved';

export interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  acceptRate: number;
  tags: string[];
  initialCode?: string;
  solutions?: QuestionSolution[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionSolution {
  id: number;
  questionId: number;
  code: string;
  language: string;
  executionTime: number;
  memoryUsage: number;
  createdAt: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examples: Example[];
  hints?: string[];
  templates?: Record<string, string>;
}

export type SubmissionStatus = 
  | 'idle'
  | 'submitting'
  | 'ACCEPTED'
  | 'wrong_answer'
  | 'compile_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'error';

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface SubmissionResult {
  status: SubmissionStatus;
  message?: string;
  executionTime: number;
  memoryUsage: number;
  testCaseResults?: TestCaseResult[];
  compileError?: string;
  runtimeError?: string;
}

export interface SubmissionRequest {
  problemId: string;
  language: string;
  code: string;
}