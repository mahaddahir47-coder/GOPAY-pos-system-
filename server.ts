import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// In-memory sessions store to map merchantId -> active terminal state
interface TerminalSession {
  merchantId: string;
  terminal: string;
  amount: number;
  provider: string;
  invoiceId: string;
  timestamp: string;
  status: "unpaid" | "paid";
}

const terminalsStore = new Map<string, TerminalSession>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // Set CORS headers for mock server headers & external API callers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // 1. Core API Endpoint: Update terminal price
  app.post("/api/update-terminal-price", (req, res) => {
    const { merchant, terminal, amount, provider } = req.body;

    // Reject missing critical parameters
    if (merchant === undefined || amount === undefined) {
      res.status(400).json({
        success: false,
        error: "Bad Request: 'merchant' and 'amount' fields are required.",
        message: "Failed to register transaction. Please supply both merchant identifier and amount."
      });
      return;
    }

    const merchantId = String(merchant);
    const amountNum = Number(amount);
    const terminalId = String(terminal || "counter_01");
    const providerStr = String(provider || "evc");

    // Generate a unique invoice lookup token
    const invoiceId = `INV-${merchantId}-${Date.now().toString().slice(-4)}`;

    const session: TerminalSession = {
      merchantId,
      terminal: terminalId,
      amount: amountNum,
      provider: providerStr,
      invoiceId,
      timestamp: new Date().toISOString(),
      status: "unpaid",
    };

    terminalsStore.set(merchantId, session);

    // Return exact requested schema
    res.status(200).json({
      success: true,
      message: "Price registered on server successfully",
      synchronizedUrl: `https://gopay01.vercel.app/?merchant=${merchantId}`
    });
  });

  // 2. Fetch the current payment payload state for a merchant
  app.get("/api/get-terminal-price", (req, res) => {
    const merchantId = req.query.merchant;

    if (!merchantId) {
      res.status(400).json({
        success: false,
        error: "Bad Request: 'merchant' query parameter is required."
      });
      return;
    }

    const session = terminalsStore.get(String(merchantId));

    if (!session) {
      res.status(404).json({
        success: false,
        message: "No active checkout requests on POS terminal for this merchant identifier."
      });
      return;
    }

    res.status(200).json({
      success: true,
      session
    });
  });

  // 3. Mark POS checkout session as paid from mobile checkout portal
  app.post("/api/pay-terminal-price", (req, res) => {
    const { merchantId } = req.body;

    if (!merchantId) {
      res.status(400).json({
        success: false,
        error: "Missing merchantId parameter."
      });
      return;
    }

    const session = terminalsStore.get(String(merchantId));
    if (session) {
      session.status = "paid";
      terminalsStore.set(String(merchantId), session);
      res.status(200).json({
        success: true,
        message: "Transaction marked as settled.",
        session
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No session found to satisfy checkout payment status update."
      });
    }
  });

  // Static site assets & SPA server configuration
  if (process.env.NODE_ENV !== "production") {
    // Vite Middlewares in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Static assets distribution in production deployment
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GoPay Server] Express application listening at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to launch fullstack GoPay Express server", err);
  process.exit(1);
});
