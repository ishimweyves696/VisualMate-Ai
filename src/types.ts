export type Subject = 'Science' | 'History' | 'Math' | 'Geography' | 'Biology' | 'Physics' | 'Art' | 'General';
export type GradeLevel = 'Elementary' | 'Middle School' | 'High School' | 'University';
export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Chinese' | 'Japanese';
export type VisualStyle = 'Diagram' | 'Illustration' | 'Infographic' | 'Sketch' | '3D Render' | 'Minimalist';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type NodeType = 'input' | 'process' | 'output' | 'concept' | 'event';

export type PlanType = 'FREE' | 'PRO' | 'STUDIO';
export type BillingCycle = 'monthly' | 'yearly';

export interface UserSubscription {
  plan: PlanType;
  billingCycle: BillingCycle;
  usedToday: number;
  usedThisMonth: number;
  lastResetDate: number;
  status: 'active' | 'canceled';
  renewalDate: number;
}

export interface UserSettings {
  onboardingCompleted: boolean;
  theme: 'light' | 'dark';
}

export interface AppAnalytics {
  totalGenerations: number;
  mostFrequentTopics: string[];
  upgradeModalTriggers: number;
  sessionCount: number;
}

export interface VisualNode {
  id: string;
  label: string;
  type: NodeType;
  description: string;
}

export interface VisualEdge {
  from: string;
  to: string;
  label?: string;
}

export interface VisualData {
  id: string;
  topic: string;
  subject: Subject;
  gradeLevel: GradeLevel;
  language: Language;
  style: VisualStyle;
  title: string;
  description: string;
  nodes: VisualNode[];
  edges: VisualEdge[];
  notes?: string[];
  imagePrompt: string;
  imageUrl?: string;
  createdAt: number;
  commentary?: string;
  category?: string;
  isPublicSample?: boolean;
}

export interface AnalysisResult {
  title: string;
  description: string;
  nodes: VisualNode[];
  edges: VisualEdge[];
  notes?: string[];
  imagePrompt: string;
  commentary: string;
  contextFeedback?: {
    type: 'vague' | 'complex' | 'simple' | 'optimal';
    message: string;
  };
}
