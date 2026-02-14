
export enum Difficulty {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  DIFFICULT = 'DIFFICULT'
}

export enum ScenarioType {
  HARDSHIP = 'Financial Hardship',
  JOB_LOSS = 'Job Loss',
  MEDICAL = 'Medical Expenses',
  FORGETFUL = 'Forgetfulness',
  CONFUSION = 'Billing Confusion',
  LIMITED_FUNDS = 'Limited Funds',
  RESISTANCE = 'Resistance/Frustration',
  CUSTOM = 'Custom Reason'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface SimulationState {
  isActive: boolean;
  difficulty: Difficulty;
  scenario: string; // Changed from ScenarioType enum to string to support custom input
  balance: number;
  customerName: string;
  messages: Message[];
  feedback: string | null;
}

export interface FeedbackData {
  clarity: string;
  empathy: string;
  negotiation: string;
  professionalism: string;
  score: number;
  tips: string[];
}
