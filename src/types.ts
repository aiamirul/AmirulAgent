export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isIntro?: boolean;
  isRomanticSurvey?: boolean;
  romanticSurveyStep?: number;
  romanticSurveyAnswers?: {
    straight?: string;
    female?: string;
    bdsm?: string;
    iceCream?: string;
  };
  romanticSurveyCompleted?: boolean;
}

export interface ProfileDetails {
  name: string;
  title: string;
  currentRole: string;
  location: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedInUrl: string;
  websiteUrl: string;
  avatarUrl: string;
  aboutBrief: string;
  aboutLong: string;
  resumeSubtitle: string;
  googleScholarUrl?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
  techUsed: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  briefDescription: string;
  longDescription: string;
  coverImage: string;
  tags: string[];
  githubLink: string;
  liveLink: string;
  featured: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  level: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  url: string;
  description: string;
  pdfFileName?: string;
  pdfUrl?: string;
  publicationDate?: string;
}

export interface AmirulFullData {
  profile: ProfileDetails;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  blogs: BlogItem[];
  publications: PublicationItem[];
}
