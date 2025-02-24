// src/types/feedback.ts
export interface FeedbackForm {
    feedbackType?: number | string;
    courseId?: number | string;
    rating?: number;
    content?: string;
    attachment?: string;
  }