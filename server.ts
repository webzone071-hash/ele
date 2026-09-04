import "dotenv/config";

import express, {
  Request,
  Response,
  NextFunction,
} from "express";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { isIP } from "net";

import {
  db,
  BlockedIpDoc,
  DdosEventDoc,
  VisitorLogDoc,
} from "./server/db";

// ============================================================
// ENVIRONMENT
// ============================================================

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "apex_secure_jwt_secret_change_in_production_2026";

const PORT = Number(process.env.PORT || 3000);

if (!process.env.JWT_SECRET) {
  console.warn(
    "[AUTH] WARNING: JWT_SECRET is not configured. Set a strong JWT_SECRET in .env."
  );
}

console.log("[AUTH] ADMIN_EMAIL configured:", !!process.env.ADMIN_EMAIL);
console.log(
  "[AUTH] ADMIN_PASSWORD configured:",
  !!process.env.ADMIN_PASSWORD
);

// ============================================================
// ANTI-DDOS CONFIGURATION
// ============================================================

const ipRequestWindow = new Map<string, number[]>();

const DDOS_REQUEST_THRESHOLD = 20;
const DDOS_WINDOW_MS = 10 * 1000;
const DDOS_BAN_DURATION_MS = 60 * 60 * 1000;

// ============================================================
// CLIENT IP
// ============================================================

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    const first = forwarded
      .split(",")[0]
      ?.trim();

    if (first && isIP(first)) {
      return first;
    }
  }

  const realIp = req.headers["x-real-ip"];

  if (typeof realIp === "string") {
    const cleanRealIp = realIp.trim();

    if (cleanRealIp && isIP(cleanRealIp)) {
      return cleanRealIp;
    }
  }

  const socketIp = req.socket.remoteAddress;

  if (socketIp) {
    // Handle IPv4-mapped IPv6 addresses.
    if (socketIp.startsWith("::ffff:")) {
      const ipv4 = socketIp.substring(7);

      if (isIP(ipv4)) {
        return ipv4;
      }
    }

    if (isIP(socketIp)) {
      return socketIp;
    }
  }

  return "127.0.0.1";
}

// ============================================================
// USER AGENT
// ============================================================

function parseUserAgent(
  ua: string = ""
): {
  device: string;
  browser: string;
} {
  let device = "Desktop";

  if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) {
    device = "Mobile";
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    device = "Tablet";
  }

  let browser = "Chrome";

  if (/edg/i.test(ua)) {
    browser = "Edge";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (
    /safari/i.test(ua) &&
    !/chrome|crios/i.test(ua)
  ) {
    browser = "Safari";
  } else if (/opr|opera/i.test(ua)) {
    browser = "Opera";
  } else if (/curl|wget|python|bot|crawler/i.test(ua)) {
    browser = "Bot/CLI";
  }

  return {
    device,
    browser,
  };
}

// ============================================================
// COUNTRY DATA
// ============================================================

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  BD: "🇧🇩",
  CA: "🇨🇦",
  AE: "🇦🇪",
  SG: "🇸🇬",
  AU: "🇦🇺",
  NL: "🇳🇱",
  FR: "🇫🇷",
  JP: "🇯🇵",
  IN: "🇮🇳",
  CH: "🇨🇭",
  SE: "🇸🇪",
  BR: "🇧🇷",
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  BD: "Bangladesh",
  CA: "Canada",
  AE: "United Arab Emirates",
  SG: "Singapore",
  AU: "Australia",
  NL: "Netherlands",
  FR: "France",
  JP: "Japan",
  IN: "India",
  CH: "Switzerland",
  SE: "Sweden",
  BR: "Brazil",
};

// ============================================================
// GEO RESOLUTION
// ============================================================

function resolveGeo(
  req: Request,
  clientHint?: {
    timezone?: string;
  }
): {
  country: string;
  code: string;
  city: string;
  flag: string;
} {
  const cfCountry = String(
    req.headers["cf-ipcountry"] || ""
  ).toUpperCase();

  const xCountry = String(
    req.headers["x-country-code"] || ""
  ).toUpperCase();

  const headerCode = cfCountry || xCountry;

  if (
    headerCode &&
    COUNTRY_NAMES[headerCode]
  ) {
    return {
      country: COUNTRY_NAMES[headerCode],
      code: headerCode,
      city:
        String(
          req.headers["x-client-city"] || ""
        ) || "Metropolitan Region",
      flag:
        COUNTRY_FLAGS[headerCode] || "🌐",
    };
  }

  if (clientHint?.timezone) {
    const tz =
      clientHint.timezone.toLowerCase();

    if (
      tz.includes("dhaka") ||
      tz.includes("bangladesh") ||
      tz.includes("asia/dhaka")
    ) {
      return {
        country: "Bangladesh",
        code: "BD",
        city: "Dhaka",
        flag: "🇧🇩",
      };
    }

    if (
      tz.includes("new_york") ||
      tz.includes("chicago") ||
      tz.includes("los_angeles") ||
      tz.includes("america/")
    ) {
      return {
        country: "United States",
        code: "US",
        city: "San Francisco",
        flag: "🇺🇸",
      };
    }

    if (
      tz.includes("london") ||
      tz.includes("europe/london")
    ) {
      return {
        country: "United Kingdom",
        code: "GB",
        city: "London",
        flag: "🇬🇧",
      };
    }

    if (
      tz.includes("berlin") ||
      tz.includes("frankfurt")
    ) {
      return {
        country: "Germany",
        code: "DE",
        city: "Frankfurt",
        flag: "🇩🇪",
      };
    }

    if (tz.includes("dubai")) {
      return {
        country: "United Arab Emirates",
        code: "AE",
        city: "Dubai",
        flag: "🇦🇪",
      };
    }

    if (tz.includes("singapore")) {
      return {
        country: "Singapore",
        code: "SG",
        city: "Singapore",
        flag: "🇸🇬",
      };
    }

    if (
      tz.includes("toronto") ||
      tz.includes("vancouver") ||
      tz.includes("montreal")
    ) {
      return {
        country: "Canada",
        code: "CA",
        city: "Toronto",
        flag: "🇨🇦",
      };
    }

    if (tz.includes("tokyo")) {
      return {
        country: "Japan",
        code: "JP",
        city: "Tokyo",
        flag: "🇯🇵",
      };
    }

    if (
      tz.includes("kolkata") ||
      tz.includes("calcutta") ||
      tz.includes("asia/kolkata")
    ) {
      return {
        country: "India",
        code: "IN",
        city: "Bangalore",
        flag: "🇮🇳",
      };
    }

    if (
      tz.includes("sydney") ||
      tz.includes("melbourne") ||
      tz.includes("australia")
    ) {
      return {
        country: "Australia",
        code: "AU",
        city: "Sydney",
        flag: "🇦🇺",
      };
    }
  }

  return {
    country: "United States",
    code: "US",
    city: "Enterprise Edge",
    flag: "🇺🇸",
  };
}

// ============================================================
// FILE UPLOAD
// ============================================================

const UPLOADS_DIR = path.join(
  process.cwd(),
  "public",
  "uploads"
);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb
  ) => {
    cb(null, UPLOADS_DIR);
  },

  filename: (
    _req,
    file,
    cb
  ) => {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    const ext = path.extname(
      file.originalname
    );

    cb(
      null,
      `media-${uniqueSuffix}${ext}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ============================================================
// ADMIN TOKEN HELPERS
// ============================================================

type AdminTokenPayload = {
  id: string;
  email: string;
  role: string;
  name: string;
};

function getTokenFromRequest(
  req: Request
): string | undefined {
  const authHeader =
    req.headers.authorization;

  if (
    authHeader &&
    authHeader.startsWith("Bearer ")
  ) {
    const token =
      authHeader
        .substring(7)
        .trim();

    if (token) {
      return token;
    }
  }

  const cookieToken =
    req.cookies?.admin_token;

  if (
    typeof cookieToken === "string" &&
    cookieToken.trim()
  ) {
    return cookieToken.trim();
  }

  return undefined;
}

// ============================================================
// CHECK ADMIN TOKEN
// Used before DDoS middleware so an authenticated admin
// cannot accidentally be blocked by the rate limiter.
// ============================================================

function isAuthenticatedAdmin(
  req: Request
): boolean {
  try {
    const token =
      getTokenFromRequest(req);

    if (!token) {
      return false;
    }

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as AdminTokenPayload;

    if (
      !decoded ||
      !decoded.id ||
      !decoded.email
    ) {
      return false;
    }

    const state =
      db.getState();

    if (
      !state.admins ||
      state.admins.length === 0
    ) {
      return false;
    }

    const admin =
      state.admins.find(
        (a) =>
          a.id === decoded.id &&
          a.email
            .trim()
            .toLowerCase() ===
            decoded.email
              .trim()
              .toLowerCase()
      );

    return !!admin;
  } catch {
    return false;
  }
}

// ============================================================
// SYNCHRONIZE ADMIN FROM .ENV
// ============================================================

async function syncAdminFromEnv() {
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

  const state = db.getState();

  if (!state.admins) {
    state.admins = [];
  }

  // Remove any legacy demo accounts
  const originalLen = state.admins.length;
  state.admins = state.admins.filter(
    (a) => a.email.trim().toLowerCase() !== "admin@apexcorelabs.com" && a.email.trim().toLowerCase() !== "admin@apexagency.io"
  );
  let stateChanged = state.admins.length !== originalLen;

  for (const acc of accounts) {
    let admin = state.admins.find(
      (a) => a.email.trim().toLowerCase() === acc.email.toLowerCase()
    );

    if (!admin) {
      const passwordHash = await bcrypt.hash(acc.password, 12);
      admin = {
        id: "admin-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        email: acc.email.toLowerCase(),
        passwordHash,
        name: acc.name,
        role: acc.role,
        createdAt: new Date().toISOString(),
      };
      state.admins.unshift(admin);
      stateChanged = true;
      console.log(`[AUTH] Admin account initialized: ${acc.email}`);
    } else {
      const passwordMatches = await bcrypt.compare(
        acc.password,
        admin.passwordHash
      );
      if (!passwordMatches) {
        admin.passwordHash = await bcrypt.hash(acc.password, 12);
        stateChanged = true;
        console.log(`[AUTH] Admin password synchronized: ${acc.email}`);
      }
    }
  }

  if (stateChanged) {
    db.save();
  }
}

// ============================================================
// START SERVER
// ============================================================

async function startServer() {
  /*
   * The DB class initializes asynchronously.
   *
   * Your existing db.ts starts initialization in its constructor.
   * Give it a moment to finish loading data/db.json before
   * synchronizing admin credentials.
   */
  await new Promise((resolve) =>
    setTimeout(resolve, 100)
  );

  await syncAdminFromEnv();

  const app =
    express();

  // ==========================================================
  // EXPRESS CONFIG
  // ==========================================================

  app.use(
    express.json({
      limit: "15mb",
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: "15mb",
    })
  );

  app.use(
    cookieParser()
  );

  // If your application is behind ONE trusted reverse proxy,
  // you can enable this:
  //
  // app.set("trust proxy", 1);
  //
  // Otherwise keep it disabled.

  // ==========================================================
  // STATIC UPLOADS
  // ==========================================================

  app.use(
    "/uploads",
    express.static(
      UPLOADS_DIR
    )
  );

  // ==========================================================
  // FAVICON
  // ==========================================================

  app.get(
    "/favicon.ico",
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      if (
        state.settings?.faviconUrl
      ) {
        return res.redirect(
          state.settings.faviconUrl
        );
      }

      return res
        .status(204)
        .end();
    }
  );

  // ==========================================================
  // APEX SHIELD ANTI-DDOS
  // ==========================================================

  app.use(
    (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      /*
       * IMPORTANT:
       *
       * Authenticated administrators bypass this middleware.
       * This prevents the admin dashboard from locking itself
       * out when many API requests are made.
       *
       * Login itself is NOT authenticated and therefore remains
       * protected by the rate limiter.
       */
      if (
        isAuthenticatedAdmin(req)
      ) {
        return next();
      }

      const ip =
        getClientIp(req);

      const now =
        Date.now();

      const state =
        db.getState();

      if (!state.blockedIps) {
        state.blockedIps = [];
      }

      if (!state.ddosEvents) {
        state.ddosEvents = [];
      }

      if (!state.visitors) {
        state.visitors = [];
      }

      // ------------------------------------------------------
      // Remove expired blocks
      // ------------------------------------------------------

      state.blockedIps =
        state.blockedIps.filter(
          (block) => {
            const until =
              new Date(
                block.blockedUntil
              ).getTime();

            return (
              Number.isFinite(until) &&
              until > now
            );
          }
        );

      // ------------------------------------------------------
      // Check active block
      // ------------------------------------------------------

      const activeBlock =
        state.blockedIps.find(
          (block) =>
            block.ip === ip &&
            new Date(
              block.blockedUntil
            ).getTime() > now
        );

      if (activeBlock) {
        const remainingSeconds =
          Math.max(
            0,
            Math.ceil(
              (
                new Date(
                  activeBlock.blockedUntil
                ).getTime() -
                now
              ) / 1000
            )
          );

        const remainingMinutes =
          Math.ceil(
            remainingSeconds / 60
          );

        return res
          .status(429)
          .json({
            success: false,

            error:
              "Access Denied: Apex Anti-DDoS Shield Active",

            message:
              "Your IP address has been temporarily blocked because the request threshold was exceeded.",

            ip,

            reason:
              activeBlock.reason,

            blockedAt:
              activeBlock.blockedAt,

            blockedUntil:
              activeBlock.blockedUntil,

            remainingMinutes,

            remainingSeconds,

            policy:
              "20+ requests within 10 seconds triggers a temporary IP quarantine.",
          });
      }

      // ------------------------------------------------------
      // Static / Vite requests
      // ------------------------------------------------------

      const pathUrl =
        req.path;

      const isStatic =
        pathUrl.startsWith(
          "/uploads/"
        ) ||
        pathUrl.startsWith(
          "/@vite"
        ) ||
        pathUrl.startsWith(
          "/src/"
        ) ||
        pathUrl.startsWith(
          "/node_modules"
        ) ||
        pathUrl.startsWith(
          "/@fs/"
        ) ||
        pathUrl.startsWith(
          "/favicon.ico"
        );

      if (!isStatic) {
        let history =
          ipRequestWindow.get(
            ip
          ) || [];

        history =
          history.filter(
            (timestamp) =>
              now -
                timestamp <
              DDOS_WINDOW_MS
          );

        history.push(now);

        ipRequestWindow.set(
          ip,
          history
        );

        // ----------------------------------------------------
        // Automatic block
        // ----------------------------------------------------

        if (
          history.length >=
          DDOS_REQUEST_THRESHOLD
        ) {
          const blockedUntil =
            new Date(
              now +
                DDOS_BAN_DURATION_MS
            ).toISOString();

          const blockRecord:
            BlockedIpDoc = {
              id:
                "block-" +
                now,

              ip,

              reason:
                `High-frequency request surge: ${history.length} requests within 10 seconds.`,

              blockedAt:
                new Date(
                  now
                ).toISOString(),

              blockedUntil,

              requestsInWindow:
                history.length,

              isManual:
                false,
            };

          state.blockedIps.unshift(
            blockRecord
          );

          const ddosEvent:
            DdosEventDoc = {
              id:
                "ddos-" +
                now,

              ip,

              timestamp:
                new Date(
                  now
                ).toISOString(),

              requestsCount:
                history.length,

              windowMs:
                DDOS_WINDOW_MS,

              action:
                "Blocked for 1 Hour",

              details:
                `Client exceeded ${DDOS_REQUEST_THRESHOLD} requests in ${DDOS_WINDOW_MS / 1000}s.`,
            };

          state.ddosEvents.unshift(
            ddosEvent
          );

          if (
            state.blockedIps
              .length > 300
          ) {
            state.blockedIps =
              state.blockedIps.slice(
                0,
                300
              );
          }

          if (
            state.ddosEvents
              .length > 300
          ) {
            state.ddosEvents =
              state.ddosEvents.slice(
                0,
                300
              );
          }

          db.save();

          ipRequestWindow.delete(
            ip
          );

          return res
            .status(429)
            .json({
              success: false,

              error:
                "Apex Anti-DDoS Shield Triggered: IP Blocked",

              message:
                "Your IP has exceeded the request threshold and has been temporarily quarantined.",

              ip,

              blockedUntil,

              retryAfterSeconds:
                DDOS_BAN_DURATION_MS /
                1000,

              policy:
                "20+ requests within 10 seconds triggers a 1-hour block.",
            });
        }
      }

      next();
    }
  );

  // ==========================================================
  // ADMIN AUTH MIDDLEWARE
  // ==========================================================

  const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token =
        getTokenFromRequest(
          req
        );

      if (!token) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Unauthorized. Admin session token required.",
          });
      }

      const decoded =
        jwt.verify(
          token,
          JWT_SECRET
        ) as AdminTokenPayload;

      if (
        !decoded ||
        !decoded.id ||
        !decoded.email
      ) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Invalid administrator token.",
          });
      }

      const state =
        db.getState();

      const admin =
        state.admins.find(
          (a) =>
            a.id ===
              decoded.id &&
            a.email
              .trim()
              .toLowerCase() ===
              decoded.email
                .trim()
                .toLowerCase()
        );

      if (!admin) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Admin account not found.",
          });
      }

      (
        req as any
      ).user = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      };

      return next();
    } catch {
      return res
        .status(401)
        .json({
          success: false,
          error:
            "Invalid or expired session token.",
        });
    }
  };

  // ==========================================================
  // AUTHENTICATION ROUTES
  // ==========================================================

  app.post(
    "/api/auth/login",
    async (
      req: Request,
      res: Response
    ) => {
      try {
        const email =
          String(
            req.body?.email || ""
          )
            .trim()
            .toLowerCase();

        const password =
          String(
            req.body?.password || ""
          );

        if (
          !email ||
          !password
        ) {
          return res
            .status(400)
            .json({
              success: false,
              error:
                "Email and password are required.",
            });
        }

        const state =
          db.getState();

        if (
          !state.admins ||
          state.admins.length ===
            0
        ) {
          console.error(
            "[AUTH] No administrator account exists."
          );

          return res
            .status(500)
            .json({
              success: false,
              error:
                "No administrator account is configured.",
            });
        }

        let admin =
          state.admins.find(
            (a) =>
              a.email
                .trim()
                .toLowerCase() ===
              email
          );

        const envEmail = (process.env.ADMIN_EMAIL || "admin@techelevant.com").trim().toLowerCase();
        const envPass = process.env.ADMIN_PASSWORD || "Admin@Tech2026!";

        if (!admin) {
          if (email === envEmail && password === envPass) {
            const passwordHash = await bcrypt.hash(password, 12);
            admin = {
              id: "admin-" + Date.now(),
              email,
              passwordHash,
              name: "Tech Elevant Administrator",
              role: "superadmin",
              createdAt: new Date().toISOString(),
            };
            state.admins.unshift(admin);
            db.save();
            console.log(`[AUTH] Admin dynamically authenticated & saved: ${email}`);
          }
        }

        if (!admin) {
          console.log(
            `[AUTH] Login failed - admin not found: ${email}`
          );

          return res
            .status(401)
            .json({
              success: false,
              error:
                "Invalid email or credentials.",
            });
        }

        const passwordValid =
          await bcrypt.compare(
            password,
            admin.passwordHash
          );

        console.log(
          `[AUTH] Login attempt for ${email} - password valid: ${passwordValid}`
        );

        if (!passwordValid) {
          return res
            .status(401)
            .json({
              success: false,
              error:
                "Invalid email or credentials.",
            });
        }

        const token =
          jwt.sign(
            {
              id: admin.id,
              email: admin.email,
              role: admin.role,
              name: admin.name,
            },
            JWT_SECRET,
            {
              expiresIn:
                "7d",
            }
          );

        res.cookie(
          "admin_token",
          token,
          {
            httpOnly: true,
            secure:
              process.env
                .NODE_ENV ===
              "production",
            sameSite: "lax",
            maxAge:
              7 *
              24 *
              60 *
              60 *
              1000,
          }
        );

        return res.json({
          success: true,

          token,

          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
        });
      } catch (error) {
        console.error(
          "[AUTH] Login error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            error:
              "Authentication service error.",
          });
      }
    }
  );

  // ==========================================================
  // CURRENT ADMIN
  // ==========================================================

  app.get(
    "/api/auth/me",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const user =
        (req as any).user;

      const state =
        db.getState();

      const admin =
        state.admins.find(
          (a) =>
            a.id === user.id
        );

      if (!admin) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Admin profile not found.",
          });
      }

      return res.json({
        success: true,

        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    }
  );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  app.post(
    "/api/auth/logout",
    (
      _req: Request,
      res: Response
    ) => {
      res.clearCookie(
        "admin_token",
        {
          httpOnly: true,
          secure:
            process.env
              .NODE_ENV ===
            "production",
          sameSite: "lax",
        }
      );

      return res.json({
        success: true,
        message:
          "Logged out successfully.",
      });
    }
  );

  // ==========================================================
  // PUBLIC WEBSITE ROUTES
  // ==========================================================

  app.get(
    "/api/public/bootstrap",
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        settings:
          state.settings,

        hero:
          state.hero,

        navigation:
          state.navigation
            .filter(
              (n) => n.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        socialLinks:
          state.socialLinks
            .filter(
              (s) =>
                s.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        sections:
          state.sections.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),

        services:
          state.services
            .filter(
              (s) =>
                s.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        portfolio:
          state.portfolio
            .filter(
              (p) =>
                p.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        fiverrServices:
          state.fiverrServices
            .filter(
              (f) =>
                f.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        testimonials:
          state.testimonials
            .filter(
              (t) =>
                t.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        team:
          state.team
            .filter(
              (t) =>
                t.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        faqs:
          state.faqs
            .filter(
              (f) =>
                f.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),

        process:
          state.process
            .filter(
              (p) =>
                p.isActive
            )
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),
      });
    }
  );

  app.get(
    "/api/public/settings",
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,
        settings:
          state.settings,
      });
    }
  );

  app.get(
    "/api/public/services",
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const services =
        state.services
          .filter(
            (s) =>
              s.isActive
          )
          .sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          );

      return res.json({
        success: true,
        services,
      });
    }
  );

  app.get(
    "/api/public/services/:slug",
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const service =
        state.services.find(
          (s) =>
            s.slug ===
              req.params.slug &&
            s.isActive
        );

      if (!service) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Service not found",
          });
      }

      return res.json({
        success: true,
        service,
      });
    }
  );

  app.get(
    "/api/public/portfolio",
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const portfolio =
        state.portfolio
          .filter(
            (p) =>
              p.isActive
          )
          .sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          );

      return res.json({
        success: true,
        portfolio,
      });
    }
  );

  app.get(
    "/api/public/portfolio/:slug",
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const item =
        state.portfolio.find(
          (p) =>
            p.slug ===
              req.params.slug &&
            p.isActive
        );

      if (!item) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Portfolio item not found",
          });
      }

      return res.json({
        success: true,
        item,
      });
    }
  );

  app.get(
    "/api/public/fiverr-services",
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const fiverrServices =
        state.fiverrServices
          .filter(
            (f) =>
              f.isActive
          )
          .sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          );

      return res.json({
        success: true,
        fiverrServices,
      });
    }
  );

  // ==========================================================
  // CONTACT
  // ==========================================================

  app.post(
    "/api/public/contact",
    (
      req: Request,
      res: Response
    ) => {
      const {
        fullName,
        email,
        company,
        phone,
        service,
        budget,
        projectDetails,
      } = req.body;

      if (
        !fullName ||
        !email ||
        !projectDetails
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Full Name, Email, and Project Details are required.",
          });
      }

      const state =
        db.getState();

      const newLead = {
        id:
          "lead-" +
          Date.now(),

        type:
          "contact" as const,

        fullName:
          String(
            fullName
          ).trim(),

        email:
          String(email)
            .trim()
            .toLowerCase(),

        company:
          company
            ? String(
                company
              ).trim()
            : "",

        phone:
          phone
            ? String(
                phone
              ).trim()
            : "",

        service:
          service
            ? String(
                service
              ).trim()
            : "General Inquiry",

        budget:
          budget
            ? String(
                budget
              ).trim()
            : "Undisclosed",

        projectDetails:
          String(
            projectDetails
          ).trim(),

        status:
          "new" as const,

        createdAt:
          new Date().toISOString(),
      };

      state.leads.unshift(
        newLead
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Thank you for contacting us. A senior technical lead will review your requirements and respond within 24 hours.",
          leadId:
            newLead.id,
        });
    }
  );

  // ==========================================================
  // CONSULTATION
  // ==========================================================

  app.post(
    "/api/public/consultation",
    (
      req: Request,
      res: Response
    ) => {
      const {
        fullName,
        email,
        company,
        phone,
        service,
        budget,
        timeline,
        projectDetails,
      } = req.body;

      if (
        !fullName ||
        !email ||
        !projectDetails
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Full Name, Email, and Project Details are required.",
          });
      }

      const state =
        db.getState();

      const newLead = {
        id:
          "consultation-" +
          Date.now(),

        type:
          "consultation" as const,

        fullName:
          String(
            fullName
          ).trim(),

        email:
          String(email)
            .trim()
            .toLowerCase(),

        company:
          company
            ? String(
                company
              ).trim()
            : "",

        phone:
          phone
            ? String(
                phone
              ).trim()
            : "",

        service:
          service
            ? String(
                service
              ).trim()
            : "Bespoke Engineering",

        budget:
          budget
            ? String(
                budget
              ).trim()
            : "$25,000 - $50,000",

        timeline:
          timeline
            ? String(
                timeline
              ).trim()
            : "Flexible",

        projectDetails:
          String(
            projectDetails
          ).trim(),

        status:
          "new" as const,

        createdAt:
          new Date().toISOString(),
      };

      state.leads.unshift(
        newLead
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Your project consultation request has been submitted. Our engineering team has received your specifications.",
          leadId:
            newLead.id,
        });
    }
  );

  // ==========================================================
  // NEWSLETTER
  // ==========================================================

  app.post(
    "/api/public/newsletter",
    (
      req: Request,
      res: Response
    ) => {
      const {
        email,
      } = req.body;

      if (
        !email ||
        !String(email).includes(
          "@"
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "A valid email address is required.",
          });
      }

      const state =
        db.getState();

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      const existing =
        state.subscribers.find(
          (s) =>
            s.email ===
            cleanEmail
        );

      if (existing) {
        return res.json({
          success: true,
          message:
            "You are already subscribed to our executive technology newsletter.",
        });
      }

      state.subscribers.unshift(
        {
          id:
            "sub-" +
            Date.now(),

          email:
            cleanEmail,

          status:
            "subscribed",

          createdAt:
            new Date().toISOString(),
        }
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Successfully subscribed. Welcome to the ApexCore technology briefing.",
        });
    }
  );

  // ==========================================================
  // VISITOR TRACKING
  // ==========================================================

  app.post(
    "/api/public/track-visit",
    (
      req: Request,
      res: Response
    ) => {
      try {
        const {
          page,
          referrer,
          timezone,
          language,
        } = req.body || {};

        const ip =
          getClientIp(req);

        const ua =
          String(
            req.headers[
              "user-agent"
            ] || ""
          );

        const {
          device,
          browser,
        } =
          parseUserAgent(
            ua
          );

        const geo =
          resolveGeo(
            req,
            {
              timezone,
            }
          );

        const state =
          db.getState();

        if (
          !state.visitors
        ) {
          state.visitors = [];
        }

        const tenMinsAgo =
          Date.now() -
          10 *
            60 *
            1000;

        const existing =
          state.visitors.find(
            (v) =>
              v.ip === ip &&
              new Date(
                v.timestamp
              ).getTime() >
                tenMinsAgo
          );

        if (existing) {
          existing.requestCount =
            (existing.requestCount ||
              1) +
            1;

          existing.page =
            page ||
            existing.page;

          existing.timestamp =
            new Date().toISOString();
        } else {
          const newVisitor:
            VisitorLogDoc = {
              id:
                "vis-" +
                Date.now() +
                "-" +
                Math.round(
                  Math.random() *
                    1000
                ),

              ip,

              country:
                geo.country,

              countryCode:
                geo.code,

              city:
                geo.city,

              page:
                page || "/",

              referrer:
                referrer ||
                "Direct",

              userAgent:
                ua,

              device,

              browser,

              timestamp:
                new Date().toISOString(),

              requestCount:
                1,

              status:
                "normal",
            };

          state.visitors.unshift(
            newVisitor
          );

          if (
            state.visitors
              .length > 500
          ) {
            state.visitors =
              state.visitors.slice(
                0,
                500
              );
          }
        }

        db.save();

        return res.json({
          success: true,
          ip,
          country:
            geo.country,
          code:
            geo.code,
          flag:
            geo.flag,
        });
      } catch (error: any) {
        return res.json({
          success: false,
          error:
            error?.message ||
            "Unable to track visitor.",
        });
      }
    }
  );

  // ==========================================================
  // ADMIN VISITORS
  // ==========================================================

  app.get(
    "/api/admin/visitors",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const visitors =
        state.visitors || [];

      const totalVisits =
        visitors.reduce(
          (sum, v) =>
            sum +
            (v.requestCount ||
              1),
          0
        );

      const uniqueIps =
        new Set(
          visitors.map(
            (v) => v.ip
          )
        ).size;

      const startOfToday =
        new Date();

      startOfToday.setHours(
        0,
        0,
        0,
        0
      );

      const todayVisits =
        visitors.filter(
          (v) =>
            new Date(
              v.timestamp
            ).getTime() >=
            startOfToday.getTime()
        ).length;

      const countryMap: Record<
        string,
        {
          country: string;
          code: string;
          flag: string;
          count: number;
        }
      > = {};

      for (const visitor of visitors) {
        const code =
          visitor.countryCode ||
          "US";

        if (
          !countryMap[code]
        ) {
          countryMap[code] = {
            country:
              visitor.country ||
              COUNTRY_NAMES[
                code
              ] ||
              "Unknown",

            code,

            flag:
              COUNTRY_FLAGS[
                code
              ] || "🌐",

            count: 0,
          };
        }

        countryMap[
          code
        ].count +=
          visitor.requestCount ||
          1;
      }

      const totalCount =
        Object.values(
          countryMap
        ).reduce(
          (sum, c) =>
            sum + c.count,
          0
        ) || 1;

      const countryStats =
        Object.values(
          countryMap
        )
          .map(
            (c) => ({
              ...c,
              percentage:
                Math.round(
                  (c.count /
                    totalCount) *
                    100
                ),
            })
          )
          .sort(
            (a, b) =>
              b.count -
              a.count
          );

      return res.json({
        success: true,

        data: {
          totalVisits,

          uniqueVisitors:
            uniqueIps,

          todayVisits,

          countryStats,

          recentVisitors:
            visitors.slice(
              0,
              100
            ),
        },
      });
    }
  );

  app.post(
    "/api/admin/visitors/clear",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.visitors = [];

      db.save();

      return res.json({
        success: true,
        message:
          "Visitor logs cleared successfully.",
      });
    }
  );

  // ==========================================================
  // DDOS SECURITY STATUS
  // ==========================================================

  app.get(
    "/api/admin/security/ddos",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const now =
        Date.now();

      const blockedIps =
        state.blockedIps ||
        [];

      const ddosEvents =
        state.ddosEvents ||
        [];

      const activeBlocked =
        blockedIps.filter(
          (block) =>
            new Date(
              block.blockedUntil
            ).getTime() >
            now
        );

      return res.json({
        success: true,

        data: {
          shieldActive: true,

          rateLimitThreshold:
            DDOS_REQUEST_THRESHOLD,

          windowSeconds:
            DDOS_WINDOW_MS /
            1000,

          blockDurationHours:
            DDOS_BAN_DURATION_MS /
            (3600 * 1000),

          totalBlockedCount:
            blockedIps.length,

          activeBlockedCount:
            activeBlocked.length,

          blockedIps:
            blockedIps.map(
              (block) => ({
                ...block,

                isExpired:
                  new Date(
                    block.blockedUntil
                  ).getTime() <=
                  now,

                remainingSeconds:
                  Math.max(
                    0,
                    Math.ceil(
                      (
                        new Date(
                          block.blockedUntil
                        ).getTime() -
                        now
                      ) /
                        1000
                    )
                  ),
              })
            ),

          recentEvents:
            ddosEvents.slice(
              0,
              50
            ),
        },
      });
    }
  );

  // ==========================================================
  // UNBLOCK IP
  // ==========================================================

  app.post(
    "/api/admin/security/unblock",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const ip =
        String(
          req.body?.ip || ""
        ).trim();

      if (
        !ip ||
        !isIP(ip)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "A valid IP address is required.",
          });
      }

      const state =
        db.getState();

      state.blockedIps =
        (
          state.blockedIps ||
          []
        ).filter(
          (block) =>
            block.ip !== ip
        );

      ipRequestWindow.delete(
        ip
      );

      db.save();

      return res.json({
        success: true,
        message:
          `IP ${ip} has been successfully unblocked.`,
      });
    }
  );

  // ==========================================================
  // MANUAL BLOCK IP
  // ==========================================================

  app.post(
    "/api/admin/security/block",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const ip =
        String(
          req.body?.ip || ""
        ).trim();

      const reason =
        String(
          req.body?.reason ||
            "Manual administrator security ban"
        ).trim();

      const durationHours =
        Number(
          req.body?.durationHours ||
            1
        );

      if (
        !ip ||
        !isIP(ip)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "A valid IP address is required.",
          });
      }

      if (
        !Number.isFinite(
          durationHours
        ) ||
        durationHours <= 0 ||
        durationHours > 720
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Duration must be between 0 and 720 hours.",
          });
      }

      const state =
        db.getState();

      if (
        !state.blockedIps
      ) {
        state.blockedIps = [];
      }

      const blockedUntil =
        new Date(
          Date.now() +
            durationHours *
              3600 *
              1000
        ).toISOString();

      const newBlock:
        BlockedIpDoc = {
          id:
            "block-manual-" +
            Date.now(),

          ip,

          reason,

          blockedAt:
            new Date().toISOString(),

          blockedUntil,

          requestsInWindow:
            0,

          isManual: true,
        };

      state.blockedIps.unshift(
        newBlock
      );

      if (
        state.blockedIps
          .length > 300
      ) {
        state.blockedIps =
          state.blockedIps.slice(
            0,
            300
          );
      }

      db.save();

      return res.json({
        success: true,

        message:
          `IP ${ip} quarantined for ${durationHours} hour(s).`,

        block:
          newBlock,
      });
    }
  );

  // ==========================================================
  // DDOS TEST TRIGGER
  // ==========================================================

  app.post(
    "/api/admin/security/test-trigger",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const requestedIp =
        String(
          req.body?.ip || ""
        ).trim();

      const testIp =
        requestedIp &&
        isIP(requestedIp)
          ? requestedIp
          : "203.0.113." +
            Math.floor(
              Math.random() *
                200 +
                10
            );

      const now =
        Date.now();

      const blockedUntil =
        new Date(
          now +
            DDOS_BAN_DURATION_MS
        ).toISOString();

      const blockRecord:
        BlockedIpDoc = {
        id:
          "block-test-" +
          now,

        ip:
          testIp,

        reason:
          "DDoS simulation test triggered via administrator simulator.",

        blockedAt:
          new Date(
            now
          ).toISOString(),

        blockedUntil,

        requestsInWindow:
          22,

        isManual:
          false,
      };

      if (
        !state.blockedIps
      ) {
        state.blockedIps = [];
      }

      if (
        !state.ddosEvents
      ) {
        state.ddosEvents = [];
      }

      state.blockedIps.unshift(
        blockRecord
      );

      const ddosEvent:
        DdosEventDoc = {
        id:
          "ddos-test-" +
          now,

        ip:
          testIp,

        timestamp:
          new Date(
            now
          ).toISOString(),

        requestsCount:
          22,

        windowMs:
          DDOS_WINDOW_MS,

        action:
          "Blocked for 1 Hour",

        details:
          "Simulated DDoS attack mitigation test.",
      };

      state.ddosEvents.unshift(
        ddosEvent
      );

      db.save();

      return res.json({
        success: true,

        message:
          `Anti-DDoS Shield test successful. Simulated IP ${testIp} has been quarantined.`,

        testIp,

        blockedUntil,
      });
    }
  );

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  app.get(
    "/api/admin/dashboard-stats",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const totalServices =
        state.services.length;

      const totalPortfolio =
        state.portfolio.length;

      const totalFiverr =
        state.fiverrServices.length;

      const totalTestimonials =
        state.testimonials.length;

      const totalLeads =
        state.leads.length;

      const newLeads =
        state.leads.filter(
          (lead) =>
            lead.status ===
            "new"
        ).length;

      const inProgressLeads =
        state.leads.filter(
          (lead) =>
            lead.status ===
            "in_progress"
        ).length;

      const convertedLeads =
        state.leads.filter(
          (lead) =>
            lead.status ===
            "converted"
        ).length;

      const totalSubscribers =
        state.subscribers.length;

      const recentLeads =
        state.leads.slice(
          0,
          8
        );

      return res.json({
        success: true,

        stats: {
          totalServices,
          totalPortfolio,
          totalFiverr,
          totalTestimonials,
          totalLeads,
          newLeads,
          inProgressLeads,
          convertedLeads,
          totalSubscribers,
        },

        recentLeads,
      });
    }
  );

  // ==========================================================
  // SETTINGS
  // ==========================================================

  app.get(
    "/api/admin/settings",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,
        settings:
          state.settings,
      });
    }
  );

  app.put(
    "/api/admin/settings",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.settings = {
        ...state.settings,
        ...req.body,
        updatedAt:
          new Date().toISOString(),
      };

      db.save();

      return res.json({
        success: true,
        settings:
          state.settings,
        message:
          "Website settings updated successfully.",
      });
    }
  );

  // ==========================================================
  // BRAND ASSET UPLOAD
  // ==========================================================

  app.post(
    "/api/admin/settings/upload-asset",
    requireAdmin,
    upload.single("file"),
    (
      req: Request,
      res: Response
    ) => {
      const file =
        (req as any).file;

      if (!file) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "No file uploaded.",
          });
      }

      const assetUrl =
        `/uploads/${file.filename}`;

      const state =
        db.getState();

      if (!state.media) {
        state.media = [];
      }

      state.media.unshift({
        id:
          "med-brand-" +
          Date.now(),

        filename:
          file.filename,

        originalName:
          file.originalname,

        url:
          assetUrl,

        mimeType:
          file.mimetype,

        size:
          file.size,

        createdAt:
          new Date().toISOString(),
      });

      db.save();

      return res.json({
        success: true,
        url:
          assetUrl,
        filename:
          file.filename,
        message:
          "Asset uploaded successfully.",
      });
    }
  );

  // ==========================================================
  // HERO
  // ==========================================================

  app.get(
    "/api/admin/hero",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,
        hero:
          state.hero,
      });
    }
  );

  app.put(
    "/api/admin/hero",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.hero = {
        ...state.hero,
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        hero:
          state.hero,
        message:
          "Hero section updated successfully.",
      });
    }
  );

  // ==========================================================
  // HOMEPAGE SECTIONS
  // ==========================================================

  app.get(
    "/api/admin/sections",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        sections:
          state.sections
            .sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            ),
      });
    }
  );

  app.put(
    "/api/admin/sections",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      if (
        Array.isArray(
          req.body?.sections
        )
      ) {
        state.sections =
          req.body.sections;

        db.save();

        return res.json({
          success: true,
          sections:
            state.sections,
          message:
            "Homepage sections updated successfully.",
        });
      }

      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid sections array format.",
        });
    }
  );

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  app.get(
    "/api/admin/navigation",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        navigation:
          state.navigation.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/navigation",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const newItem = {
        id:
          "nav-" +
          Date.now(),

        name:
          req.body?.name ||
          "New Nav Item",

        url:
          req.body?.url ||
          "/",

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.navigation
            .length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,

        openInNewTab:
          Boolean(
            req.body?.openInNewTab
          ),
      };

      state.navigation.push(
        newItem
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          item:
            newItem,
        });
    }
  );

  app.put(
    "/api/admin/navigation/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.navigation.findIndex(
          (item) =>
            item.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Nav item not found.",
          });
      }

      state.navigation[
        index
      ] = {
        ...state.navigation[
          index
        ],
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        item:
          state.navigation[
            index
          ],
      });
    }
  );

  app.delete(
    "/api/admin/navigation/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.navigation =
        state.navigation.filter(
          (item) =>
            item.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Nav item deleted.",
      });
    }
  );

  // ==========================================================
  // SOCIAL LINKS
  // ==========================================================

  app.get(
    "/api/admin/social-links",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        socialLinks:
          state.socialLinks.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/social-links",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const newSocial = {
        id:
          "soc-" +
          Date.now(),

        platform:
          req.body?.platform ||
          "Platform",

        url:
          req.body?.url ||
          "https://",

        icon:
          req.body?.icon ||
          "ExternalLink",

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.socialLinks
            .length +
            1,
      };

      state.socialLinks.push(
        newSocial
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          socialLink:
            newSocial,
        });
    }
  );

  app.put(
    "/api/admin/social-links/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.socialLinks.findIndex(
          (item) =>
            item.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Social link not found.",
          });
      }

      state.socialLinks[
        index
      ] = {
        ...state.socialLinks[
          index
        ],
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        socialLink:
          state.socialLinks[
            index
          ],
      });
    }
  );

  app.delete(
    "/api/admin/social-links/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.socialLinks =
        state.socialLinks.filter(
          (item) =>
            item.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Social link deleted.",
      });
    }
  );

  // ==========================================================
  // SERVICES
  // ==========================================================

  app.get(
    "/api/admin/services",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        services:
          state.services.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/services",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const name =
        String(
          req.body?.name ||
            "Untitled Service"
        );

      const slug =
        req.body?.slug ||
        name
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /(^-|-$)/g,
            ""
          );

      const newService = {
        id:
          "srv-" +
          Date.now(),

        name,

        slug,

        icon:
          req.body?.icon ||
          "Code2",

        shortDescription:
          req.body
            ?.shortDescription ||
          "",

        fullDescription:
          req.body
            ?.fullDescription ||
          "",

        features:
          Array.isArray(
            req.body?.features
          )
            ? req.body.features
            : [],

        technologies:
          Array.isArray(
            req.body?.technologies
          )
            ? req.body.technologies
            : [],

        benefits:
          Array.isArray(
            req.body?.benefits
          )
            ? req.body.benefits
            : [],

        process:
          Array.isArray(
            req.body?.process
          )
            ? req.body.process
            : [],

        ctaText:
          req.body?.ctaText ||
          "Discuss Project",

        ctaUrl:
          req.body?.ctaUrl ||
          "/get-in-touch",

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.services
            .length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,

        isFeatured:
          Boolean(
            req.body?.isFeatured
          ),

        seoTitle:
          req.body?.seoTitle ||
          "",

        seoDescription:
          req.body
            ?.seoDescription ||
          "",
      };

      state.services.push(
        newService
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          service:
            newService,
        });
    }
  );

  app.put(
    "/api/admin/services/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.services.findIndex(
          (service) =>
            service.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Service not found.",
          });
      }

      state.services[
        index
      ] = {
        ...state.services[
          index
        ],
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        service:
          state.services[
            index
          ],
      });
    }
  );

  app.delete(
    "/api/admin/services/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.services =
        state.services.filter(
          (service) =>
            service.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Service deleted.",
      });
    }
  );

  // ==========================================================
  // PORTFOLIO
  // ==========================================================

  app.get(
    "/api/admin/portfolio",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        portfolio:
          state.portfolio.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/portfolio",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const title =
        String(
          req.body?.title ||
            "Untitled Project"
        );

      const slug =
        req.body?.slug ||
        title
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /(^-|-$)/g,
            ""
          );

      const newPortfolio = {
        id:
          "port-" +
          Date.now(),

        title,

        slug,

        client:
          req.body?.client ||
          "",

        category:
          req.body?.category ||
          "Web",

        shortDescription:
          req.body
            ?.shortDescription ||
          "",

        challenge:
          req.body?.challenge ||
          "",

        solution:
          req.body?.solution ||
          "",

        result:
          req.body?.result ||
          "",

        technologies:
          Array.isArray(
            req.body?.technologies
          )
            ? req.body.technologies
            : [],

        coverImage:
          req.body?.coverImage ||
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",

        gallery:
          Array.isArray(
            req.body?.gallery
          )
            ? req.body.gallery
            : [],

        projectUrl:
          req.body?.projectUrl ||
          "https://example.com",

        githubUrl:
          req.body?.githubUrl ||
          "",

        metrics:
          Array.isArray(
            req.body?.metrics
          )
            ? req.body.metrics
            : [],

        isFeatured:
          Boolean(
            req.body?.isFeatured
          ),

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.portfolio
            .length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,

        seoTitle:
          req.body?.seoTitle ||
          "",

        seoDescription:
          req.body
            ?.seoDescription ||
          "",
      };

      state.portfolio.push(
        newPortfolio
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          item:
            newPortfolio,
        });
    }
  );

  app.put(
    "/api/admin/portfolio/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.portfolio.findIndex(
          (item) =>
            item.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Portfolio item not found.",
          });
      }

      state.portfolio[
        index
      ] = {
        ...state.portfolio[
          index
        ],
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        item:
          state.portfolio[
            index
          ],
      });
    }
  );

  app.delete(
    "/api/admin/portfolio/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.portfolio =
        state.portfolio.filter(
          (item) =>
            item.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Portfolio item deleted.",
      });
    }
  );

  // ==========================================================
  // FIVERR SERVICES
  // ==========================================================

  app.get(
    "/api/admin/fiverr-services",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        fiverrServices:
          state.fiverrServices.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/fiverr-services",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const title =
        String(
          req.body?.title ||
            "Untitled Fiverr Gig"
        );

      const slug =
        req.body?.slug ||
        title
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /(^-|-$)/g,
            ""
          );

      const newGig = {
        id:
          "fvr-" +
          Date.now(),

        title,

        slug,

        category:
          req.body?.category ||
          "Web Development",

        shortDescription:
          req.body
            ?.shortDescription ||
          "",

        startingPrice:
          Number(
            req.body?.startingPrice
          ) || 250,

        rating:
          Number(
            req.body?.rating
          ) || 5,

        reviewsCount:
          Number(
            req.body?.reviewsCount
          ) || 50,

        fiverrUrl:
          req.body?.fiverrUrl ||
          "https://www.fiverr.com",

        thumbnail:
          req.body?.thumbnail ||
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",

        deliveryTimeDays:
          Number(
            req.body?.deliveryTimeDays
          ) || 5,

        features:
          Array.isArray(
            req.body?.features
          )
            ? req.body.features
            : [],

        isFeatured:
          Boolean(
            req.body?.isFeatured
          ),

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.fiverrServices
            .length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,
      };

      state.fiverrServices.push(
        newGig
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          item:
            newGig,
        });
    }
  );

  app.put(
    "/api/admin/fiverr-services/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.fiverrServices.findIndex(
          (item) =>
            item.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Fiverr service not found.",
          });
      }

      state.fiverrServices[
        index
      ] = {
        ...state.fiverrServices[
          index
        ],
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        item:
          state.fiverrServices[
            index
          ],
      });
    }
  );

  app.delete(
    "/api/admin/fiverr-services/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.fiverrServices =
        state.fiverrServices.filter(
          (item) =>
            item.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Fiverr service deleted.",
      });
    }
  );

  // ==========================================================
  // TESTIMONIALS
  // ==========================================================

  app.get(
    "/api/admin/testimonials",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        testimonials:
          state.testimonials.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/testimonials",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const newTestimonial = {
        id:
          "test-" +
          Date.now(),

        clientName:
          req.body?.clientName ||
          "Anonymous Client",

        position:
          req.body?.position ||
          "Executive",

        company:
          req.body?.company ||
          "Enterprise",

        country:
          req.body?.country ||
          "United States",

        avatarUrl:
          req.body?.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",

        rating:
          Number(
            req.body?.rating
          ) || 5,

        quote:
          req.body?.quote ||
          "",

        isFeatured:
          Boolean(
            req.body?.isFeatured
          ),

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.testimonials
            .length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,
      };

      state.testimonials.push(
        newTestimonial
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          item:
            newTestimonial,
        });
    }
  );

  app.put(
    "/api/admin/testimonials/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.testimonials.findIndex(
          (item) =>
            item.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Testimonial not found.",
          });
      }

      state.testimonials[
        index
      ] = {
        ...state.testimonials[
          index
        ],
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        item:
          state.testimonials[
            index
          ],
      });
    }
  );

  app.delete(
    "/api/admin/testimonials/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.testimonials =
        state.testimonials.filter(
          (item) =>
            item.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Testimonial deleted.",
      });
    }
  );

  // ==========================================================
  // TEAM
  // ==========================================================

  app.get(
    "/api/admin/team",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        team:
          state.team.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/team",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const newMember = {
        id:
          "team-" +
          Date.now(),

        name:
          req.body?.name ||
          "New Team Member",

        position:
          req.body?.position ||
          "Senior Engineer",

        bio:
          req.body?.bio ||
          "",

        avatarUrl:
          req.body?.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",

        linkedinUrl:
          req.body?.linkedinUrl ||
          "",

        githubUrl:
          req.body?.githubUrl ||
          "",

        twitterUrl:
          req.body?.twitterUrl ||
          "",

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.team.length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,
      };

      state.team.push(
        newMember
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          member:
            newMember,
        });
    }
  );

  app.put(
    "/api/admin/team/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.team.findIndex(
          (member) =>
            member.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Team member not found.",
          });
      }

      state.team[index] =
        {
          ...state.team[
            index
          ],
          ...req.body,
        };

      db.save();

      return res.json({
        success: true,
        member:
          state.team[index],
      });
    }
  );

  app.delete(
    "/api/admin/team/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.team =
        state.team.filter(
          (member) =>
            member.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Team member deleted.",
      });
    }
  );

  // ==========================================================
  // FAQ
  // ==========================================================

  app.get(
    "/api/admin/faqs",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        faqs:
          state.faqs.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/faqs",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const newFaq = {
        id:
          "faq-" +
          Date.now(),

        question:
          req.body?.question ||
          "New Question?",

        answer:
          req.body?.answer ||
          "Answer details...",

        category:
          req.body?.category ||
          "General",

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.faqs.length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,
      };

      state.faqs.push(
        newFaq
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          faq:
            newFaq,
        });
    }
  );

  app.put(
    "/api/admin/faqs/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.faqs.findIndex(
          (faq) =>
            faq.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "FAQ not found.",
          });
      }

      state.faqs[index] =
        {
          ...state.faqs[
            index
          ],
          ...req.body,
        };

      db.save();

      return res.json({
        success: true,
        faq:
          state.faqs[index],
      });
    }
  );

  app.delete(
    "/api/admin/faqs/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.faqs =
        state.faqs.filter(
          (faq) =>
            faq.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "FAQ deleted.",
      });
    }
  );

  // ==========================================================
  // PROCESS
  // ==========================================================

  app.get(
    "/api/admin/process",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        process:
          state.process.sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          ),
      });
    }
  );

  app.post(
    "/api/admin/process",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const newStep = {
        id:
          "proc-" +
          Date.now(),

        stepNumber:
          Number(
            req.body?.stepNumber
          ) ||
          state.process
            .length +
            1,

        title:
          req.body?.title ||
          "Step Title",

        description:
          req.body?.description ||
          "",

        icon:
          req.body?.icon ||
          "Compass",

        displayOrder:
          Number(
            req.body?.displayOrder
          ) ||
          state.process
            .length +
            1,

        isActive:
          req.body?.isActive !==
          undefined
            ? Boolean(
                req.body.isActive
              )
            : true,
      };

      state.process.push(
        newStep
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          step:
            newStep,
        });
    }
  );

  app.put(
    "/api/admin/process/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.process.findIndex(
          (step) =>
            step.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Process step not found.",
          });
      }

      state.process[
        index
      ] = {
        ...state.process[
          index
        ],
        ...req.body,
      };

      db.save();

      return res.json({
        success: true,
        step:
          state.process[
            index
          ],
      });
    }
  );

  app.delete(
    "/api/admin/process/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.process =
        state.process.filter(
          (step) =>
            step.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Process step deleted.",
      });
    }
  );

  // ==========================================================
  // LEADS
  // ==========================================================

  app.get(
    "/api/admin/leads",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const {
        status,
        type,
        search,
      } =
        req.query;

      let list = [
        ...state.leads,
      ];

      if (
        status &&
        status !== "all"
      ) {
        list =
          list.filter(
            (lead) =>
              lead.status ===
              status
          );
      }

      if (
        type &&
        type !== "all"
      ) {
        list =
          list.filter(
            (lead) =>
              lead.type ===
              type
          );
      }

      if (search) {
        const q =
          String(
            search
          ).toLowerCase();

        list =
          list.filter(
            (lead) =>
              lead.fullName
                .toLowerCase()
                .includes(q) ||
              lead.email
                .toLowerCase()
                .includes(q) ||
              (
                lead.company ||
                ""
              )
                .toLowerCase()
                .includes(q) ||
              lead.projectDetails
                .toLowerCase()
                .includes(q)
          );
      }

      return res.json({
        success: true,
        leads:
          list,
      });
    }
  );

  app.put(
    "/api/admin/leads/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const index =
        state.leads.findIndex(
          (lead) =>
            lead.id ===
            req.params.id
        );

      if (index === -1) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Lead not found.",
          });
      }

      state.leads[index] =
        {
          ...state.leads[
            index
          ],
          ...req.body,
        };

      db.save();

      return res.json({
        success: true,
        lead:
          state.leads[index],
      });
    }
  );

  app.delete(
    "/api/admin/leads/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.leads =
        state.leads.filter(
          (lead) =>
            lead.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Lead deleted.",
      });
    }
  );

  // ==========================================================
  // SUBSCRIBERS
  // ==========================================================

  app.get(
    "/api/admin/subscribers",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,

        subscribers:
          state.subscribers,
      });
    }
  );

  app.delete(
    "/api/admin/subscribers/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      state.subscribers =
        state.subscribers.filter(
          (subscriber) =>
            subscriber.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Subscriber deleted.",
      });
    }
  );

  // ==========================================================
  // MEDIA
  // ==========================================================

  app.get(
    "/api/admin/media",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      return res.json({
        success: true,
        media:
          state.media,
      });
    }
  );

  app.post(
    "/api/admin/media",
    requireAdmin,
    upload.single("file"),
    (
      req: Request,
      res: Response
    ) => {
      const file =
        (req as any).file;

      const state =
        db.getState();

      let mediaItem:
        | any
        | undefined;

      if (file) {
        mediaItem = {
          id:
            "med-" +
            Date.now(),

          filename:
            file.filename,

          originalName:
            file.originalname,

          url:
            `/uploads/${file.filename}`,

          mimeType:
            file.mimetype,

          size:
            file.size,

          createdAt:
            new Date().toISOString(),
        };
      } else if (
        req.body?.externalUrl
      ) {
        mediaItem = {
          id:
            "med-" +
            Date.now(),

          filename:
            req.body?.name ||
            "external-asset",

          originalName:
            req.body?.name ||
            "external-asset",

          url:
            req.body.externalUrl,

          mimeType:
            "image/url",

          size: 0,

          createdAt:
            new Date().toISOString(),
        };
      } else {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "No file or image URL provided.",
          });
      }

      state.media.unshift(
        mediaItem
      );

      db.save();

      return res
        .status(201)
        .json({
          success: true,
          media:
            mediaItem,
        });
    }
  );

  app.delete(
    "/api/admin/media/:id",
    requireAdmin,
    (
      req: Request,
      res: Response
    ) => {
      const state =
        db.getState();

      const item =
        state.media.find(
          (media) =>
            media.id ===
            req.params.id
        );

      if (
        item &&
        item.url.startsWith(
          "/uploads/"
        )
      ) {
        const relativePath =
          item.url.replace(
            /^\/+/,
            ""
          );

        const localPath =
          path.join(
            process.cwd(),
            "public",
            relativePath
          );

        if (
          fs.existsSync(
            localPath
          )
        ) {
          try {
            fs.unlinkSync(
              localPath
            );
          } catch {
            // Ignore filesystem deletion errors.
          }
        }
      }

      state.media =
        state.media.filter(
          (media) =>
            media.id !==
            req.params.id
        );

      db.save();

      return res.json({
        success: true,
        message:
          "Media deleted.",
      });
    }
  );

  // ==========================================================
  // RESET / SEED
  // ==========================================================

  app.post(
    "/api/admin/reset-seed",
    requireAdmin,
    (
      _req: Request,
      res: Response
    ) => {
      db.resetToSeed();

      return res.json({
        success: true,
        message:
          "Database re-seeded with premium agency records.",
      });
    }
  );

  // ==========================================================
  // VITE
  // ==========================================================

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },

        appType: "spa",
      });

    app.use(
      vite.middlewares
    );
  } else {
    const distPath =
      path.join(
        process.cwd(),
        "dist"
      );

    app.use(
      express.static(
        distPath
      )
    );

    app.get(
      "*",
      (
        _req: Request,
        res: Response
      ) => {
        res.sendFile(
          path.join(
            distPath,
            "index.html"
          )
        );
      }
    );
  }

  // ==========================================================
  // START LISTENER
  // ==========================================================

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        "=============================================="
      );

      console.log(
        `[ApexCore Agency] Server running on port ${PORT}`
      );

      console.log(
        `[ApexCore Agency] Environment: ${
          process.env.NODE_ENV ||
          "development"
        }`
      );

      console.log(
        `[Apex Shield] Threshold: ${DDOS_REQUEST_THRESHOLD} requests / ${
          DDOS_WINDOW_MS /
          1000
        } seconds`
      );

      console.log(
        `[Apex Shield] Ban duration: ${
          DDOS_BAN_DURATION_MS /
          3600000
        } hour`
      );

      console.log(
        "=============================================="
      );
    }
  );
}

// ============================================================
// START
// ============================================================

startServer().catch(
  (error) => {
    console.error(
      "[SERVER] Fatal startup error:",
      error
    );

    process.exit(1);
  }
);