export type Candidate = {
    id: string;
    name: string;
    role: string;
    matchScore: number;
    isPrepared: boolean;
    avatar: string;
    skills: string[];
};

export type AIFeedback = {
    category: string;
    score: number;
    label: string;
};

export type JobPosting = {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
};
