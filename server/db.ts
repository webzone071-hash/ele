import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ============================================================
// DATA DIRECTORY
// ============================================================

const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");

// ============================================================
// DOCUMENT INTERFACES
// ============================================================

export interface SiteSettingsDoc {
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
}

export interface NavigationItemDoc {
  id: string;
  name: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
}

export interface SocialLinkDoc {
  id: string;
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface HomepageSectionDoc {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  displayOrder: number;
}

export interface HeroSettingsDoc {
  id: string;
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

export interface ServiceDoc {
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

export interface PortfolioDoc {
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

export interface FiverrServiceDoc {
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

export interface TestimonialDoc {
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

export interface TeamMemberDoc {
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

export interface FAQDoc {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProcessStepDoc {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface LeadDoc {
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
  status:
    | "new"
    | "contacted"
    | "in_progress"
    | "converted"
    | "closed";
  createdAt: string;
  notes?: string;
}

export interface NewsletterSubscriberDoc {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  createdAt: string;
}

export interface MediaDoc {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface AdminUserDoc {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface VisitorLogDoc {
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

export interface BlockedIpDoc {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  blockedUntil: string;
  requestsInWindow: number;
  isManual: boolean;
}

export interface DdosEventDoc {
  id: string;
  ip: string;
  timestamp: string;
  requestsCount: number;
  windowMs: number;
  action: string;
  details: string;
}

export interface DatabaseState {
  settings: SiteSettingsDoc;
  hero: HeroSettingsDoc;
  navigation: NavigationItemDoc[];
  socialLinks: SocialLinkDoc[];
  sections: HomepageSectionDoc[];
  services: ServiceDoc[];
  portfolio: PortfolioDoc[];
  fiverrServices: FiverrServiceDoc[];
  testimonials: TestimonialDoc[];
  team: TeamMemberDoc[];
  faqs: FAQDoc[];
  process: ProcessStepDoc[];
  leads: LeadDoc[];
  subscribers: NewsletterSubscriberDoc[];
  media: MediaDoc[];
  admins: AdminUserDoc[];
  visitors: VisitorLogDoc[];
  blockedIps: BlockedIpDoc[];
  ddosEvents: DdosEventDoc[];
}

// ============================================================
// RESILIENT DATABASE
// ============================================================

class ResilientDB {
  private state: DatabaseState | null = null;

  private isMongoConnected = false;

  constructor() {
    this.init();
  }

  // ==========================================================
  // INITIALIZATION
  // ==========================================================

  private async syncAdminFromEnv() {
    if (!this.state) {
      return;
    }

    if (!this.state.admins) {
      this.state.admins = [];
    }

    // Actively purge all legacy demo accounts
    const initialLen = this.state.admins.length;
    this.state.admins = this.state.admins.filter(
      (a) =>
        a.email.trim().toLowerCase() !== "admin@apexcorelabs.com" &&
        a.email.trim().toLowerCase() !== "admin@apexagency.io" &&
        a.email.trim().toLowerCase() !== "admin@gmail.com"
    );
    let stateChanged = this.state.admins.length !== initialLen;

    const configuredEmail = (process.env.ADMIN_EMAIL || "admin@techelevant.com").trim().toLowerCase();
    const configuredPassword = process.env.ADMIN_PASSWORD || "Admin@Tech2026!";

    const accounts = [
      {
        email: configuredEmail,
        password: configuredPassword,
        name: "Tech Elevant Administrator",
        role: "superadmin",
      },
    ];

    for (const acc of accounts) {
      const existing = this.state.admins.find(
        (a) => a.email.trim().toLowerCase() === acc.email.toLowerCase()
      );

      if (!existing) {
        const passwordHash = await bcrypt.hash(acc.password, 12);
        this.state.admins.push({
          id: "admin-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          email: acc.email.toLowerCase(),
          passwordHash,
          name: acc.name,
          role: acc.role,
          createdAt: new Date().toISOString(),
        });
        stateChanged = true;
        console.log(`[AUTH] Admin account ready: ${acc.email}`);
      } else {
        const passwordMatches = await bcrypt.compare(
          acc.password,
          existing.passwordHash
        );
        if (!passwordMatches) {
          existing.passwordHash = await bcrypt.hash(acc.password, 12);
          stateChanged = true;
          console.log(`[AUTH] Admin password updated: ${acc.email}`);
        }
      }
    }

    if (stateChanged) {
      this.save();
    }
  }

  private async init() {
    console.log("");
    console.log("==============================================");
    console.log("[ResilientDB] Starting database initialization");
    console.log("==============================================");

    this.loadLocalDatabase();

    // Synchronize administrators
    await this.syncAdminFromEnv();

    // Connect to MongoDB Atlas (graceful fallback if IP pending whitelist)
    void this.connectMongo();

    console.log("==============================================");
    console.log("[ResilientDB] Initialization complete");
    console.log("==============================================");
    console.log("");
  }

  // ==========================================================
  // LOAD LOCAL DATABASE
  // ==========================================================

  private loadLocalDatabase() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");

        this.state = JSON.parse(raw) as DatabaseState;

        console.log(
          "[ResilientDB] Loaded existing data store from data/db.json"
        );
      } catch (error) {
        console.error(
          "[ResilientDB] Failed to read data/db.json:",
          error
        );

        this.state = null;
      }
    }

    if (this.state) {
      this.ensureStateCompatibility();
    }

    if (!this.state) {
      this.resetToSeed();
    }
  }

  // ==========================================================
  // ENSURE OLD DB.JSON IS COMPATIBLE
  // ==========================================================

  private ensureStateCompatibility() {
    if (!this.state) return;

    if (!this.state.visitors) {
      this.state.visitors = [];
    }

    if (!this.state.blockedIps) {
      this.state.blockedIps = [];
    }

    if (!this.state.ddosEvents) {
      this.state.ddosEvents = [];
    }

    if (!this.state.leads) {
      this.state.leads = [];
    }

    if (!this.state.subscribers) {
      this.state.subscribers = [];
    }

    if (!this.state.media) {
      this.state.media = [];
    }

    if (!this.state.admins) {
      this.state.admins = [];
    }

    if (
      this.state.settings &&
      !this.state.settings.logoText
    ) {
      this.state.settings.logoText = "APEX";
    }

    if (
      this.state.settings &&
      !this.state.settings.logoType
    ) {
      this.state.settings.logoType = "both";
    }

    if (
      this.state.settings &&
      !this.state.settings.faviconUrl
    ) {
      this.state.settings.faviconUrl =
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80";
    }
  }

  // ==========================================================
  // MONGODB CONNECTION
  // ==========================================================

  private async connectMongo() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn("");
      console.warn("==============================================");
      console.warn("[MongoDB] ⚠️ MONGODB_URI NOT FOUND");
      console.warn("[MongoDB] Add MONGODB_URI to your .env file.");
      console.warn("[MongoDB] Example:");
      console.warn(
        "[MongoDB] MONGODB_URI=mongodb+srv://..."
      );
      console.warn("==============================================");
      console.warn("");

      return;
    }

    if (mongoose.connection.readyState === 1) {
      this.isMongoConnected = true;

      console.log(
        "[MongoDB] ✅ Already connected"
      );

      return;
    }

    try {
      console.log("[MongoDB] 🔄 Checking MongoDB Atlas connection...");

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 30000,
      });

      this.isMongoConnected = true;

      console.log("[MongoDB] ✅ CONNECTED SUCCESSFULLY TO ATLAS");
      console.log(`[MongoDB] Host: ${mongoose.connection.host}`);
      console.log(`[MongoDB] Database: ${mongoose.connection.name}`);
    } catch (error) {
      this.isMongoConnected = false;

      console.log("[MongoDB] ℹ️ MongoDB Atlas cluster currently unreachable or awaiting IP access list (0.0.0.0/0 in Atlas).");
      console.log("[MongoDB] 🛡️ Active Database Mode: Resilient Local JSON Engine (data/db.json) — all CMS and public features fully operational.");
    }

    // ========================================================
    // CONNECTION EVENTS
    // ========================================================

    mongoose.connection.on("connected", () => {
      this.isMongoConnected = true;
      console.log("[MongoDB] ✅ Connection established");
    });

    mongoose.connection.on("error", (error) => {
      this.isMongoConnected = false;
      // Graceful notice without crashing
    });

    mongoose.connection.on("disconnected", () => {
      this.isMongoConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      this.isMongoConnected = true;
      console.log("[MongoDB] ✅ Reconnected successfully");
    });
  }

  // ==========================================================
  // DATABASE STATUS
  // ==========================================================

  public getMongoStatus() {
    const readyState = mongoose.connection.readyState;

    return {
      connected:
        this.isMongoConnected && readyState === 1,

      readyState,

      state:
        readyState === 0
          ? "disconnected"
          : readyState === 1
          ? "connected"
          : readyState === 2
          ? "connecting"
          : readyState === 3
          ? "disconnecting"
          : "unknown",

      host:
        mongoose.connection.host || null,

      database:
        mongoose.connection.name || null,

      hasMongoUri:
        Boolean(process.env.MONGODB_URI),
    };
  }

  // ==========================================================
  // SAVE LOCAL DATABASE
  // ==========================================================

  public save() {
    if (!this.state) {
      return;
    }

    try {
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
          this.state,
          null,
          2
        ),
        "utf-8"
      );
    } catch (error) {
      console.error(
        "[ResilientDB] Error saving database:",
        error
      );
    }
  }

  // ==========================================================
  // GET STATE
  // ==========================================================

  public getState(): DatabaseState {
    if (!this.state) {
      this.resetToSeed();
    }

    return this.state!;
  }

  // ==========================================================
  // RESET / SEED
  // ==========================================================

  public resetToSeed() {
    const defaultPasswordHash =
      bcrypt.hashSync(
        process.env.ADMIN_PASSWORD ||
          "ApexAdmin2026!",
        10
      );

    this.state = {
      settings: {
        id: "site-settings-1",
        agencyName: "ApexCore Labs",
        shortName: "ApexCore",
        tagline:
          "High-Performance Software & AI Systems for Global Enterprises",
        description:
          "We architect and engineer mission-critical web applications, enterprise SaaS platforms, AI systems, and cloud infrastructure for international market leaders.",
        email: "contact@apexcorelabs.com",
        phone: "+1 (415) 890-3420",
        whatsapp: "+14158903420",
        address:
          "750 Montgomery St, Suite 400, San Francisco, CA 94111, United States",
        officeHours:
          "Mon - Fri: 9:00 AM - 6:00 PM EST (24/7 Enterprise Support)",
        logoUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
        darkLogoUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
        logoText: "APEX",
        logoType: "both",
        faviconUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=80",
        brandColor: "#0F172A",
        secondaryColor: "#2563EB",
        seoTitle:
          "ApexCore Labs | High-End International Software Agency",
        seoDescription:
          "Award-winning software development agency delivering bespoke web apps, mobile apps, AI integrations, and cloud architectures for US, UK, UAE & European clients.",
        seoKeywords:
          "software development agency, web development, custom software, AI agents, SaaS engineering, mobile app development, international software company",
        footerText:
          "ApexCore Labs is an international software development powerhouse engineering bespoke digital ecosystems and scalable software products for ambitious global brands.",
        copyrightText:
          "© 2026 ApexCore Labs. All Rights Reserved.",
        updatedAt:
          new Date().toISOString(),
      },

      hero: {
        id: "hero-settings-1",
        badgeText:
          "Accepting Q3 / Q4 Enterprise Projects",
        heading:
          "Building Digital Products That Move",
        highlightedHeading:
          "Global Businesses Forward.",
        description:
          "We design, architect, and engineer high-performance web applications, enterprise AI systems, and scalable mobile products for visionary companies across USA, UK, UAE, and Europe.",
        primaryCtaText:
          "Start Your Project",
        primaryCtaUrl:
          "/get-in-touch",
        secondaryCtaText:
          "View Our Work",
        secondaryCtaUrl:
          "/portfolio",
        heroImageUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
        stats: [
          {
            label: "Delivered Projects",
            value: "140+",
          },
          {
            label: "Global Enterprise Clients",
            value: "65+",
          },
          {
            label: "Countries Served",
            value: "18+",
          },
          {
            label: "Client Satisfaction",
            value: "99.4%",
          },
        ],
        clientAvatars: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        ],
      },

      navigation: [
        {
          id: "nav-1",
          name: "Home",
          url: "/",
          displayOrder: 1,
          isActive: true,
          openInNewTab: false,
        },
        {
          id: "nav-2",
          name: "About Us",
          url: "/about",
          displayOrder: 2,
          isActive: true,
          openInNewTab: false,
        },
        {
          id: "nav-3",
          name: "Services",
          url: "/services",
          displayOrder: 3,
          isActive: true,
          openInNewTab: false,
        },
        {
          id: "nav-4",
          name: "Portfolio",
          url: "/portfolio",
          displayOrder: 4,
          isActive: true,
          openInNewTab: false,
        },
        {
          id: "nav-5",
          name: "Contact Us",
          url: "/contact",
          displayOrder: 5,
          isActive: true,
          openInNewTab: false,
        },
        {
          id: "nav-6",
          name: "GET IN TOUCH",
          url: "/get-in-touch",
          displayOrder: 6,
          isActive: true,
          openInNewTab: false,
        },
      ],

      socialLinks: [
        {
          id: "soc-1",
          platform: "LinkedIn",
          url: "https://linkedin.com/company/apexcore-labs",
          icon: "Linkedin",
          isActive: true,
          displayOrder: 1,
        },
        {
          id: "soc-2",
          platform: "GitHub",
          url: "https://github.com/apexcore-labs",
          icon: "Github",
          isActive: true,
          displayOrder: 2,
        },
        {
          id: "soc-3",
          platform: "X / Twitter",
          url: "https://x.com/apexcorelabs",
          icon: "Twitter",
          isActive: true,
          displayOrder: 3,
        },
        {
          id: "soc-4",
          platform: "Fiverr",
          url: "https://www.fiverr.com",
          icon: "ExternalLink",
          isActive: true,
          displayOrder: 4,
        },
        {
          id: "soc-5",
          platform: "Instagram",
          url: "https://instagram.com/apexcorelabs",
          icon: "Instagram",
          isActive: true,
          displayOrder: 5,
        },
      ],

      sections: [],

      services: [],

      portfolio: [],

      fiverrServices: [],

      testimonials: [],

      team: [],

      faqs: [],

      process: [],

      leads: [],

      subscribers: [],

      media: [],

      admins: [
        {
          id: "admin-techelevant",
          email:
            (process.env.ADMIN_EMAIL || "admin@techelevant.com").trim().toLowerCase(),
          passwordHash:
            defaultPasswordHash,
          name: "Tech Elevant Administrator",
          role: "superadmin",
          createdAt:
            new Date().toISOString(),
        },
      ],

      visitors: [],

      blockedIps: [],

      ddosEvents: [],
    };

    this.save();

    console.log(
      "[ResilientDB] Database initialized."
    );
  }
}

// ============================================================
// EXPORT SINGLE DATABASE INSTANCE
// ============================================================

export const db = new ResilientDB();

// ============================================================
// OPTIONAL: GRACEFUL MONGODB SHUTDOWN
// ============================================================

process.on(
  "SIGINT",
  async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();

        console.log(
          "[MongoDB] Connection closed."
        );
      }
    } catch (error) {
      console.error(
        "[MongoDB] Error during shutdown:",
        error
      );
    }

    process.exit(0);
  }
);

process.on(
  "SIGTERM",
  async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();

        console.log(
          "[MongoDB] Connection closed."
        );
      }
    } catch (error) {
      console.error(
        "[MongoDB] Error during shutdown:",
        error
      );
    }

    process.exit(0);
  }
);