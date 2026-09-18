export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  category: 'skill' | 'interest' | 'personality' | 'refinement';
}

export interface AssessmentResult {
  userId: string;
  timestamp: number;
  answers: Record<string, string>;
  suggestedCareers: string[];
}

export interface CareerRoadmap {
  careerTitle: string;
  description: string;
  steps: {
    title: string;
    description: string;
    duration: string;
  }[];
  salaryData: {
    region: 'India' | 'Global';
    entry: number;
    mid: number;
    senior: number;
    currency: 'INR' | 'USD';
  }[];
  skillsToAcquire: string[];
}

export interface FeedbackSummary {
  userId: string;
  timestamp: number;
  strengths: string[];
  improvementAreas: string[];
  progress: number; // 0-100
}

export interface InterviewSession {
  id: string;
  userId: string;
  careerPath: string;
  transcript: {
    role: 'ai' | 'user';
    content: string;
  }[];
  feedback?: string;
  timestamp: number;
}
