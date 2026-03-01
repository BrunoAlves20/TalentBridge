export interface Candidate {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  isPrepared: boolean;
  avatar: string;
  skills: string[];
}

export interface AIFeedback {
  category: string;
  score: number;
  label: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
}
