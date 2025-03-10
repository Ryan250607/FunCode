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

// 评判状态类型
export type JudgeStatus = 
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED';

// 提交记录接口
export interface SubmitRecord {
  id: string | number;
  problemId: string | number;
  title: string;
  code: string;
  language: string;
  judgeStatus: JudgeStatus;
  executionTime: number | null;
  memoryUsed: number | null;
  errorMessage: string | null;
  submitTime: string;
}

// 查询参数接口
export interface QueryParams {
  pageNum: number;
  pageSize: number;
  problemId?: string | number;
  judgeStatus?: string;
  language?: string;
}

// API 响应接口
export interface ListResponse {
  rows: SubmitRecord[];
  total: number;
}