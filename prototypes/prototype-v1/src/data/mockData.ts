import { Candidate, AIFeedback, JobPosting } from '../types';

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Ana Paula Silva',
    role: 'Desenvolvedora Front-end',
    matchScore: 95,
    isPrepared: true,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
    skills: ['React', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: '2',
    name: 'Carlos Eduardo Santos',
    role: 'Desenvolvedor Front-end',
    matchScore: 88,
    isPrepared: true,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
    skills: ['React', 'JavaScript', 'CSS']
  },
  {
    id: '3',
    name: 'Marina Costa',
    role: 'Desenvolvedora Front-end',
    matchScore: 76,
    isPrepared: false,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
    skills: ['Vue.js', 'JavaScript', 'HTML/CSS']
  }
];

export const mockAIFeedback: AIFeedback[] = [
  {
    category: 'Comunicação',
    score: 92,
    label: 'Excelente'
  },
  {
    category: 'Conhecimento Técnico',
    score: 88,
    label: 'Muito Bom'
  },
  {
    category: 'Clareza',
    score: 95,
    label: 'Excepcional'
  }
];

export const aiInterviewQuestion = "Como você lidaria com um conflito de estado no React quando múltiplos componentes precisam compartilhar dados?";

export const mockJobPostings: JobPosting[] = [
  {
    id: '1',
    title: 'Desenvolvedor Front-end Sênior',
    company: 'Tech Solutions',
    location: 'São Paulo, SP',
    type: 'Remoto'
  },
  {
    id: '2',
    title: 'Engenheiro Full Stack',
    company: 'Startup Inovadora',
    location: 'Rio de Janeiro, RJ',
    type: 'Híbrido'
  },
  {
    id: '3',
    title: 'Tech Lead React',
    company: 'Enterprise Corp',
    location: 'Belo Horizonte, MG',
    type: 'Presencial'
  }
];
