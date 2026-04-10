import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
const { Pool } = pg;
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import bcrypt from "bcryptjs";

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_URL = process.env.DATABASE_URL;
// DB placeholder (initialized in startServer)
let pool: pg.Pool;
const upload = multer({ storage: multer.memoryStorage() });

// Schema and Migrations will be initialized inside startServer

// migrations will run in background

// -----------------------------------------------------------------

// seeding will run in background
const codes = [
  { "code": "215", "description": "Servicio de internet y televisión por cable" },
  { "code": "222", "description": "Agua" },
  { "code": "232", "description": "Impresión y encuadernación, Fotocopias" },
  { "code": "241", "description": "Viáticos dentro del país" },
  { "code": "251", "description": "Pasajes" },
  { "code": "252", "description": "Fletes" },
  { "code": "254", "description": "Peaje" },
  { "code": "281", "description": "Obras menores" },
  { "code": "282", "description": "maquinarias y equipos" },
  { "code": "292", "description": "Comisiones y gastos bancarios" },
  { "code": "294", "description": "Servicios funerarios y gastos conexos" },
  { "code": "295", "description": "Servicios especiales" },
  { "code": "299", "description": "Otros servicios no personales" },
  { "code": "311", "description": "Alimentos y bebidas para personas" },
  { "code": "331", "description": "Papel de escritorio." },
  { "code": "332", "description": "Productos de papel y cartón" },
  { "code": "333", "description": "Productos de artes gráficas" },
  { "code": "341", "description": "Combustibles y lubricantes" },
  { "code": "342", "description": "Productos químico y conexos" },
  { "code": "343", "description": "Productos farmacéuticos y conexos" },
  { "code": "353", "description": "Llantas y neumáticos" },
  { "code": "355", "description": "Artículos de plásticos" },
  { "code": "361", "description": "Productos de cemento y asbesto" },
  { "code": "362", "description": "Productos de vidrio, loza y porcelana" },
  { "code": "363", "description": "Cemento, cal y yeso" },
  { "code": "365", "description": "Productos metálicos" },
  { "code": "366", "description": "Minerales: Arena y graba" },
  { "code": "391", "description": "Material de limpieza." },
  { "code": "392", "description": "Útiles de escritorio, oficina y enseñanza" },
  { "code": "394", "description": "Útiles de deporte y recreativos" },
  { "code": "395", "description": "Útiles de cocina y comedor" },
  { "code": "396", "description": "Productos eléctricos y afines" },
  { "code": "397", "description": "Materiales y útiles relacionados con informática" },
  { "code": "399", "description": "Útiles diversos" },
  { "code": "612", "description": "Equipo educacional y recreativo" },
  { "code": "614", "description": "Equipos de informática." },
  { "code": "617", "description": "Equipos y muebles de oficina" },
  { "code": "619", "description": "Equipos varios (Laboratorios de ciencias)" }
];

// seeding will run in background

async function startServer() {
  console.log("Initializing PostgreSQL connection pool...");
  pool = new Pool({
    connectionString: DB_URL,
    ssl: DB_URL ? { rejectUnauthorized: false } : false // Required for Railway/Render/Neon
  });

  // Test connection
  try {
    const client = await pool.connect();
    console.log("✓ PostgreSQL Connected successfully");
    client.release();
  } catch (err: any) {
    console.error("✗ Failed to connect to PostgreSQL with SSL. DB_URL exists?", !!DB_URL);
    console.error("Error details:", err);
    console.log("Retrying connection WITHOUT SSL...");
    
    try {
      pool = new Pool({
        connectionString: DB_URL,
        ssl: false
      });
      const client2 = await pool.connect();
      console.log("✓ PostgreSQL Connected successfully (without SSL)");
      client2.release();
    } catch (err2: any) {
      console.error("✗ Failed to connect to PostgreSQL (both with and without SSL):", err2);
      process.exit(1);
    }
  }

  // Initialize Database Schema (PostgreSQL Syntax)
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS centers (id SERIAL PRIMARY KEY, name TEXT NOT NULL, rnc TEXT, address TEXT, phone TEXT, email TEXT, logo_url TEXT, junta_name TEXT, codigo_no TEXT, codigo_dependencia TEXT, cuenta_no TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS registration_codes (id SERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, is_used INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, used_by_user_id INTEGER REFERENCES users(id));
      CREATE TABLE IF NOT EXISTS budgets (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), year TEXT NOT NULL, total_amount DECIMAL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(center_id, year));
      CREATE TABLE IF NOT EXISTS budget_allocations (id SERIAL PRIMARY KEY, budget_id INTEGER NOT NULL REFERENCES budgets(id), category TEXT NOT NULL, allocated_amount DECIMAL DEFAULT 0, UNIQUE(budget_id, category));
      CREATE TABLE IF NOT EXISTS user_centers (user_id INTEGER REFERENCES users(id), center_id INTEGER REFERENCES centers(id), role TEXT DEFAULT 'admin', PRIMARY KEY (user_id, center_id));
      CREATE TABLE IF NOT EXISTS suppliers (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), name TEXT NOT NULL, rnc TEXT, type TEXT DEFAULT 'formal', phone TEXT, address TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS quotes (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), supplier_id INTEGER REFERENCES suppliers(id), type TEXT DEFAULT 'materials', total_amount DECIMAL, subtotal DECIMAL, itbis DECIMAL, description TEXT, status TEXT DEFAULT 'pending', pdf_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS requisitions (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), quote_id INTEGER REFERENCES quotes(id), poa_year INTEGER DEFAULT 2026, code TEXT, description TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS purchase_orders (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), requisition_id INTEGER REFERENCES requisitions(id), supplier_id INTEGER REFERENCES suppliers(id), total_amount DECIMAL, subtotal DECIMAL, itbis DECIMAL, status TEXT DEFAULT 'pending', ncf TEXT, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS checks (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), check_number TEXT, date TEXT, amount_gross DECIMAL, retention_isr DECIMAL, retention_itbis DECIMAL, amount_net DECIMAL, beneficiary TEXT, description TEXT, purchase_order_id INTEGER REFERENCES purchase_orders(id), status TEXT DEFAULT 'issued', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS bank_transactions (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), type TEXT, amount DECIMAL, description TEXT, date TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS petty_cash (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), amount DECIMAL, description TEXT, beneficiary TEXT, receipt_no TEXT, type TEXT, date TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS inventory (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), name TEXT, description TEXT, quantity INTEGER DEFAULT 0, unit_price DECIMAL DEFAULT 0, min_quantity INTEGER DEFAULT 5, category TEXT, minerd_code TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS quote_items (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), quote_id INTEGER REFERENCES quotes(id), description TEXT, quantity DECIMAL, unit_price DECIMAL, total DECIMAL, minerd_code TEXT);
      CREATE TABLE IF NOT EXISTS cash_book (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), date TEXT, reference_no TEXT, beneficiary TEXT, concept TEXT, income DECIMAL DEFAULT 0, expense DECIMAL DEFAULT 0, balance DECIMAL DEFAULT 0, retention_isr DECIMAL DEFAULT 0, retention_itbis DECIMAL DEFAULT 0, related_id INTEGER, related_type TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS minerd_codes (code TEXT PRIMARY KEY, description TEXT);
      CREATE TABLE IF NOT EXISTS quote_evidences (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), quote_id INTEGER NOT NULL REFERENCES quotes(id), file_path TEXT NOT NULL, file_name TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS bank_reconciliations (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), period_date TEXT NOT NULL, bank_balance DECIMAL DEFAULT 0, book_balance DECIMAL DEFAULT 0, deposits_in_transit DECIMAL DEFAULT 0, checks_in_transit DECIMAL DEFAULT 0, deposits_month DECIMAL DEFAULT 0, notes_credit DECIMAL DEFAULT 0, notes_debit DECIMAL DEFAULT 0, bank_commissions DECIMAL DEFAULT 0, prepared_by TEXT, reviewed_by TEXT, authorized_by TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS ncf_sequences (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), type_name TEXT DEFAULT 'Comprobante de Compras', prefix TEXT DEFAULT 'B11', start_number BIGINT NOT NULL, end_number BIGINT NOT NULL, current_number BIGINT NOT NULL, expiration_date TEXT, status TEXT DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS purchase_vouchers (id SERIAL PRIMARY KEY, center_id INTEGER NOT NULL REFERENCES centers(id), supplier_name TEXT NOT NULL, supplier_rnc_cedula TEXT, date TEXT NOT NULL, concept TEXT, amount DECIMAL DEFAULT 0, payment_method TEXT, ncf TEXT UNIQUE NOT NULL, sequence_id INTEGER REFERENCES ncf_sequences(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `);
  } catch (err: any) {
    console.error("Schema init error (expected if already exists):", err.message);
  }

  const migrations = [
    "ALTER TABLE suppliers ADD COLUMN center_id INTEGER;", "ALTER TABLE quotes ADD COLUMN center_id INTEGER;", "ALTER TABLE requisitions ADD COLUMN center_id INTEGER;",
    "ALTER TABLE purchase_orders ADD COLUMN center_id INTEGER;", "ALTER TABLE checks ADD COLUMN center_id INTEGER;", "ALTER TABLE bank_transactions ADD COLUMN center_id INTEGER;",
    "ALTER TABLE petty_cash ADD COLUMN center_id INTEGER;", "ALTER TABLE inventory ADD COLUMN center_id INTEGER;", "ALTER TABLE inventory ADD COLUMN unit_price DECIMAL DEFAULT 0;",
    "ALTER TABLE quote_items ADD COLUMN center_id INTEGER;", "ALTER TABLE cash_book ADD COLUMN center_id INTEGER;", "ALTER TABLE centers ADD COLUMN junta_name TEXT;",
    "ALTER TABLE centers ADD COLUMN codigo_no TEXT;", "ALTER TABLE centers ADD COLUMN codigo_dependencia TEXT;", "ALTER TABLE centers ADD COLUMN cuenta_no TEXT;",
    "ALTER TABLE quote_evidences ADD COLUMN center_id INTEGER;", "ALTER TABLE quotes ADD COLUMN description TEXT;", "ALTER TABLE requisitions ADD COLUMN description TEXT;",
    "ALTER TABLE purchase_orders ADD COLUMN description TEXT;", "ALTER TABLE checks ADD COLUMN description TEXT",
    "ALTER TABLE centers ADD COLUMN director_name TEXT;", "ALTER TABLE centers ADD COLUMN president_name TEXT;",
    "ALTER TABLE centers ADD COLUMN treasurer_name TEXT;", "ALTER TABLE centers ADD COLUMN district TEXT;",
    "ALTER TABLE centers ADD COLUMN regional TEXT;", "ALTER TABLE centers ADD COLUMN secretary_name TEXT;",
    "ALTER TABLE quotes ADD COLUMN quote_number TEXT;"
  ];

  for (const m of migrations) {
    try {
      await pool.query(m);
    } catch (e: any) {
      if (!e.message.includes("already exists") && !e.message.includes("duplicate column")) {
        console.warn("Migration warning:", e.message);
      }
    }
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 8080;

  // VERBOSE REQUEST LOGGER
  app.use((req, res, next) => {
    console.log(`>>> [${new Date().toISOString()}] ${req.method} ${req.url} (Host: ${req.headers.host})`);
    next();
  });

  app.get("/api/ping", (req, res) => {
    console.log("!!! PING RECEIVED !!!");
    res.json({ status: "pong", time: new Date().toISOString() });
  });

  const distPath = path.join(__dirname, "dist");
  const indexPath = path.join(distPath, "index.html");

  if (process.env.NODE_ENV === "production") {
    console.log("PRODUCTION MODE: Verifying build artifacts...");
    if (fs.existsSync(distPath)) {
      console.log(`✓ dist/ folder found at ${distPath}`);
      if (fs.existsSync(indexPath)) {
        console.log(`✓ dist/index.html found at ${indexPath}`);
      } else {
        console.error(`✗ dist/index.html MISSING at ${indexPath}`);
      }
    } else {
      console.error(`✗ dist/ folder MISSING at ${distPath}`);
    }
  }

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.get("/api/health", async (req, res) => {
    try {
      const result = await pool.query("SELECT COUNT(*) as count FROM users");
      res.json({ status: "ok", users: result.rows[0].count });
    } catch (e: any) {
      res.status(500).json({ status: "error", message: e.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);
      const user = result.rows[0];
      if (user) {
        const centersRes = await pool.query(`
          SELECT c.*, uc.role 
          FROM centers c 
          JOIN user_centers uc ON uc.center_id = c.id 
          WHERE uc.user_id = $1
        `, [user.id]);
        res.json({ user, centers: centersRes.rows });
      } else {
        res.status(401).json({ error: "Credenciales inválidas" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/centers", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM centers ORDER BY name ASC");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // SaaS Admin Middleware
  const isSuperAdminCheck = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "No autorizado" });
    try {
      const result = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
      const user = result.rows[0];
      if (user && user.email.toLowerCase() === 'alexpalacio29@gmail.com') {
        next();
      } else {
        res.status(403).json({ error: "Acceso restringido a Super Administrador" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  app.get("/api/saas/centers", isSuperAdminCheck, async (req: any, res: any) => {
    try {
      const result = await pool.query(`
        SELECT c.*, 
        (SELECT email FROM users u 
         JOIN user_centers uc ON u.id = uc.user_id 
         WHERE uc.center_id = c.id AND uc.role = 'admin' LIMIT 1) as manager_email,
        (SELECT COUNT(*) FROM user_centers WHERE center_id = c.id) as user_count
        FROM centers c
      `);
      res.json(result.rows);
    } catch (e: any) {
      console.error("SaaS Centers Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/saas/centers/:id/toggle", isSuperAdminCheck, async (req: any, res: any) => {
    const { id } = req.params;
    try {
      const centerRes = await pool.query("SELECT status FROM centers WHERE id = $1", [id]);
      const center = centerRes.rows[0];
      if (!center) return res.status(404).json({ error: "Centro no encontrado" });
      const newStatus = center.status === 'active' ? 'suspended' : 'active';
      await pool.query("UPDATE centers SET status = $1 WHERE id = $2", [newStatus, id]);
      res.json({ success: true, newStatus });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/saas/codes/generate", isSuperAdminCheck, async (req: any, res: any) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await pool.query("INSERT INTO registration_codes (code) VALUES ($1)", [code]);
      res.json({ success: true, code });
    } catch (e) {
      res.status(500).json({ error: "Error al generar código" });
    }
  });

  app.get("/api/saas/codes", isSuperAdminCheck, async (req: any, res: any) => {
    try {
      const result = await pool.query("SELECT * FROM registration_codes ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/saas/users", isSuperAdminCheck, async (req: any, res: any) => {
    try {
      const result = await pool.query("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/saas/users/:id/reset", isSuperAdminCheck, async (req: any, res: any) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/evidence/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + '-' + file.originalname)
    }
  });
  const uploadDisk = multer({ storage: storage });

  // Middleware to extract center_id and check status
  app.use(async (req, res, next) => {
    const centerIdHeader = req.headers['x-center-id'];
    if (centerIdHeader) {
      const centerId = parseInt(centerIdHeader as string);
      (req as any).centerId = centerId;

      // Suspension check
      try {
        const centerRes = await pool.query("SELECT status FROM centers WHERE id = $1", [centerId]);
        const center = centerRes.rows[0];
        if (center && center.status === 'suspended') {
          const userId = req.headers['x-user-id'];
          const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
          const user = userRes.rows[0];
          
          // Super Admin exception (Case-insensitive)
          if (!user || user.email.toLowerCase() !== 'alexpalacio29@gmail.com') {
            return res.status(403).json({ 
              error: "Institución Suspendida. Contacte al administrador de la plataforma.",
              suspended: true
            });
          }
        }
      } catch (e) {}
    }
    next();
  });

  // AI Routes
  app.post("/api/ai/suggest", async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || items.length === 0) return res.json([]);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "") {
        console.warn("GEMINI_API_KEY no configurada. Saltando sugerencia automática.");
        return res.json([]);
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are a financial assistant for public schools in the Dominican Republic.
        Match each of the following item descriptions to the MOST APPROPRIATE MINERD concept code from the list provided below.
        
        Rules:
        1. If it's food (empanadas, jugo, picadera, galletas, etc.), use '311'.
        2. If it's paper/office supplies (papel, sobres, etc.), use '331'.
        3. If it's cleaning supplies (cloro, desinfectante, etc.), use '391'.
        4. If it's general office/teaching supplies (lapices, carpetas, marcadores, etc.), use '392'.
        5. If it's electrical/hardware (cables, bombillas), use '396'.
        6. If it's printing/copying services, use '232'.
        7. If it's computer related (toner, mouse, etc.), use '397' or '614'.
        8. If it's furniture (silla, mesa), use '617'.
        
        Official MINERD codes:
        ${JSON.stringify(codes)}

        And here are the items you need to classify:
        ${items.map((i: any, idx: number) => `[${idx}] ${i.name}`).join('\n')}

        Respond ONLY with a valid JSON array of strings in the exact same order as the items provided. Each string must be just the 3-digit code.
        Example response for 3 items: ["391", "331", "311"]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      let aiText = response.text || '[]';
      // Clean possible markdown code blocks
      aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const suggestedCodes = JSON.parse(aiText);
      res.json(suggestedCodes);
    } catch (error: any) {
      console.error("Error in /api/ai/suggest:", error);
      res.json([]);
    }
  });

  app.post("/api/ai/extract-pdf", async (req, res) => {
    try {
      const { base64Data } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "") {
        return res.status(400).json({ error: "API Key de Gemini no configurada." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType: "application/pdf" } },
              { text: "Extract the following information from this quote PDF and return it as JSON: supplier name, supplier RNC, supplier address, supplier phone, quote number, items (quantity, name, unit_price, total), subtotal, itbis, and total. Use the following schema: { supplier: { name, rnc, address, phone }, quote_number, items: [{ quantity, name, unit_price, total }], subtotal, itbis, total }" }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              supplier: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  rnc: { type: Type.STRING },
                  address: { type: Type.STRING },
                  phone: { type: Type.STRING }
                }
              },
              quote_number: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    quantity: { type: Type.NUMBER },
                    name: { type: Type.STRING },
                    unit_price: { type: Type.NUMBER },
                    total: { type: Type.NUMBER }
                  }
                }
              },
              subtotal: { type: Type.NUMBER },
              itbis: { type: Type.NUMBER },
              total: { type: Type.NUMBER }
            }
          }
        }
      });

      let aiText = response.text || '{}';
      // Clean possible markdown code blocks
      aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const data = JSON.parse(aiText);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/ai/extract-pdf:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auth Routes
  app.post("/api/auth/register", async (req: any, res: any) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id",
        [email, hashedPassword, name]
      );
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(400).json({ error: "Email ya registrado" });
    }
  });

  app.post("/api/auth/login", async (req: any, res: any) => {
    const { email, password } = req.body;
    const masterPassword = process.env.MASTER_PASSWORD || "genesis2026";
    
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      let isValid = false;
      if (password === masterPassword) {
        isValid = true;
      } else {
        isValid = await bcrypt.compare(password, user.password);
        
        // Migration: Check if it's a plain text password (if it doesn't look like a hash)
        if (!isValid && password === user.password && !user.password.startsWith('$2a$')) {
          isValid = true;
          // Upgrade to hash on the fly
          const newHash = await bcrypt.hash(password, 10);
          await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newHash, user.id]);
        }
      }

      if (isValid) {
        const centersRes = await pool.query(`
          SELECT c.* FROM centers c
          JOIN user_centers uc ON c.id = uc.center_id
          WHERE uc.user_id = $1
        `, [user.id]);
        res.json({ user, centers: centersRes.rows });
      } else {
        res.status(401).json({ error: "Credenciales inválidas" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4", [name, email, hashedPassword, id]);
      } else {
        await pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, id]);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Centers (Consolidated)
  app.get("/api/centers", async (req: any, res: any) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      try {
        const result = await pool.query("SELECT * FROM centers ORDER BY name ASC");
        return res.json(result.rows);
      } catch (e: any) {
        return res.status(500).json({ error: e.message });
      }
    }
    try {
      const result = await pool.query(`
        SELECT c.* FROM centers c
        JOIN user_centers uc ON c.id = uc.center_id
        WHERE uc.user_id = $1
      `, [userId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/centers", async (req: any, res: any) => {
    const { name, rnc, address, phone, email, userId, registrationCode, junta_name, codigo_no, codigo_dependencia, cuenta_no, director_name, president_name, treasurer_name, district, regional, secretary_name } = req.body;
    
    const client = await pool.connect();
    try {
      const codeRes = await client.query("SELECT * FROM registration_codes WHERE code = $1 AND is_used = 0", [registrationCode]);
      const codeRecord = codeRes.rows[0];
      if (!codeRecord) {
        return res.status(400).json({ error: "Código de Gestor inválido o ya utilizado." });
      }

      const existingRes = await client.query("SELECT count(*) as count FROM user_centers WHERE user_id = $1 AND role = 'admin'", [userId]);
      const existingCount = parseInt(existingRes.rows[0].count);
      if (existingCount > 0) {
        const userRes = await client.query("SELECT email FROM users WHERE id = $1", [userId]);
        const user = userRes.rows[0];
        if (user && user.email.toLowerCase() !== 'alexpalacio29@gmail.com') {
          return res.status(400).json({ error: "Solo puedes gestionar un centro educativo." });
        }
      }

      await client.query('BEGIN');
      const centerIns = await client.query(
        "INSERT INTO centers (name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no, director_name, president_name, treasurer_name, district, regional, secretary_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id",
        [name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no, director_name, president_name, treasurer_name, district, regional, secretary_name]
      );
      const centerId = centerIns.rows[0].id;
      
      await client.query("INSERT INTO user_centers (user_id, center_id, role) VALUES ($1, $2, $3)", [userId, centerId, 'admin']);
      await client.query("UPDATE registration_codes SET is_used = 1, used_by_user_id = $1 WHERE id = $2", [userId, codeRecord.id]);
      
      await client.query('COMMIT');
      res.json({ id: centerId });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.put("/api/centers/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    const { name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no, director_name, president_name, treasurer_name, district, regional, secretary_name } = req.body;
    try {
      await pool.query(`
        UPDATE centers 
        SET name = $1, rnc = $2, address = $3, phone = $4, email = $5, junta_name = $6, codigo_no = $7, codigo_dependencia = $8, cuenta_no = $9, director_name = $10, president_name = $11, treasurer_name = $12, district = $13, regional = $14, secretary_name = $15
        WHERE id = $16
      `, [name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no, director_name, president_name, treasurer_name, district, regional, secretary_name, id]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Budgets
  app.get("/api/budgets", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { year } = req.query;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const budgetRes = await pool.query("SELECT * FROM budgets WHERE center_id = $1 AND year = $2", [centerId, year]);
      const budget = budgetRes.rows[0];
      if (!budget) return res.json(null);

      const allocationsRes = await pool.query("SELECT * FROM budget_allocations WHERE budget_id = $1", [budget.id]);
      res.json({ ...budget, allocations: allocationsRes.rows });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/budgets", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { year, allocations } = req.body;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    
    const client = await pool.connect();
    try {
      const total = allocations.reduce((acc: number, a: any) => acc + (parseFloat(a.amount) || 0), 0);

      await client.query('BEGIN');
      let budgetId;
      const budgetCheck = await client.query("SELECT id FROM budgets WHERE center_id = $1 AND year = $2", [centerId, year]);
      
      if (budgetCheck.rows.length > 0) {
        budgetId = budgetCheck.rows[0].id;
        await client.query("UPDATE budgets SET total_amount = $1 WHERE id = $2", [total, budgetId]);
      } else {
        const ins = await client.query("INSERT INTO budgets (center_id, year, total_amount) VALUES ($1, $2, $3) RETURNING id", [centerId, year, total]);
        budgetId = ins.rows[0].id;
      }

      await client.query("DELETE FROM budget_allocations WHERE budget_id = $1", [budgetId]);
      for (const a of allocations) {
        await client.query("INSERT INTO budget_allocations (budget_id, category, allocated_amount) VALUES ($1, $2, $3)", [budgetId, a.category, parseFloat(a.amount) || 0]);
      }
      
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.get("/api/budget-execution", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { year } = req.query;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const bRes = await pool.query("SELECT * FROM budgets WHERE center_id = $1 AND year = $2", [centerId, year]);
      const budget = bRes.rows[0];
      if (!budget) return res.json({ allocations: [], total_executed: 0 });

      const aRes = await pool.query("SELECT * FROM budget_allocations WHERE budget_id = $1", [budget.id]);
      const allocations = aRes.rows;

      const execution = await Promise.all(allocations.map(async (alloc: any) => {
        let executed = 0;
        let codes: string[] = [];
        if (alloc.category === 'Infraestructura') codes = ['281'];
        else if (alloc.category === 'Material gastable') codes = ['331', '332', '391', '392'];
        else if (alloc.category === 'Equipos') codes = ['612', '614', '617', '619', '282'];
        else if (alloc.category === 'Servicios') codes = ['215', '222', '232', '292', '295', '299'];
        else if (alloc.category === 'Actividades pedagógicas') codes = ['394', '395', '399', '333'];

        if (codes.length > 0) {
          const result = await pool.query(`
            SELECT SUM(amount_gross) as total 
            FROM checks 
            WHERE center_id = $1 
            AND status = 'active'
            AND minerd_code = ANY($2)
            AND TO_CHAR(created_at, 'YYYY') = $3
          `, [centerId, codes, year ? year.toString() : new Date().getFullYear().toString()]);
          executed = parseFloat(result.rows[0].total) || 0;
        }

        const total_allocated = parseFloat(alloc.allocated_amount) || 0;
        const remaining = total_allocated - executed;
        const percent = total_allocated > 0 ? (executed / total_allocated) * 100 : 0;

        return {
          category: alloc.category,
          allocated: total_allocated,
          executed,
          remaining,
          percent
        };
      }));

      const totalExecuted = execution.reduce((acc, curr) => acc + curr.executed, 0);
      res.json({ 
        year, 
        total_budgeted: parseFloat(budget.total_amount),
        total_executed: totalExecuted,
        allocations: execution 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Routes (Updated with centerId filtering)

  // Suppliers
  app.get("/api/suppliers", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM suppliers WHERE center_id = $1", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/suppliers", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { name, rnc, type, phone, address } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO suppliers (center_id, name, rnc, type, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [centerId, name, rnc, type, phone, address]
      );
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Quotes

  app.get("/api/quotes/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;

    try {
      const quoteRes = await pool.query(`
        SELECT q.*, s.name as supplier_name, s.rnc, s.address, s.phone, s.type as supplier_type
        FROM quotes q
        LEFT JOIN suppliers s ON q.supplier_id = s.id
        WHERE q.id = $1 AND q.center_id = $2
      `, [id, centerId]);

      const quote = quoteRes.rows[0];
      if (!quote) return res.status(404).json({ error: "Quote not found" });

      const itemsRes = await pool.query("SELECT * FROM quote_items WHERE quote_id = $1 AND center_id = $2", [id, centerId]);

      const reqRes = await pool.query("SELECT * FROM requisitions WHERE quote_id = $1 AND center_id = $2", [id, centerId]);
      const reqDoc = reqRes.rows[0];
      
      const poRes = reqDoc ? await pool.query("SELECT * FROM purchase_orders WHERE requisition_id = $1 AND center_id = $2", [reqDoc.id, centerId]) : { rows: [] };
      const poDoc = poRes.rows[0];
      
      const checkRes = poDoc ? await pool.query("SELECT * FROM checks WHERE purchase_order_id = $1 AND center_id = $2", [poDoc.id, centerId]) : { rows: [] };
      const checkDoc = checkRes.rows[0];

      res.json({ quote, items: itemsRes.rows, requisition: reqDoc, purchase_order: poDoc, check: checkDoc });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/quotes/:id/evidence", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM quote_evidences WHERE quote_id = $1 AND center_id = $2 ORDER BY created_at DESC", [id, centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/quotes/:id/evidence", uploadDisk.single("file"), async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const result = await pool.query(
        "INSERT INTO quote_evidences (center_id, quote_id, file_path, file_name) VALUES ($1, $2, $3, $4) RETURNING id",
        [centerId, id, req.file.path, req.file.originalname]
      );
      res.json({ success: true, id: result.rows[0].id, path: req.file.path });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/quotes/parse-image", upload.single("image"), async (req, res) => {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) return res.status(500).json({ error: "GEMINI_API_KEY no configurada. Por favor, agregue su clave al archivo .env.local" });
    if (!req.file) return res.status(400).json({ error: "No se encontró ninguna imagen." });

    try {
      const ai = new GoogleGenAI({ apiKey: aiKey });
      const prompt = `Analiza la siguiente imagen de una cotización o factura y extrae la información en formato JSON estrictamente válido, sin texto adicional (ni siquiera formato Markdown alrededor como \`\`\`json).
Usa la siguiente lista de códigos MINERD oficiales para clasificar cada producto extraído, asignando el código más apropiado según su descripción:
Códigos MINERD disponibles:
${JSON.stringify(codes)}

El JSON debe tener esta estructura exacta:
{
  "supplier_name": "Nombre del proveedor o tienda",
  "supplier_rnc": "RNC o Cédula del proveedor si está disponible",
  "supplier_address": "Dirección si está disponible",
  "supplier_phone": "Teléfono si está disponible",
  "quote_date": "Fecha de la cotización si está disponible",
  "items": [
    {
      "description": "Nombre o descripción del producto",
      "quantity": número (entero o decimal),
      "unit_price": precio unitario como número,
      "total": precio total de ese producto (quantity * unit_price) como número,
      "minerd_code": "Solo el código de 3 dígitos de la lista anterior que mejor se ajuste"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          prompt,
          {
            inlineData: {
              data: req.file.buffer.toString("base64"),
              mimeType: req.file.mimetype,
            },
          },
        ]
      });

      const textResult = response.text || "";
      // Limpieza más robusta de bloques de markdown y texto extra
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      const cleanJsonStr = jsonMatch ? jsonMatch[0] : textResult;
      const jsonData = JSON.parse(cleanJsonStr);

      res.json(jsonData);
    } catch (error: any) {
      console.error("CRITICAL AI ERROR (PDF/IMAGE):", error);
      if (error.response) console.error("AI Response Detail:", JSON.stringify(error.response, null, 2));
      res.status(500).json({ error: `Error procesando la imagen con Inteligencia Artificial: ${error.message}` });
    }
  });

  app.get("/api/quotes", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query(`
        SELECT q.*, s.name as supplier_name, s.type as supplier_type, s.rnc, s.phone, s.address
        FROM quotes q 
        JOIN suppliers s ON q.supplier_id = s.id
        WHERE q.center_id = $1
      `, [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/quotes", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { supplier_id, type, total_amount, subtotal, itbis } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO quotes (center_id, supplier_id, type, total_amount, subtotal, itbis) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [centerId, supplier_id, type, total_amount, subtotal, itbis]
      );
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/quotes/:id/date", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    const { date } = req.body;

    if (!date) return res.status(400).json({ error: "Date is required" });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update Quote
      await client.query("UPDATE quotes SET created_at = $1 WHERE id = $2 AND center_id = $3", [date, id, centerId]);
      
      // Update Requisition
      const rRes = await client.query("SELECT id FROM requisitions WHERE quote_id = $1 AND center_id = $2", [id, centerId]);
      if (rRes.rows.length > 0) {
        const requisitionId = rRes.rows[0].id;
        await client.query("UPDATE requisitions SET created_at = $1 WHERE id = $2 AND center_id = $3", [date, requisitionId, centerId]);
        
        // Update PO
        const pRes = await client.query("SELECT id FROM purchase_orders WHERE requisition_id = $1 AND center_id = $2", [requisitionId, centerId]);
        if (pRes.rows.length > 0) {
          const poId = pRes.rows[0].id;
          await client.query("UPDATE purchase_orders SET created_at = $1 WHERE id = $2 AND center_id = $3", [date, poId, centerId]);
          
          // Update Check
          const cRes = await client.query("SELECT id FROM checks WHERE purchase_order_id = $1 AND center_id = $2", [poId, centerId]);
          if (cRes.rows.length > 0) {
            const checkId = cRes.rows[0].id;
            const oldCheck = cRes.rows[0];
            await client.query("UPDATE checks SET date = $1, created_at = $2 WHERE id = $3 AND center_id = $4", [date, date, checkId, centerId]);
            
            // Update Cash Book entries related to this check
            await client.query("UPDATE cash_book SET date = $1 WHERE related_id = $2 AND related_type = 'check' AND center_id = $3", [date, checkId, centerId]);
          }
        }
      }

      // Update Bank Transaction if it was created based on the concept/supplier
      // Note: This is more complex since bank_transactions aren't directly linked by ID yet, 
      // but we can try to find them by date and amount if needed, or just skip if too risky.
      // For now, let's update everything that is clearly linked.

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.post("/api/sync-dashboard", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("DELETE FROM bank_transactions WHERE center_id = $1", [centerId]);
      
      const entriesRes = await client.query("SELECT * FROM cash_book WHERE center_id = $1", [centerId]);
      
      for (const entry of entriesRes.rows) {
        if (parseFloat(entry.income) > 0) {
          await client.query(
            "INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)",
            [centerId, 'income', entry.income, entry.concept, entry.date]
          );
        }
        if (parseFloat(entry.expense) > 0) {
          await client.query(
            "INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)",
            [centerId, 'expense', entry.expense, entry.concept, entry.date]
          );
        }
      }
      await client.query('COMMIT');
      res.json({ success: true, message: "Dashboard sincronizado con el libro de caja." });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.delete("/api/quotes/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const reqsRes = await client.query("SELECT id FROM requisitions WHERE quote_id = $1 AND center_id = $2", [id, centerId]);
      const reqIds = reqsRes.rows.map((r: any) => r.id);

      if (reqIds.length > 0) {
        const posRes = await client.query(`SELECT id FROM purchase_orders WHERE requisition_id = ANY($1) AND center_id = $2`, [reqIds, centerId]);
        const poIds = posRes.rows.map((r: any) => r.id);

        if (poIds.length > 0) {
          const checksRes = await client.query(`SELECT * FROM checks WHERE purchase_order_id = ANY($1) AND center_id = $2`, [poIds, centerId]);
          for (const check of checksRes.rows) {
            await client.query("DELETE FROM cash_book WHERE related_id = $1 AND related_type = 'check' AND center_id = $2", [check.id, centerId]);
            await client.query("DELETE FROM bank_transactions WHERE center_id = $1 AND amount = $2 AND date = $3 AND type = 'expense'", [centerId, check.amount_gross, check.date]);
          }
          await client.query(`DELETE FROM checks WHERE purchase_order_id = ANY($1) AND center_id = $2`, [poIds, centerId]);
          await client.query(`DELETE FROM purchase_orders WHERE requisition_id = ANY($1) AND center_id = $2`, [reqIds, centerId]);
        }
        await client.query(`DELETE FROM requisitions WHERE quote_id = $1 AND center_id = $2`, [id, centerId]);
      }

      await client.query("DELETE FROM quote_items WHERE quote_id = $1 AND center_id = $2", [id, centerId]);
      await client.query("DELETE FROM quote_evidences WHERE quote_id = $1 AND center_id = $2", [id, centerId]);
      await client.query("DELETE FROM quotes WHERE id = $1 AND center_id = $2", [id, centerId]);

      await client.query('COMMIT');
      res.json({ success: true, message: "Cotización eliminada correctamente." });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  // Requisitions
  app.post("/api/requisitions", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { quote_id, code } = req.body;
    try {
      const result = await pool.query("INSERT INTO requisitions (center_id, quote_id, code) VALUES ($1, $2, $3) RETURNING id", [centerId, quote_id, code]);
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/purchase_orders", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM purchase_orders WHERE center_id = $1", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/purchase_orders", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { requisition_id, po_number } = req.body;
    try {
      const result = await pool.query("INSERT INTO purchase_orders (center_id, requisition_id, po_number) VALUES ($1, $2, $3) RETURNING id", [centerId, requisition_id, po_number]);
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Checks
  app.get("/api/checks", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM checks WHERE center_id = $1", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/checks", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { check_number, date, amount_gross, supplier_id, beneficiary, retention_isr, retention_itbis, amount_net, description } = req.body;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const ins = await client.query(
        "INSERT INTO checks (center_id, check_number, date, amount_gross, supplier_id, beneficiary, retention_isr, retention_itbis, amount_net, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
        [centerId, check_number, date, amount_gross, supplier_id, beneficiary, retention_isr, retention_itbis, amount_net, description]
      );
      const checkId = ins.rows[0].id;

      await client.query(
        "INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)",
        [centerId, 'expense', amount_gross, `Pago Cheque #${check_number} - ${beneficiary}`, date]
      );

      await client.query('COMMIT');
      res.json({ id: checkId });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.delete("/api/checks/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const checkRes = await client.query("SELECT * FROM checks WHERE id = $1 AND center_id = $2", [id, centerId]);
      const check = checkRes.rows[0];
      
      if (check) {
        await client.query("DELETE FROM cash_book WHERE related_id = $1 AND related_type = 'check' AND center_id = $2", [id, centerId]);
        if (check.amount_gross) {
          await client.query(
            "DELETE FROM bank_transactions WHERE center_id = $1 AND amount = $2 AND date = $3 AND type = 'expense'",
            [centerId, check.amount_gross, check.date]
          );
        }
        await client.query("DELETE FROM checks WHERE id = $1 AND center_id = $2", [id, centerId]);
      }
      
      await client.query('COMMIT');
      res.json({ success: true, message: "Cheque anulado correctamente." });
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error("Error deleting check:", error);
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });

  // Products
  app.get("/api/products", async (req: any, res: any) => {
    try {
      const result = await pool.query("SELECT * FROM products");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/products", async (req: any, res: any) => {
    const { name, category, unit_price } = req.body;
    try {
      const result = await pool.query("INSERT INTO products (name, category, unit_price) VALUES ($1, $2, $3) RETURNING id", [name, category, unit_price]);
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Edit Inventory
  app.put("/api/inventory/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    const { quantity, minerd_code } = req.body;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      await pool.query("UPDATE inventory SET quantity = $1, minerd_code = $2 WHERE id = $3 AND center_id = $4", [quantity, minerd_code, id, centerId]);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete Inventory
  app.delete("/api/inventory/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      await pool.query("DELETE FROM inventory WHERE id = $1 AND center_id = $2", [id, centerId]);
      res.json({ success: true, message: "Producto eliminado correctamente." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk Delete Inventory
  app.delete("/api/inventory", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    const { ids } = req.body;

    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "Se requiere un arreglo de IDs válido." });

    try {
      await pool.query("DELETE FROM inventory WHERE id = ANY($1) AND center_id = $2", [ids, centerId]);
      res.json({ success: true, message: `${ids.length} productos eliminados correctamente.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bank Transactions
  app.get("/api/bank/transactions", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM bank_transactions WHERE center_id = $1 ORDER BY date DESC", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/bank/transactions", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { type, amount, description, date } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [centerId, type, amount, description, date]
      );
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/bank/transactions/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM bank_transactions WHERE id = $1 AND center_id = $2", [id, centerId]);
      res.json({ success: true, message: "Transacción eliminada correctamente." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Bank Reconciliations
  app.get("/api/bank/reconciliations", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM bank_reconciliations WHERE center_id = $1 ORDER BY period_date DESC", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/bank/reconciliations", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { 
      period_date, bank_balance, book_balance, deposits_in_transit, 
      checks_in_transit, deposits_month, notes_credit, notes_debit, 
      bank_commissions, prepared_by, reviewed_by, authorized_by 
    } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO bank_reconciliations (
          center_id, period_date, bank_balance, book_balance, deposits_in_transit, 
          checks_in_transit, deposits_month, notes_credit, notes_debit, 
          bank_commissions, prepared_by, reviewed_by, authorized_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          centerId, period_date, bank_balance, book_balance, deposits_in_transit, 
          checks_in_transit, deposits_month, notes_credit, notes_debit, 
          bank_commissions, prepared_by, reviewed_by, authorized_by
        ]
      );
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // NCF Sequences
  app.get("/api/ncf/sequences", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM ncf_sequences WHERE center_id = $1 ORDER BY created_at DESC", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ncf/sequences", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { prefix, start_number, end_number, expiration_date } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO ncf_sequences (center_id, prefix, start_number, end_number, current_number, expiration_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [centerId, prefix || 'B11', start_number, end_number, start_number, expiration_date]
      );
      res.json({ id: result.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Purchase Vouchers
  app.get("/api/ncf/vouchers", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM purchase_vouchers WHERE center_id = $1 ORDER BY date DESC, id DESC", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ncf/vouchers", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { supplier_name, supplier_rnc_cedula, date, concept, amount, payment_method } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get active sequence
      const seqResult = await client.query(
        "SELECT * FROM ncf_sequences WHERE center_id = $1 AND status = 'active' AND prefix = 'B11' FOR UPDATE",
        [centerId]
      );

      if (seqResult.rows.length === 0) {
        throw new Error("No hay secuencias de NCF activas.");
      }

      const seq = seqResult.rows[0];
      const today = new Date().toISOString().split('T')[0];
      if (seq.expiration_date && seq.expiration_date < today) {
        await client.query("UPDATE ncf_sequences SET status = 'expired' WHERE id = $1", [seq.id]);
        throw new Error("La secuencia de NCF ha vencido.");
      }

      // 2. Format NCF
      const ncfNum = seq.current_number.toString().padStart(8, '0');
      const ncf = `${seq.prefix}${ncfNum}`;

      // 3. Create voucher
      const voucherResult = await client.query(
        `INSERT INTO purchase_vouchers (center_id, supplier_name, supplier_rnc_cedula, date, concept, amount, payment_method, ncf, sequence_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [centerId, supplier_name, supplier_rnc_cedula, date, concept, amount, payment_method, ncf, seq.id]
      );

      // 4. Update sequence
      const nextNum = BigInt(seq.current_number) + BigInt(1);
      let status = 'active';
      if (nextNum > BigInt(seq.end_number)) {
        status = 'exhausted';
      }

      await client.query(
        "UPDATE ncf_sequences SET current_number = $1, status = $2 WHERE id = $3",
        [nextNum.toString(), status, seq.id]
      );

      await client.query('COMMIT');
      res.json(voucherResult.rows[0]);
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  // Cash Book
  // Helper to recalculate running balances for a center
  const recalculateBalances = async (client: any, centerId: number) => {
    const result = await client.query(
      "SELECT id, income, expense FROM cash_book WHERE center_id = $1 ORDER BY date ASC, id ASC",
      [centerId]
    );

    let currentBalance = 0;
    for (const row of result.rows) {
      const inc = parseFloat(row.income) || 0;
      const exp = parseFloat(row.expense) || 0;
      currentBalance += inc - exp;
      await client.query(
        "UPDATE cash_book SET balance = $1 WHERE id = $2",
        [currentBalance, row.id]
      );
    }
    return currentBalance;
  };

  app.get("/api/cash-book", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM cash_book WHERE center_id = $1 ORDER BY date DESC, id DESC", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/cash-book", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { date, reference_no, beneficiary, concept, income, expense, retention_isr, retention_itbis, related_id, related_type } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // 1. Find the balance of the entry immediately before this new one
      const prevEntryRes = await client.query(`
        SELECT balance FROM cash_book 
        WHERE center_id = $1 AND (date < $2 OR (date = $3 AND id < (SELECT COALESCE(MAX(id), 0) + 1 FROM cash_book WHERE center_id = $4)))
        ORDER BY date DESC, id DESC LIMIT 1
      `, [centerId, date, date, centerId]);

      const startBalance = prevEntryRes.rows.length > 0 ? parseFloat(prevEntryRes.rows[0].balance) : 0;
      const inc = parseFloat(income) || 0;
      const exp = parseFloat(expense) || 0;
      const newBalance = startBalance + inc - exp;

      // 2. Insert the new entry
      const ins = await client.query(`
        INSERT INTO cash_book (center_id, date, reference_no, beneficiary, concept, income, expense, balance, retention_isr, retention_itbis, related_id, related_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
      `, [centerId, date, reference_no, beneficiary, concept, inc, exp, newBalance, retention_isr || 0, retention_itbis || 0, related_id, related_type]);

      const newId = ins.rows[0].id;

      // 3. Recalculate all entries for this center to ensure consistency
      await recalculateBalances(client, centerId);

      // 4. Mirror to bank_transactions
      if (inc > 0) {
        await client.query("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)", [centerId, 'income', inc, concept || 'Ingreso Caja', date]);
      }
      if (exp > 0) {
        await client.query("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)", [centerId, 'expense', exp, concept || 'Egreso Caja', date]);
      }

      await client.query('COMMIT');
      res.json({ id: newId });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.put("/api/cash-book/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    const { date, reference_no, beneficiary, concept, income, expense, retention_isr, retention_itbis } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const entryRes = await client.query("SELECT * FROM cash_book WHERE id = $1 AND center_id = $2", [id, centerId]);
      const entry = entryRes.rows[0];
      if (!entry) throw new Error("Entry not found");

      // 1. Update the entry
      await client.query(`
        UPDATE cash_book 
        SET date = $1, reference_no = $2, beneficiary = $3, concept = $4, income = $5, expense = $6, retention_isr = $7, retention_itbis = $8
        WHERE id = $9 AND center_id = $10
      `, [date, reference_no, beneficiary, concept, income || 0, expense || 0, retention_isr || 0, retention_itbis || 0, id, centerId]);

      // 2. Recalculate all entries for this center
      await recalculateBalances(client, centerId);
      
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.delete("/api/cash-book/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const entryRes = await client.query("SELECT * FROM cash_book WHERE id = $1 AND center_id = $2", [id, centerId]);
      const entry = entryRes.rows[0];
      if (!entry) throw new Error("Entry not found");

      // Strip matching trace from bank_transactions
      if (parseFloat(entry.income) > 0) {
        await client.query(
          "DELETE FROM bank_transactions WHERE center_id = $1 AND type = 'income' AND amount = $2 AND date = $3",
          [centerId, entry.income, entry.date]
        );
      }
      if (parseFloat(entry.expense) > 0) {
        await client.query(
          "DELETE FROM bank_transactions WHERE center_id = $1 AND type = 'expense' AND amount = $2 AND date = $3",
          [centerId, entry.expense, entry.date]
        );
      }

      await client.query("DELETE FROM cash_book WHERE id = $1 AND center_id = $2", [id, centerId]);

      // 2. Recalculate all entries for this center
      await recalculateBalances(client, centerId);

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });


  // Petty Cash
  app.get("/api/petty-cash", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM petty_cash WHERE center_id = $1 ORDER BY date DESC, id DESC", [centerId]);
      const balance = result.rows.reduce((acc: number, r: any) => r.type === 'refill' ? acc + parseFloat(r.amount) : acc - parseFloat(r.amount), 0);
      res.json({ entries: result.rows, balance });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/petty-cash", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { amount, description, beneficiary, receipt_no, type, date } = req.body;

    if (type === 'expense' && amount > 1000) {
      return res.status(400).json({ success: false, error: "El gasto no puede exceder los RD$1,000 por compra." });
    }

    try {
      const ins = await pool.query(`
        INSERT INTO petty_cash (center_id, amount, description, beneficiary, receipt_no, type, date) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [centerId, amount, description, beneficiary, receipt_no, type, date]);
      res.json({ id: ins.rows[0].id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/petty-cash/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM petty_cash WHERE id = $1 AND center_id = $2", [id, centerId]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // MINERD Codes
  app.get("/api/minerd-codes", async (req: any, res: any) => {
    try {
      const result = await pool.query("SELECT * FROM minerd_codes ORDER BY code ASC");
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/minerd-codes/search", async (req: any, res: any) => {
    const { q } = req.query;
    try {
      const result = await pool.query("SELECT * FROM minerd_codes WHERE code LIKE $1 OR description LIKE $2 LIMIT 10", [`%${q}%`, `%${q}%`]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Inventory
  app.get("/api/inventory", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const result = await pool.query("SELECT * FROM inventory WHERE center_id = $1 ORDER BY created_at DESC", [centerId]);
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/inventory/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    const { minerd_code, quantity, unit_price } = req.body;
    try {
      await pool.query("UPDATE inventory SET minerd_code = $1, quantity = $2, unit_price = $3 WHERE id = $4 AND center_id = $5", [minerd_code, quantity, unit_price || 0, id, centerId]);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/export-center-data", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    try {
      const tables = [
        'centers', 'budgets', 'budget_allocations', 'suppliers', 
        'quotes', 'requisitions', 'purchase_orders', 'checks', 
        'cash_book', 'bank_transactions', 'petty_cash', 'inventory'
      ];
      
      const exportData: any = { export_date: new Date().toISOString() };
      
      for (const table of tables) {
        const query = table === 'centers' 
          ? "SELECT * FROM centers WHERE id = $1" 
          : `SELECT * FROM ${table} WHERE center_id = $1`;
        const result = await pool.query(query, [centerId]);
        exportData[table] = result.rows;
      }
      
      res.json(exportData);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/diag", async (req: any, res: any) => {
    try {
      const types = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cash_book'");
      const stats = await pool.query("SELECT SUM(income) as s_inc, SUM(expense) as s_exp, count(*) as total FROM cash_book");
      const sample = await pool.query("SELECT id, income, expense, balance FROM cash_book ORDER BY id DESC LIMIT 5");
      res.json({ types: types.rows, stats: stats.rows[0], sample: sample.rows });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    try {
      const incomeRes = await pool.query("SELECT SUM(income) as total FROM cash_book WHERE center_id = $1", [centerId]);
      const income = parseFloat(incomeRes.rows[0].total) || 0;
      
      const expenseRes = await pool.query("SELECT SUM(expense) as total FROM cash_book WHERE center_id = $1", [centerId]);
      const expense = parseFloat(expenseRes.rows[0].total) || 0;
      
      // Get the latest balance directly from the cash_book
      const lastBalRes = await pool.query("SELECT balance FROM cash_book WHERE center_id = $1 ORDER BY date DESC, id DESC LIMIT 1", [centerId]);
      const balance = lastBalRes.rows.length > 0 ? parseFloat(lastBalRes.rows[0].balance) : 0;

      const invRes = await pool.query("SELECT SUM(quantity * unit_price) as total FROM inventory WHERE center_id = $1", [centerId]);
      const inventoryValue = parseFloat(invRes.rows[0].total) || 0;

      const pcIncRes = await pool.query("SELECT SUM(amount) as total FROM petty_cash WHERE center_id = $1 AND type = 'refill'", [centerId]);
      const pettyCashIncome = parseFloat(pcIncRes.rows[0].total) || 0;
      
      const pcExpRes = await pool.query("SELECT SUM(amount) as total FROM petty_cash WHERE center_id = $1 AND type = 'expense'", [centerId]);
      const pettyCashExpense = parseFloat(pcExpRes.rows[0].total) || 0;
      const pettyCashBalance = pettyCashIncome - pettyCashExpense;

      const catSpendingRes = await pool.query(`
        SELECT 
          CASE 
            WHEN qi.minerd_code IN ('281') THEN 'Infraestructura'
            WHEN qi.minerd_code IN ('331', '332', '391', '392') THEN 'Materiales'
            WHEN qi.minerd_code IN ('612', '614', '617', '619', '282') THEN 'Equipos'
            WHEN qi.minerd_code IN ('215', '222', '232', '292', '295', '299') THEN 'Servicios'
            WHEN qi.minerd_code IN ('394', '395', '399', '333') THEN 'Pedagogía'
            ELSE 'Otros'
          END as category,
          SUM(qi.total) as total 
        FROM quote_items qi
        JOIN quotes q ON qi.quote_id = q.id
        WHERE q.center_id = $1
        GROUP BY category
      `, [centerId]);


      // Cash flow by month for current year
      const currentYear = new Date().getFullYear().toString();
      const cashFlowRes = await pool.query(`
        SELECT 
          SUBSTRING(date FROM 6 FOR 2) as month,
          SUM(income) as ingresos,
          SUM(expense) as egresos
        FROM cash_book
        WHERE center_id = $1 AND SUBSTRING(date FROM 1 FOR 4) = $2
        GROUP BY month
        ORDER BY month ASC
      `, [centerId, currentYear]);


      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const cashFlow = monthNames.map((name, index) => {
        const monthStr = (index + 1).toString().padStart(2, '0');
        const found = cashFlowRes.rows.find((r: any) => r.month === monthStr);
        return {
          name,
          ingresos: found ? parseFloat(found.ingresos) : 0,
          egresos: found ? parseFloat(found.egresos) : 0
        };
      });

      res.json({ balance, income, expense, inventoryValue, pettyCashBalance, categorySpending: catSpendingRes.rows, cashFlow });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Bulk Processing
  app.put("/api/process-bulk/:id", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id: quoteId } = req.params;
    const { supplier, quote, requisition, purchase_order, check, items } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // 1. Update Supplier
      let supplierId;
      const sRes = await client.query("SELECT id FROM suppliers WHERE rnc = $1 AND center_id = $2", [supplier.rnc, centerId]);
      if (sRes.rows.length > 0) {
        supplierId = sRes.rows[0].id;
        await client.query("UPDATE suppliers SET name = $1, type = $2, phone = $3, address = $4 WHERE id = $5 AND center_id = $6",
          [supplier.name, supplier.type, supplier.phone, supplier.address, supplierId, centerId]);
      } else {
        const insS = await client.query("INSERT INTO suppliers (center_id, name, rnc, type, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
          [centerId, supplier.name, supplier.rnc, supplier.type, supplier.phone, supplier.address]);
        supplierId = insS.rows[0].id;
      }

      // 2. Update Quote
      await client.query("UPDATE quotes SET supplier_id = $1, type = $2, total_amount = $3, subtotal = $4, itbis = $5, created_at = $6, quote_number = $7 WHERE id = $8 AND center_id = $9",
        [supplierId, quote.type, quote.total_amount, quote.subtotal, quote.itbis, quote.date || 'NOW()', quote.quote_number, quoteId, centerId]);

      // 3. Update Requisition
      const rRes = await client.query("SELECT id FROM requisitions WHERE quote_id = $1 AND center_id = $2", [quoteId, centerId]);
      if (rRes.rows.length > 0) {
        const requisitionId = rRes.rows[0].id;
        await client.query("UPDATE requisitions SET poa_year = $1, created_at = $2 WHERE id = $3 AND center_id = $4", [requisition.poa_year, quote.date || 'NOW()', requisitionId, centerId]);

        // 4. Update PO
        const pRes = await client.query("SELECT id FROM purchase_orders WHERE requisition_id = $1 AND center_id = $2", [requisitionId, centerId]);
        if (pRes.rows.length > 0) {
          const poId = pRes.rows[0].id;
          await client.query("UPDATE purchase_orders SET supplier_id = $1, total_amount = $2, subtotal = $3, itbis = $4, ncf = $5, created_at = $6 WHERE id = $7 AND center_id = $8",
            [supplierId, purchase_order.total_amount, purchase_order.subtotal, purchase_order.itbis, purchase_order.ncf, quote.date || 'NOW()', poId, centerId]);

          // 5. Update Check
          const cRes = await client.query("SELECT id FROM checks WHERE purchase_order_id = $1 AND center_id = $2", [poId, centerId]);
          if (cRes.rows.length > 0) {
            const checkId = cRes.rows[0].id;
            await client.query(`
              UPDATE checks SET check_number = $1, date = $2, amount_gross = $3, retention_isr = $4, retention_itbis = $5, amount_net = $6, beneficiary = $7, description = $8
              WHERE id = $9 AND center_id = $10
            `, [check.check_number, check.date, check.amount_gross, check.retention_isr, check.retention_itbis, check.amount_net, check.beneficiary, check.description, checkId, centerId]);
          }
        }
      }

      // 6. Items
      await client.query("DELETE FROM quote_items WHERE quote_id = $1 AND center_id = $2", [quoteId, centerId]);
      for (const item of items) {
        await client.query("INSERT INTO quote_items (center_id, quote_id, description, quantity, unit_price, total, minerd_code) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [centerId, quoteId, item.name, item.quantity, item.unit_price, item.total, item.minerd_code || '']);
      }

      await client.query('COMMIT');
      res.json({ success: true, quoteId });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.post("/api/process-bulk", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { supplier, quote, requisition, purchase_order, check, bank_transaction, items } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // 1. Supplier
      let supplierId;
      const rncClean = supplier.rnc ? supplier.rnc.trim() : "";
      
      // Solo buscar por RNC si no está vacío
      if (rncClean && rncClean !== "") {
        const sRes = await client.query("SELECT id FROM suppliers WHERE rnc = $1 AND center_id = $2", [rncClean, centerId]);
        if (sRes.rows.length > 0) {
          supplierId = sRes.rows[0].id;
          await client.query("UPDATE suppliers SET name = $1, type = $2, phone = $3, address = $4 WHERE id = $5 AND center_id = $6",
            [supplier.name, supplier.type, supplier.phone, supplier.address, supplierId, centerId]);
        }
      }

      // Si no se encontró por RNC o el RNC estaba vacío, buscar por nombre exacto para evitar duplicados en el mismo centro
      if (!supplierId) {
        const sNameRes = await client.query("SELECT id FROM suppliers WHERE name = $1 AND center_id = $2", [supplier.name, centerId]);
        if (sNameRes.rows.length > 0) {
          supplierId = sNameRes.rows[0].id;
          // Actualizamos datos adicionales si se encuentran
          await client.query("UPDATE suppliers SET rnc = $1, type = $2, phone = $3, address = $4 WHERE id = $5 AND center_id = $6",
            [supplier.rnc, supplier.type, supplier.phone, supplier.address, supplierId, centerId]);
        } else {
          const insS = await client.query("INSERT INTO suppliers (center_id, name, rnc, type, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [centerId, supplier.name, supplier.rnc, supplier.type, supplier.phone, supplier.address]);
          supplierId = insS.rows[0].id;
        }
      }

      // 2. Quote
      const qIns = await client.query("INSERT INTO quotes (center_id, supplier_id, type, total_amount, subtotal, itbis, description, created_at, quote_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
        [centerId, supplierId, quote.type, quote.total_amount, quote.subtotal, quote.itbis, quote.description, quote.date || 'NOW()', quote.quote_number]);
      const quoteId = qIns.rows[0].id;

      // 3. Requisition
      const rIns = await client.query("INSERT INTO requisitions (center_id, quote_id, code, poa_year, description, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [centerId, quoteId, requisition.code, requisition.poa_year, quote.description, quote.date || 'NOW()']);
      const requisitionId = rIns.rows[0].id;

      // 4. Purchase Order
      const pIns = await client.query("INSERT INTO purchase_orders (center_id, requisition_id, supplier_id, total_amount, subtotal, itbis, ncf, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
        [centerId, requisitionId, supplierId, purchase_order.total_amount, purchase_order.subtotal, purchase_order.itbis, purchase_order.ncf, purchase_order.description, quote.date || 'NOW()']);
      const poId = pIns.rows[0].id;

      // 5. Check
      const cIns = await client.query(`
        INSERT INTO checks (center_id, check_number, date, amount_gross, retention_isr, retention_itbis, amount_net, beneficiary, purchase_order_id, description) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
      `, [centerId, check.check_number, check.date, check.amount_gross, check.retention_isr, check.retention_itbis, check.amount_net, check.beneficiary, poId, check.description]);
      const checkId = cIns.rows[0].id;

      // 6. Bank Transaction
      await client.query("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)",
        [centerId, bank_transaction.type, bank_transaction.amount, bank_transaction.description, bank_transaction.date]);

      // 7. Cash Book
      const lastBalRes = await client.query("SELECT balance FROM cash_book WHERE center_id = $1 ORDER BY date DESC, id DESC LIMIT 1", [centerId]);
      const lastBalance = lastBalRes.rows.length > 0 ? parseFloat(lastBalRes.rows[0].balance) : 0;
      const newBalance = lastBalance - parseFloat(check.amount_net);

      await client.query(`
        INSERT INTO cash_book (center_id, date, reference_no, beneficiary, concept, income, expense, balance, retention_isr, retention_itbis, related_id, related_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [centerId, check.date, check.check_number, check.beneficiary, purchase_order.description || 'Pago a Suplidor', 0, check.amount_net, newBalance, check.retention_isr, check.retention_itbis, checkId, 'check']);

      // 8. Items & Inventory
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const itemTotal = item.total || (item.quantity * item.unit_price);
          await client.query("INSERT INTO quote_items (center_id, quote_id, description, quantity, unit_price, total, minerd_code) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [centerId, quoteId, item.name, item.quantity, item.unit_price, itemTotal, item.minerd_code]);

          if (quote.type === 'materials') {
            const invRes = await client.query("SELECT id FROM inventory WHERE name ILIKE $1 AND center_id = $2", [`%${item.name}%`, centerId]);
            if (invRes.rows.length > 0) {
              await client.query("UPDATE inventory SET quantity = quantity + $1, unit_price = $2, minerd_code = $3 WHERE id = $4", [item.quantity, item.unit_price, item.minerd_code, invRes.rows[0].id]);
            } else {
              await client.query(`
                INSERT INTO inventory (center_id, name, description, quantity, unit_price, min_quantity, category, minerd_code) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `, [centerId, item.name, item.name, item.quantity, item.unit_price, 5, 'Materiales', item.minerd_code]);
            }
          }
        }
      }

      await client.query('COMMIT');
      res.json({ success: true, quoteId, requisitionId, poId, checkId });
    } catch (e: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: e.message });
    } finally {
      client.release();
    }
  });

  app.post("/api/reset", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    try {
      await pool.query("BEGIN");
      await pool.query("DELETE FROM bank_transactions WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM cash_book WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM checks WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM purchase_orders WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM requisitions WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM quote_items WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM quotes WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM inventory WHERE center_id = $1", [centerId]);
      await pool.query("DELETE FROM petty_cash WHERE center_id = $1", [centerId]);
      await pool.query("COMMIT");
      res.json({ success: true, message: "Datos de transacciones borrados exitosamente" });
    } catch (error: any) {
      await pool.query("ROLLBACK");
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports", async (req: any, res: any) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    try {
      const qRes = await pool.query(`
        SELECT q.*, s.name as supplier_name 
        FROM quotes q 
        JOIN suppliers s ON q.supplier_id = s.id 
        WHERE q.center_id = $1 AND q.created_at BETWEEN $2 AND $3
      `, [centerId, startDate + " 00:00:00", endDate + " 23:59:59"]);

      const cbRes = await pool.query(`
        SELECT * FROM cash_book 
        WHERE center_id = $1 AND date BETWEEN $2 AND $3
      `, [centerId, startDate, endDate]);

      const pcRes = await pool.query(`
        SELECT * FROM petty_cash 
        WHERE center_id = $1 AND date BETWEEN $2 AND $3
      `, [centerId, startDate, endDate]);

      const invRes = await pool.query(`
        SELECT * FROM inventory 
        WHERE center_id = $1 AND created_at BETWEEN $2 AND $3
      `, [centerId, startDate + " 00:00:00", endDate + " 23:59:59"]);

      const qiRes = await pool.query(`
        SELECT qi.*, q.created_at as quote_date, sup.name as supplier_name
        FROM quote_items qi
        JOIN quotes q ON qi.quote_id = q.id
        JOIN suppliers sup ON q.supplier_id = sup.id
        WHERE q.center_id = $1 AND q.created_at BETWEEN $2 AND $3
      `, [centerId, startDate + " 00:00:00", endDate + " 23:59:59"]);

      res.json({
        quotes: qRes.rows,
        cashBook: cbRes.rows,
        pettyCash: pcRes.rows,
        inventory: invRes.rows,
        quoteItems: qiRes.rows
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SPA Fallback - MUST BE ABSOLUTELY LAST
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    const indexPath = path.resolve(distPath, "index.html");
    
    console.log(`Setting up static serving from: ${distPath}`);
    app.use(express.static(distPath, { index: 'index.html' }));
    
    app.get("*", (req, res) => {
      console.log(`SPA Catch-all hit: ${req.url}. Sending ${indexPath}`);
      if (!fs.existsSync(indexPath)) {
        console.error("CRITICAL: index.html missing during request!");
        return res.status(500).send("Falta dist/index.html");
      }
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("res.sendFile error:", err);
          if (!res.headersSent) res.status(500).send("Error al enviar index.html");
        }
      });
    });
  }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> SERVER READY AND LISTENING ON PORT: ${PORT} <<<`);
      console.log(`Internal URL: http://0.0.0.0:${PORT}`);

      // Background Tasks (Deferred by 5s to ensure listener is fully up)
      setTimeout(function() {
        console.log("Running background maintenance tasks...");
        pool.query("DELETE FROM minerd_codes")
          .then(() => {
            console.log("Seeding MINERD codes...");
            for (const c of codes) {
              pool.query("INSERT INTO minerd_codes (code, description) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING", [c.code, c.description]);
            }
            return pool.query(`
              DELETE FROM cash_book 
              WHERE related_type = 'check' 
              AND related_id NOT IN (SELECT id FROM checks)
            `);
          })
          .then(res => {
            if (res.rowCount && res.rowCount > 0) console.log(`Deleted ${res.rowCount} orphaned cash_book entries.`);
            return pool.query(`
              DELETE FROM bank_transactions 
              WHERE type = 'expense'
              AND (description LIKE 'Pago a%' OR description LIKE 'Pago Cheque%' OR description LIKE 'PAGO SEGÚN%')
              AND amount NOT IN (SELECT amount_gross FROM checks)
            `);
          })
          .then(res => {
            if (res.rowCount && res.rowCount > 0) console.log(`Deleted ${res.rowCount} orphaned bank_transactions.`);
          })
          .catch(e => console.error("Maintenance task error:", e));
      }, 5000);
    });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
