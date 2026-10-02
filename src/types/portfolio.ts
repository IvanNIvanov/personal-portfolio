export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string[];
  logo?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  period: string;
  location?: string;
  logo?: string;
  description?: string[];
}

export interface SkillItem {
  name: string;
  slug?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  iconType: "automation" | "technical" | "data" | "leadership" | "code" | "database" | "cpu";
  skills: SkillItem[];
}

export interface Certification {
  id: string;
  title: string;
  provider: string;
  date: string;
  certId?: string;
  link?: string;
  logo?: string;
  fullImage?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface PortfolioData {
  hero: {
    badge: string;
    headlineStart: string;
    headlineMuted: string;
    headlineMiddle: string;
    headlineAccent: string;
    headlineEnd: string;
    subheading: string;
    cvUrl: string;
    cvFileName: string;
    cvUpdatedAt: string;
  };
  about: {
    paragraphs: string[];
    yearsExperience: string;
    yearsLabel: string;
    projectsCompleted: string;
    projectsLabel: string;
    profileImage: string;
  };
  experiences: Experience[];
  education?: Education[];
  skills: SkillCategory[];
  certifications: Certification[];
  contact: {
    email: string;
    linkedIn: string;
    location: string;
    ctaTitle: string;
    ctaSubtitle: string;
    availabilityText: string;
  };
}
