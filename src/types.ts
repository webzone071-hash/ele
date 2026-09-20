export interface SiteSettings {
  id: string;
  agencyName: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  officeHours: string;
  logoUrl: string;
  darkLogoUrl: string;
  logoText?: string;
  logoType?: "text" | "image" | "both";
  faviconUrl: string;
  brandColor: string;
  secondaryColor: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  footerText: string;
  copyrightText: string;
  updatedAt: string;
  metaTitle?: string;
}

export type AgencySettings = SiteSettings;

export interface NavigationItem {
  id: string;
  name: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface SectionConfig {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  displayOrder: number;
}

export interface HeroData {
  id?: string;
  badgeText: string;
  heading: string;
  highlightedHeading: string;
  description: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  heroImageUrl: string;
  stats: { label: string; value: string }[];
  clientAvatars: string[];
}

export type HeroSettings = HeroData;

export interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  technologies: string[];
  benefits: string[];
  process: string[];
  ctaText: string;
  ctaUrl: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Portfolio {
  id: string;
  title: string;
  slug: string;
  client: string;
  category: string;
  shortDescription: string;
  challenge: string;
  solution: string;
  result: string;
  technologies: string[];
  coverImage: string;
  gallery: string[];
  projectUrl: string;
  githubUrl?: string;
  metrics: { label: string; value: string }[];
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export type PortfolioItem = Portfolio;

export interface FiverrService {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  startingPrice: number;
  rating: number;
  reviewsCount: number;
  fiverrUrl: string;
  thumbnail: string;
  deliveryTimeDays: number;
  features: string[];
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  position: string;
  company: string;
  country: string;
  avatarUrl: string;
  rating: number;
  quote: string;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  avatarUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProcessStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Lead {
  id: string;
  type: "contact" | "consultation";
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  projectDetails: string;
  status: "new" | "contacted" | "in_progress" | "converted" | "closed";
  createdAt: string;
  notes?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  createdAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export interface VisitorLog {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  page: string;
  referrer?: string;
  userAgent: string;
  device: string;
  browser: string;
  timestamp: string;
  requestCount: number;
  status: "normal" | "flagged" | "blocked";
}

export interface VisitorAnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits?: number;
  visitsToday?: number;
  recentVisitors?: VisitorLog[];
  recentLogs?: VisitorLog[];
  countryStats?: {
    country: string;
    code: string;
    flag: string;
    count: number;
    percentage: number;
  }[];
  topPages?: { page: string; count: number }[];
  countryBreakdown?: { country: string; count: number }[];
  deviceBreakdown?: { device: string; count: number }[];
  data?: any;
}

export interface BlockedIp {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  blockedUntil: string;
  requestsInWindow: number;
  isManual: boolean;
}

export interface DdosEvent {
  id: string;
  ip: string;
  timestamp: string;
  requestsCount: number;
  windowMs: number;
  action: string;
  details: string;
}

export interface DdosSecurityStatus {
  isEnabled: boolean;
  rateLimitPerMinute: number;
  blockDurationMinutes: number;
  activeBlockedIps: BlockedIp[];
  recentEvents: DdosEvent[];
  stats: {
    totalBlocked: number;
    activeThreats: number;
    normalTrafficRate: number;
  };
}

export interface BootstrapData {
  settings: SiteSettings;
  hero: HeroData;
  navigation: NavigationItem[];
  socialLinks: SocialLink[];
  sections: SectionConfig[];
  services: Service[];
  portfolio: Portfolio[];
  fiverrServices: FiverrService[];
  testimonials: Testimonial[];
  team: TeamMember[];
  faqs: FAQ[];
  process: ProcessStep[];
  leads?: Lead[];
}
