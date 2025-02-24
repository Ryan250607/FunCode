// src/types/chapter.ts
export interface Chapter {
    id: number | string;
    title: string;
    description?: string;
    status?: number; // 0: 未完成, 1: 已完成
    videoUrl?: string;
  }