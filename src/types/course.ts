// src/types/course.ts
export interface Course {
    id: number | string;
    title: string;
    difficulty: string;
    coverImage?: string;
    totalChapters?: number;
    finishedChapters?: number;
  }
