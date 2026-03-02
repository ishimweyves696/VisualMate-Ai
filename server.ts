import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_SECRET = process.env.SESSION_SECRET || "visualmate_session_secret_123";

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    user: { id: string; email: string };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1); // trust first proxy
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'visualmate.sid', // Custom session cookie name
    cookie: {
      httpOnly: true,
      secure: true, // Required for sameSite: 'none'
      sameSite: "none", // Required for AI Studio iframe
      maxAge: 30 * 60 * 1000 // 30 minutes
    }
  }));

  // --- Authentication Implementation ---

  // Mock user for demo purposes
  const DEMO_USER = {
    id: "user_123",
    email: "ishimweyves217@gmail.com",
    password: "password123" // In a real app, this would be hashed
  };

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      req.session.user = { id: DEMO_USER.id, email: DEMO_USER.email };
      return res.json({ user: req.session.user });
    }

    res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.clearCookie("visualmate.sid", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // --- End Authentication Implementation ---

  // --- XentriPAY API Placeholder Implementation ---
  
  // Endpoint to create a payment session
  app.post("/api/payments/create-session", async (req, res) => {
    const { plan, cycle, userEmail } = req.body;
    
    const XENTRIPAY_API_KEY = process.env.XENTRIPAY_API_KEY;
    const XENTRIPAY_MERCHANT_ID = process.env.XENTRIPAY_MERCHANT_ID;

    console.log(`Creating XentriPAY session for ${userEmail} - Plan: ${plan}`);

    if (!XENTRIPAY_API_KEY || XENTRIPAY_API_KEY === "placeholder_key") {
      // --- STEP 1: PLACEHOLDER MODE ---
      // This allows the app to load and function in demo mode without real keys.
      return res.json({
        success: true,
        checkoutUrl: "https://xentripay.com/mock-checkout?session=123",
        message: "Using placeholder XentriPAY integration"
      });
    }

    try {
      // --- STEP 2: REAL INTEGRATION ---
      // When you have your real API keys, replace the logic below with the 
      // actual XentriPAY API request. Refer to XentriPAY documentation for 
      // the exact endpoint and payload structure.
      
      // Example structure:
      /*
      const response = await fetch('https://api.xentripay.com/v1/checkout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${XENTRIPAY_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          merchantId: XENTRIPAY_MERCHANT_ID, 
          amount: plan === 'PRO' ? 2900 : 9900, // in cents
          currency: 'USD',
          successUrl: `${process.env.APP_URL}/dashboard?payment=success`,
          cancelUrl: `${process.env.APP_URL}/pricing`,
          customerEmail: userEmail
        })
      });
      const data = await response.json();
      return res.json({ checkoutUrl: data.url });
      */
      
      res.status(501).json({ error: "Real XentriPAY integration logic not yet implemented in server.ts" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment session" });
    }
  });

  // Webhook endpoint for XentriPAY to notify us of successful payment
  app.post("/api/payments/webhook", (req, res) => {
    const payload = req.body;
    console.log("Received XentriPAY Webhook:", payload);
    // 1. Verify webhook signature
    // 2. Update user subscription in database
    res.status(200).send("Webhook received");
  });

  // --- End XentriPAY Implementation ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
