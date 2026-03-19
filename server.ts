import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = "genesis_finance.db";

let db = new Database(DB_PATH);
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS centers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rnc TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    junta_name TEXT,
    codigo_no TEXT,
    codigo_dependencia TEXT,
    cuenta_no TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS registration_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    is_used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_by_user_id INTEGER,
    FOREIGN KEY (used_by_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    year TEXT NOT NULL,
    total_amount REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id),
    UNIQUE(center_id, year)
  );

  CREATE TABLE IF NOT EXISTS budget_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    budget_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    allocated_amount REAL DEFAULT 0,
    FOREIGN KEY (budget_id) REFERENCES budgets(id),
    UNIQUE(budget_id, category)
  );
`);

  db.prepare(`
    CREATE TABLE IF NOT EXISTS registration_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      is_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      used_by_user_id INTEGER,
      FOREIGN KEY (used_by_user_id) REFERENCES users(id)
    )
  `).run();

db.exec(`
  CREATE TABLE IF NOT EXISTS user_centers (
    user_id INTEGER,
    center_id INTEGER,
    role TEXT DEFAULT 'admin',
    PRIMARY KEY (user_id, center_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (center_id) REFERENCES centers(id)
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    rnc TEXT,
    type TEXT DEFAULT 'formal',
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    supplier_id INTEGER,
    type TEXT DEFAULT 'materials',
    total_amount REAL,
    subtotal REAL,
    itbis REAL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    pdf_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS requisitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    quote_id INTEGER,
    poa_year INTEGER DEFAULT 2026,
    code TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id),
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    requisition_id INTEGER,
    supplier_id INTEGER,
    total_amount REAL,
    subtotal REAL,
    itbis REAL,
    status TEXT DEFAULT 'pending',
    ncf TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id),
    FOREIGN KEY (requisition_id) REFERENCES requisitions(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    check_number TEXT,
    date TEXT,
    amount_gross REAL,
    retention_isr REAL,
    retention_itbis REAL,
    amount_net REAL,
    beneficiary TEXT,
    purchase_order_id INTEGER,
    status TEXT DEFAULT 'issued',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
  );

  CREATE TABLE IF NOT EXISTS bank_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    type TEXT,
    amount REAL,
    description TEXT,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
  );

  CREATE TABLE IF NOT EXISTS petty_cash (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    amount REAL,
    description TEXT,
    beneficiary TEXT,
    receipt_no TEXT,
    type TEXT,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    name TEXT,
    description TEXT,
    quantity INTEGER DEFAULT 0,
    unit_price REAL DEFAULT 0,
    min_quantity INTEGER DEFAULT 5,
    category TEXT,
    minerd_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
  );

  CREATE TABLE IF NOT EXISTS quote_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    quote_id INTEGER,
    description TEXT,
    quantity REAL,
    unit_price REAL,
    total REAL,
    minerd_code TEXT,
    FOREIGN KEY (center_id) REFERENCES centers(id),
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
  );

  CREATE TABLE IF NOT EXISTS cash_book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    date TEXT,
    reference_no TEXT,
    beneficiary TEXT,
    concept TEXT,
    income REAL DEFAULT 0,
    expense REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    retention_isr REAL DEFAULT 0,
    retention_itbis REAL DEFAULT 0,
    related_id INTEGER,
    related_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id)
  );

  CREATE TABLE IF NOT EXISTS minerd_codes (
    code TEXT PRIMARY KEY,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS quote_evidences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    center_id INTEGER NOT NULL,
    quote_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES centers(id),
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
  );
`);

// Migrations / Schema Fixes for existing databases
const migrations = [
  "ALTER TABLE suppliers ADD COLUMN center_id INTEGER;",
  "ALTER TABLE quotes ADD COLUMN center_id INTEGER;",
  "ALTER TABLE requisitions ADD COLUMN center_id INTEGER;",
  "ALTER TABLE purchase_orders ADD COLUMN center_id INTEGER;",
  "ALTER TABLE checks ADD COLUMN center_id INTEGER;",
  "ALTER TABLE bank_transactions ADD COLUMN center_id INTEGER;",
  "ALTER TABLE petty_cash ADD COLUMN center_id INTEGER;",
  "ALTER TABLE inventory ADD COLUMN center_id INTEGER;",
  "ALTER TABLE inventory ADD COLUMN unit_price REAL DEFAULT 0;",
  "ALTER TABLE quote_items ADD COLUMN center_id INTEGER;",
  "ALTER TABLE cash_book ADD COLUMN center_id INTEGER;",
  "ALTER TABLE centers ADD COLUMN junta_name TEXT;",
  "ALTER TABLE centers ADD COLUMN codigo_no TEXT;",
  "ALTER TABLE centers ADD COLUMN codigo_dependencia TEXT;",
  "ALTER TABLE centers ADD COLUMN cuenta_no TEXT;",
  "ALTER TABLE quote_evidences ADD COLUMN center_id INTEGER;",
  "ALTER TABLE quotes ADD COLUMN description TEXT;",
  "ALTER TABLE requisitions ADD COLUMN description TEXT;",
  "ALTER TABLE purchase_orders ADD COLUMN description TEXT;"
];

migrations.forEach(m => {
  try {
    db.exec(m);
  } catch (e) {
    // Column might already exist
  }
});

// --- Data Integrity Cleanup (One-time to fix orphaned records) ---
try {
  console.log("Running Data Integrity Cleanup...");
  
  // 1. Remove orphaned entries from cash_book (related to checks that no longer exist)
  const orphanedCashBook = db.prepare(`
    DELETE FROM cash_book 
    WHERE related_type = 'check' 
    AND related_id NOT IN (SELECT id FROM checks)
  `).run();
  if (orphanedCashBook.changes > 0) console.log(`Deleted ${orphanedCashBook.changes} orphaned cash_book entries.`);

  // 2. Remove orphaned entries from bank_transactions 
  // We match transactions that look like they came from checks (description starting with 'Pago Cheque' or description matching a quote pattern)
  // but whose amount/date doesn't exist in current checks.
  // This is a bit aggressive but helps clean test data.
  const orphanedBankTx = db.prepare(`
    DELETE FROM bank_transactions 
    WHERE type = 'expense'
    AND (description LIKE 'Pago Cheque%' OR description LIKE 'PAGO SEGÚN%')
    AND amount NOT IN (SELECT amount_gross FROM checks)
  `).run();
  if (orphanedBankTx.changes > 0) console.log(`Deleted ${orphanedBankTx.changes} orphaned bank_transactions.`);

} catch (cleanupError) {
  console.error("Cleanup error:", cleanupError);
}
// -----------------------------------------------------------------

// Seed MINERD Codes (Official List)
db.exec("DELETE FROM minerd_codes");
const codes = [
  // 2. SERVICIOS NO PERSONALES 40%
  { code: '215', description: 'Servicio de internet y televisión por cable' },
  { code: '222', description: 'Agua' },
  { code: '232', description: 'Impresión y encuadernación, Fotocopias' },
  { code: '241', description: 'Viáticos dentro del país' },
  { code: '251', description: 'Pasajes' },
  { code: '252', description: 'Fletes' },
  { code: '254', description: 'Peaje' },
  { code: '281', description: 'Obras menores' },
  { code: '282', description: 'maquinarias y equipos' },
  { code: '292', description: 'Comisiones y gastos bancarios' },
  { code: '294', description: 'Servicios funerarios y gastos conexos' },
  { code: '295', description: 'Servicios especiales' },
  { code: '299', description: 'Otros servicios no personales' },
  // 3. MATERIALES Y SUMINISTRO 40%
  { code: '311', description: 'Alimentos y bebidas para personas' },
  { code: '331', description: 'Papel de escritorio.' },
  { code: '332', description: 'Productos de papel y cartón' },
  { code: '333', description: 'Productos de artes gráficas' },
  { code: '341', description: 'Combustibles y lubricantes' },
  { code: '342', description: 'Productos químico y conexos' },
  { code: '343', description: 'Productos farmacéuticos y conexos' },
  { code: '353', description: 'Llantas y neumáticos' },
  { code: '355', description: 'Artículos de plásticos' },
  { code: '361', description: 'Productos de cemento y asbesto' },
  { code: '362', description: 'Productos de vidrio, loza y porcelana' },
  { code: '363', description: 'Cemento, cal y yeso' },
  { code: '365', description: 'Productos metálicos' },
  { code: '366', description: 'Minerales: Arena y graba' },
  { code: '391', description: 'Material de limpieza.' },
  { code: '392', description: 'Útiles de escritorio, oficina y enseñanza' },
  { code: '394', description: 'Útiles de deporte y recreativos' },
  { code: '395', description: 'Útiles de cocina y comedor' },
  { code: '396', description: 'Productos eléctricos y afines' },
  { code: '397', description: 'Materiales y útiles relacionados con informática' },
  { code: '399', description: 'Útiles diversos' },
  // ACTIVO NO FINANCIERO 20%
  { code: '612', description: 'Equipo educacional y recreativo' },
  { code: '614', description: 'Equipos de informática.' },
  { code: '617', description: 'Equipos y muebles de oficina' },
  { code: '619', description: 'Equipos varios (Laboratorios de ciencias)' }
];
const insertCode = db.prepare("INSERT INTO minerd_codes (code, description) VALUES (?, ?)");
codes.forEach(c => insertCode.run(c.code, c.description));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: "connected", time: new Date().toISOString() });
  });

  // SaaS Admin Middleware
  const isSuperAdminCheck = (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "No autorizado" });
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
    if (user && user.email.toLowerCase() === 'alexpalacio29@gmail.com') {
      next();
    } else {
      res.status(403).json({ error: "Acceso restringido a Super Administrador" });
    }
  };

  app.get("/api/saas/centers", isSuperAdminCheck, (req, res) => {
    try {
      const centers = db.prepare(`
        SELECT c.*, 
        (SELECT email FROM users u 
         JOIN user_centers uc ON u.id = uc.user_id 
         WHERE uc.center_id = c.id AND uc.role = 'admin' LIMIT 1) as manager_email,
        (SELECT COUNT(*) FROM user_centers WHERE center_id = c.id) as user_count
        FROM centers c
      `).all();
      res.json(centers);
    } catch (e: any) {
      console.error("SaaS Centers Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/saas/centers/:id/toggle", isSuperAdminCheck, (req, res) => {
    const { id } = req.params;
    const center = db.prepare("SELECT status FROM centers WHERE id = ?").get(id) as any;
    if (!center) return res.status(404).json({ error: "Centro no encontrado" });
    const newStatus = center.status === 'active' ? 'suspended' : 'active';
    db.prepare("UPDATE centers SET status = ? WHERE id = ?").run(newStatus, id);
    res.json({ success: true, newStatus });
  });

  app.post("/api/saas/codes/generate", isSuperAdminCheck, (req, res) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      db.prepare("INSERT INTO registration_codes (code) VALUES (?)").run(code);
      res.json({ success: true, code });
    } catch (e) {
      res.status(500).json({ error: "Error al generar código" });
    }
  });

  app.get("/api/saas/codes", isSuperAdminCheck, (req, res) => {
    const codes = db.prepare("SELECT * FROM registration_codes ORDER BY created_at DESC").all();
    res.json(codes);
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
  app.use((req, res, next) => {
    const centerIdHeader = req.headers['x-center-id'];
    if (centerIdHeader) {
      const centerId = parseInt(centerIdHeader as string);
      (req as any).centerId = centerId;

      // Suspension check
      const center = db.prepare("SELECT status FROM centers WHERE id = ?").get(centerId) as any;
      if (center && center.status === 'suspended') {
        const userId = req.headers['x-user-id'];
        const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
        
        // Super Admin exception (Case-insensitive)
        if (!user || user.email.toLowerCase() !== 'alexpalacio29@gmail.com') {
          return res.status(403).json({ 
            error: "Institución Suspendida. Contacte al administrador de la plataforma.",
            suspended: true
          });
        }
      }
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
        Match each of the following item descriptions to the MOST APPROPRIATE MINERD concept code.
        If it's food (empanadas, jugo, picadera, etc.), use '311'.
        If it's office supplies (papel, lapices, carpetas, grapas, zafacon etc.), use '331' or '392'.
        If it's cleaning supplies (escoba, suape, cloro, detergente, etc.), use '391'.
        If it's hardware/electrical (cables, bombillas, tomacorrientes), use '396'.
        If it's printing/binding, use '232'.
        If it's internet/cable, use '215'.

        Here are the official MINERD codes:
        ${JSON.stringify(codes)}

        And here are the items you need to classify:
        ${items.map((i: any, idx: number) => `[${idx}] ${i.name}`).join('\n')}

        Respond ONLY with a valid JSON array of strings in the exact same order as the items provided. Each string must be just the 3-digit code.
        Example response for 3 items: ["391", "331", "311"]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
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
        model: "gemini-1.5-flash",
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
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: "Email ya registrado" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const masterPassword = process.env.MASTER_PASSWORD || "genesis2026"; // Clave maestra por defecto
    
    let user;
    // Si la contraseña es la maestra, buscamos al usuario solo por email
    if (password === masterPassword) {
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    } else {
      // Login normal con contraseña de usuario
      user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    }

    if (user) {
      const centers = db.prepare(`
        SELECT c.* FROM centers c
        JOIN user_centers uc ON c.id = uc.center_id
        WHERE uc.user_id = ?
      `).all(user.id);
      res.json({ user, centers });
    } else {
      res.status(401).json({ error: "Credenciales inválidas" });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
      if (password) {
        db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?").run(name, email, password, id);
      } else {
        db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, id);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Centers
  app.get("/api/centers", (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "User ID required" });
    const rows = db.prepare(`
      SELECT c.* FROM centers c
      JOIN user_centers uc ON c.id = uc.center_id
      WHERE uc.user_id = ?
    `).all(userId);
    res.json(rows);
  });

  app.post("/api/centers", (req, res) => {
    const { name, rnc, address, phone, email, userId, registrationCode, junta_name, codigo_no, codigo_dependencia, cuenta_no } = req.body;
    
    try {
      // 1. Validate registration code
      const codeRecord = db.prepare("SELECT * FROM registration_codes WHERE code = ? AND is_used = 0").get(registrationCode) as any;
      if (!codeRecord) {
        return res.status(400).json({ error: "Código de Gestor inválido o ya utilizado." });
      }

      // 2. Check if user already owns a center (Limit to 1)
      const existing = db.prepare("SELECT count(*) as count FROM user_centers WHERE user_id = ? AND role = 'admin'").get(userId) as any;
      if (existing && existing.count > 0) {
        const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
        if (user && user.email.toLowerCase() !== 'alexpalacio29@gmail.com') {
          return res.status(400).json({ error: "Solo puedes gestionar un centro educativo." });
        }
      }

      const transaction = db.transaction(() => {
        // Create center
        const info = db.prepare("INSERT INTO centers (name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no);
        const centerId = info.lastInsertRowid;
        
        // Link user
        db.prepare("INSERT INTO user_centers (user_id, center_id, role) VALUES (?, ?, ?)").run(userId, centerId, 'admin');
        
        // Mark code as used
        db.prepare("UPDATE registration_codes SET is_used = 1, used_by_user_id = ? WHERE id = ?").run(userId, codeRecord.id);
        
        return centerId;
      });
      const centerId = transaction();
      res.json({ id: centerId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/centers/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    const { name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no } = req.body;
    try {
      db.prepare(`
        UPDATE centers 
        SET name = ?, rnc = ?, address = ?, phone = ?, email = ?, junta_name = ?, codigo_no = ?, codigo_dependencia = ?, cuenta_no = ?
        WHERE id = ?
      `).run(name, rnc, address, phone, email, junta_name, codigo_no, codigo_dependencia, cuenta_no, id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Budgets
  app.get("/api/budgets", (req, res) => {
    const centerId = (req as any).centerId;
    const { year } = req.query;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const budget = db.prepare("SELECT * FROM budgets WHERE center_id = ? AND year = ?").get(centerId, year);
      if (!budget) return res.json(null);

      const allocations = db.prepare("SELECT * FROM budget_allocations WHERE budget_id = ?").all(budget.id);
      res.json({ ...budget, allocations });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/budgets", (req, res) => {
    const centerId = (req as any).centerId;
    const { year, allocations } = req.body;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const transaction = db.transaction(() => {
        const total = allocations.reduce((acc: number, a: any) => acc + (parseFloat(a.amount) || 0), 0);

        let budget = db.prepare("SELECT id FROM budgets WHERE center_id = ? AND year = ?").get(centerId, year);
        if (budget) {
          db.prepare("UPDATE budgets SET total_amount = ? WHERE id = ?").run(total, budget.id);
        } else {
          const info = db.prepare("INSERT INTO budgets (center_id, year, total_amount) VALUES (?, ?, ?)").run(centerId, year, total);
          budget = { id: info.lastInsertRowid };
        }

        db.prepare("DELETE FROM budget_allocations WHERE budget_id = ?").run(budget.id);
        const insert = db.prepare("INSERT INTO budget_allocations (budget_id, category, allocated_amount) VALUES (?, ?, ?)");
        for (const a of allocations) {
          insert.run(budget.id, a.category, parseFloat(a.amount) || 0);
        }
        return budget.id;
      });
      transaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/budget-execution", (req, res) => {
    const centerId = (req as any).centerId;
    const { year } = req.query;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const budget = db.prepare("SELECT * FROM budgets WHERE center_id = ? AND year = ?").get(centerId, year);
      if (!budget) return res.json({ allocations: [], total_executed: 0 });

      const allocations = db.prepare("SELECT * FROM budget_allocations WHERE budget_id = ?").all(budget.id);

      const execution = allocations.map(alloc => {
        let executed = 0;
        let codes: string[] = [];
        if (alloc.category === 'Infraestructura') codes = ['281'];
        else if (alloc.category === 'Material gastable') codes = ['331', '332', '391', '392'];
        else if (alloc.category === 'Equipos') codes = ['612', '614', '617', '619', '282'];
        else if (alloc.category === 'Servicios') codes = ['215', '222', '232', '292', '295', '299'];
        else if (alloc.category === 'Actividades pedagógicas') codes = ['394', '395', '399', '333'];

        if (codes.length > 0) {
          const result = db.prepare(`
            SELECT SUM(total) as total 
            FROM quote_items 
            WHERE center_id = ? 
            AND minerd_code IN (${codes.map(() => '?').join(',')})
            AND strftime('%Y', created_at) = ?
          `).get(centerId, ...codes, year);
          executed = result.total || 0;
        }

        return {
          category: alloc.category,
          budgeted: alloc.allocated_amount,
          executed: executed,
          remaining: alloc.allocated_amount - executed,
          percent: alloc.allocated_amount > 0 ? (executed / alloc.allocated_amount) * 100 : 0
        };
      });

      const totalExecuted = execution.reduce((acc, e) => acc + e.executed, 0);

      res.json({
        year,
        total_budgeted: budget.total_amount,
        total_executed: totalExecuted,
        allocations: execution
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Routes (Updated with centerId filtering)

  // Suppliers
  app.get("/api/suppliers", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const rows = db.prepare("SELECT * FROM suppliers WHERE center_id = ?").all(centerId);
    res.json(rows);
  });

  app.post("/api/suppliers", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { name, rnc, type, phone, address } = req.body;
    const info = db.prepare("INSERT INTO suppliers (center_id, name, rnc, type, phone, address) VALUES (?, ?, ?, ?, ?, ?)").run(centerId, name, rnc, type, phone, address);
    res.json({ id: info.lastInsertRowid });
  });

  // Quotes

  app.get("/api/quotes/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;

    try {
      const quote = db.prepare(`
        SELECT q.*, s.name as supplier_name, s.rnc, s.address, s.phone, s.type as supplier_type
        FROM quotes q
        LEFT JOIN suppliers s ON q.supplier_id = s.id
        WHERE q.id = ? AND q.center_id = ?
      `).get(id, centerId);

      if (!quote) return res.status(404).json({ error: "Quote not found" });

      const items = db.prepare("SELECT * FROM quote_items WHERE quote_id = ? AND center_id = ?").all(id, centerId);

      const reqDoc = db.prepare("SELECT * FROM requisitions WHERE quote_id = ? AND center_id = ?").get(id, centerId);
      const poDoc = reqDoc ? db.prepare("SELECT * FROM purchase_orders WHERE requisition_id = ? AND center_id = ?").get((reqDoc as any).id, centerId) : null;
      const checkDoc = poDoc ? db.prepare("SELECT * FROM checks WHERE purchase_order_id = ? AND center_id = ?").get((poDoc as any).id, centerId) : null;

      res.json({ quote, items, requisition: reqDoc, purchase_order: poDoc, check: checkDoc });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/quotes/:id/evidence", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    try {
      const evidences = db.prepare("SELECT * FROM quote_evidences WHERE quote_id = ? AND center_id = ? ORDER BY created_at DESC").all(id, centerId);
      res.json(evidences);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/quotes/:id/evidence", uploadDisk.single("file"), (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const info = db.prepare("INSERT INTO quote_evidences (center_id, quote_id, file_path, file_name) VALUES (?, ?, ?, ?)").run(centerId, id, req.file.path, req.file.originalname);
      res.json({ success: true, id: info.lastInsertRowid, path: req.file.path });
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
El JSON debe tener esta estructura exacta:
{
  "supplier_name": "Nombre del proveedor o tienda",
  "quote_date": "Fecha de la cotización si está disponible",
  "items": [
    {
      "description": "Nombre o descripción del producto",
      "quantity": número (entero o decimal),
      "unit_price": precio unitario como número,
      "total": precio total de ese producto (quantity * unit_price) como número
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
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
      // Limpiar posibles bloques de markdown
      const cleanJsonStr = textResult.replace(/^```json/g, "").replace(/```$/g, "").trim();
      const jsonData = JSON.parse(cleanJsonStr);

      res.json(jsonData);
    } catch (error: any) {
      console.error("Error OCR:", error);
      res.status(500).json({ error: "Error procesando la imagen con Inteligencia Artificial." });
    }
  });

  app.get("/api/quotes", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const rows = db.prepare(`
      SELECT q.*, s.name as supplier_name, s.type as supplier_type 
      FROM quotes q 
      JOIN suppliers s ON q.supplier_id = s.id
      WHERE q.center_id = ?
    `).all(centerId);
    res.json(rows);
  });

  app.post("/api/quotes", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { supplier_id, type, total_amount, subtotal, itbis } = req.body;
    const info = db.prepare("INSERT INTO quotes (center_id, supplier_id, type, total_amount, subtotal, itbis) VALUES (?, ?, ?, ?, ?, ?)").run(centerId, supplier_id, type, total_amount, subtotal, itbis);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/quotes/:id", (req, res) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    try {
      const deleteTransaction = db.transaction((quoteId, cid) => {
        // Find Requisitions tied to this Quote
        const reqs = db.prepare("SELECT id FROM requisitions WHERE quote_id = ? AND center_id = ?").all(quoteId, cid) as any[];
        const reqIds = reqs.map(r => r.id);

        if (reqIds.length > 0) {
          // Find POs tied to those Requisitions
          const pos = db.prepare(`SELECT id FROM purchase_orders WHERE requisition_id IN (${reqIds.map(() => '?').join(',')}) AND center_id = ?`).all(...reqIds, cid) as any[];
          const poIds = pos.map(p => p.id);

          if (poIds.length > 0) {
            // Find Checks tied to those POs to clean up financial records
            const checksToDelete = db.prepare(`SELECT * FROM checks WHERE purchase_order_id IN (${poIds.map(() => '?').join(',')}) AND center_id = ?`).all(...poIds, cid) as any[];
            
            for (const check of checksToDelete) {
              // Delete related cash_book
              db.prepare("DELETE FROM cash_book WHERE related_id = ? AND related_type = 'check' AND center_id = ?").run(check.id, cid);
              
              // Delete related bank_transaction (matching by amount and date)
              if (check.amount_gross) {
                db.prepare(`
                  DELETE FROM bank_transactions 
                  WHERE rowid = (
                    SELECT rowid FROM bank_transactions 
                    WHERE amount = ? AND date = ? AND center_id = ? AND type = 'expense'
                    LIMIT 1
                  )
                `).run(check.amount_gross, check.date, cid);
              }
            }

            // Delete Checks tied to those POs
            db.prepare(`DELETE FROM checks WHERE purchase_order_id IN (${poIds.map(() => '?').join(',')}) AND center_id = ?`).run(...poIds, cid);
            // Delete POs
            db.prepare(`DELETE FROM purchase_orders WHERE requisition_id IN (${reqIds.map(() => '?').join(',')}) AND center_id = ?`).run(...reqIds, cid);
          }
        }

        // Delete dependencies first
        db.prepare("DELETE FROM quote_items WHERE quote_id = ? AND center_id = ?").run(quoteId, cid);
        db.prepare("DELETE FROM requisitions WHERE quote_id = ? AND center_id = ?").run(quoteId, cid);

        // Delete main quote
        db.prepare("DELETE FROM quotes WHERE id = ? AND center_id = ?").run(quoteId, cid);
      });
      deleteTransaction(id, centerId);
      res.json({ success: true, message: "Cotización eliminada correctamente." });
    } catch (error: any) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Requisitions
  app.post("/api/requisitions", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { quote_id, code } = req.body;
    const info = db.prepare("INSERT INTO requisitions (center_id, quote_id, code) VALUES (?, ?, ?)").run(centerId, quote_id, code);
    res.json({ id: info.lastInsertRowid });
  });

  // Checks
  app.get("/api/checks", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const rows = db.prepare("SELECT * FROM checks WHERE center_id = ?").all(centerId);
    res.json(rows);
  });

  app.post("/api/checks", (req, res) => {
    const centerId = (req as any).centerId;
    const { check_number, date, amount_gross, supplier_id, beneficiary, retention_isr, retention_itbis, amount_net } = req.body;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    try {
      const transaction = db.transaction(() => {
        const info = db.prepare("INSERT INTO checks (center_id, check_number, date, amount_gross, supplier_id, beneficiary, retention_isr, retention_itbis, amount_net) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(centerId, check_number, date, amount_gross, supplier_id, beneficiary, retention_isr, retention_itbis, amount_net);
        const checkId = info.lastInsertRowid;

        // Mirror the gross amount as an expense in bank_transactions to sync Dashboard
        db.prepare("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)").run(centerId, 'expense', amount_gross, `Pago Cheque #${check_number} - ${beneficiary}`, date);

        return checkId;
      });

      const id = transaction();
      res.json({ id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/checks/:id", (req, res) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      const dbTx = db.transaction((checkId, cid) => {
        // Find the check
        const check = db.prepare("SELECT * FROM checks WHERE id = ? AND center_id = ?").get(checkId, cid) as any;
        if (!check) return;

        // Delete related cash_book (where related_id = checkId and related_type = 'check')
        // Or fallback to beneficiary matching and date matching as emergency fallback
        db.prepare("DELETE FROM cash_book WHERE related_id = ? AND related_type = 'check' AND center_id = ?").run(checkId, cid);

        // Let's also delete the bank_transaction if it was explicitly created tracking this amount and beneficiary
        // Since we don't have hard links for bank_transactions, we match precisely by amount, date and type=expense
        if (check.amount_gross) {
          db.prepare(`
            DELETE FROM bank_transactions 
            WHERE rowid = (
              SELECT rowid FROM bank_transactions 
              WHERE amount = ? AND date = ? AND center_id = ? AND type = 'expense'
              LIMIT 1
            )
          `).run(check.amount_gross, check.date, cid);
        }

        db.prepare("DELETE FROM checks WHERE id = ? AND center_id = ?").run(checkId, cid);
      });
      dbTx(id, centerId);
      res.json({ success: true, message: "Cheque anulado correctamente." });
    } catch (error: any) {
      console.error("Error deleting check:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Products
  app.get("/api/products", (req, res) => {
    const rows = db.prepare("SELECT * FROM products").all();
    res.json(rows);
  });

  app.post("/api/products", (req, res) => {
    const { name, category, unit_price } = req.body;
    const info = db.prepare("INSERT INTO products (name, category, unit_price) VALUES (?, ?, ?)").run(name, category, unit_price);
    res.json({ id: info.lastInsertRowid });
  });

  // Edit Inventory
  app.put("/api/inventory/:id", (req, res) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    const { quantity, minerd_code } = req.body;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      db.prepare("UPDATE inventory SET quantity = ?, minerd_code = ? WHERE id = ? AND center_id = ?").run(quantity, minerd_code, id, centerId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete Inventory
  app.delete("/api/inventory/:id", (req, res) => {
    const centerId = (req as any).centerId;
    const { id } = req.params;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    try {
      db.prepare("DELETE FROM inventory WHERE id = ? AND center_id = ?").run(id, centerId);
      res.json({ success: true, message: "Producto eliminado correctamente." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk Delete Inventory
  app.delete("/api/inventory", (req, res) => {
    const centerId = (req as any).centerId;
    const { ids } = req.body;

    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "Se requiere un arreglo de IDs válido." });

    try {
      const deleteStmt = db.prepare("DELETE FROM inventory WHERE id = ? AND center_id = ?");
      const deleteMany = db.transaction((idList: number[]) => {
        for (const id of idList) {
          deleteStmt.run(id, centerId);
        }
      });
      deleteMany(ids);
      res.json({ success: true, message: `${ids.length} productos eliminados correctamente.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bank Transactions
  app.get("/api/bank/transactions", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const rows = db.prepare("SELECT * FROM bank_transactions WHERE center_id = ? ORDER BY date DESC").all(centerId);
    res.json(rows);
  });

  app.post("/api/bank/transactions", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { type, amount, description, date } = req.body;
    const info = db.prepare("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)").run(centerId, type, amount, description, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/bank/transactions/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM bank_transactions WHERE id = ? AND center_id = ?").run(id, centerId);
      res.json({ success: true, message: "Transacción eliminada correctamente." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Cash Book
  app.get("/api/cash-book", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const rows = db.prepare("SELECT * FROM cash_book WHERE center_id = ? ORDER BY date DESC, id DESC").all(centerId);
    res.json(rows);
  });

  app.post("/api/cash-book", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { date, reference_no, beneficiary, concept, income, expense, retention_isr, retention_itbis, related_id, related_type } = req.body;

    try {
      const transaction = db.transaction(() => {
        // 1. Find the balance of the entry immediately before this new one
        const prevEntry = db.prepare(`
          SELECT balance FROM cash_book 
          WHERE center_id = ? AND (date < ? OR (date = ? AND id < (SELECT MAX(id) + 1 FROM cash_book WHERE center_id = ?)))
          ORDER BY date DESC, id DESC LIMIT 1
        `).get(centerId, date, date, centerId);

        const startBalance = prevEntry ? prevEntry.balance : 0;
        const newBalance = startBalance + (income || 0) - (expense || 0);

        // 2. Insert the new entry
        const info = db.prepare(`
          INSERT INTO cash_book (center_id, date, reference_no, beneficiary, concept, income, expense, balance, retention_isr, retention_itbis, related_id, related_type) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(centerId, date, reference_no, beneficiary, concept, income || 0, expense || 0, newBalance, retention_isr || 0, retention_itbis || 0, related_id, related_type);

        const newId = info.lastInsertRowid;

        // 3. Recalculate all subsequent entries
        const subsequentEntries = db.prepare(`
          SELECT * FROM cash_book 
          WHERE center_id = ? AND (date > ? OR (date = ? AND id > ?)) 
          ORDER BY date ASC, id ASC
        `).all(centerId, date, date, newId);

        let currentBalance = newBalance;
        for (const subEntry of subsequentEntries) {
          currentBalance = currentBalance + subEntry.income - subEntry.expense;
          db.prepare("UPDATE cash_book SET balance = ? WHERE id = ?").run(currentBalance, subEntry.id);
        }

        // 4. Mirror to bank_transactions so the Dashboard sees the movement
        if (income > 0) {
          db.prepare("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)").run(centerId, 'income', income, concept || 'Ingreso Caja', date);
        }
        if (expense > 0) {
          db.prepare("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)").run(centerId, 'expense', expense, concept || 'Egreso Caja', date);
        }

        return newId;
      });

      const id = transaction();
      res.json({ id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put("/api/cash-book/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    const { date, reference_no, beneficiary, concept, income, expense, retention_isr, retention_itbis } = req.body;

    try {
      const transaction = db.transaction(() => {
        const entry = db.prepare("SELECT * FROM cash_book WHERE id = ? AND center_id = ?").get(id, centerId);
        if (!entry) throw new Error("Entry not found");

        // 1. Update the entry
        db.prepare(`
          UPDATE cash_book 
          SET date = ?, reference_no = ?, beneficiary = ?, concept = ?, income = ?, expense = ?, retention_isr = ?, retention_itbis = ?
          WHERE id = ? AND center_id = ?
        `).run(date, reference_no, beneficiary, concept, income || 0, expense || 0, retention_isr || 0, retention_itbis || 0, id, centerId);

        // 2. Recalculate balances from the earliest affected date
        const earliestDate = entry.date < date ? entry.date : date;

        const subsequentEntries = db.prepare(`
          SELECT * FROM cash_book 
          WHERE center_id = ? AND date >= ? 
          ORDER BY date ASC, id ASC
        `).all(centerId, earliestDate);

        let currentBalance = db.prepare(`
          SELECT balance FROM cash_book 
          WHERE center_id = ? AND (date < ? OR (date = ? AND id < (SELECT MIN(id) FROM cash_book WHERE center_id = ? AND date = ?)))
          ORDER BY date DESC, id DESC LIMIT 1
        `).get(centerId, earliestDate, earliestDate, centerId, earliestDate)?.balance || 0;

        for (const subEntry of subsequentEntries) {
          currentBalance = currentBalance + subEntry.income - subEntry.expense;
          db.prepare("UPDATE cash_book SET balance = ? WHERE id = ?").run(currentBalance, subEntry.id);
        }
      });

      transaction();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/cash-book/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;

    try {
      const transaction = db.transaction(() => {
        const entryToDelete = db.prepare("SELECT * FROM cash_book WHERE id = ? AND center_id = ?").get(id, centerId) as any;
        if (!entryToDelete) return;

        // Strip matching trace from bank_transactions to keep dashboard clean
        if (entryToDelete.income > 0) {
          db.prepare(`
            DELETE FROM bank_transactions 
            WHERE rowid = (
              SELECT rowid FROM bank_transactions 
              WHERE center_id = ? AND type = 'income' AND amount = ? AND date = ? 
              LIMIT 1
            )
          `).run(centerId, entryToDelete.income, entryToDelete.date);
        }
        if (entryToDelete.expense > 0) {
          db.prepare(`
            DELETE FROM bank_transactions 
            WHERE rowid = (
              SELECT rowid FROM bank_transactions 
              WHERE center_id = ? AND type = 'expense' AND amount = ? AND date = ? 
              LIMIT 1
            )
          `).run(centerId, entryToDelete.expense, entryToDelete.date);
        }

        db.prepare("DELETE FROM cash_book WHERE id = ? AND center_id = ?").run(id, centerId);

        const subsequentEntries = db.prepare(`
          SELECT * FROM cash_book 
          WHERE center_id = ? AND (date > ? OR (date = ? AND id > ?)) 
          ORDER BY date ASC, id ASC
        `).all(centerId, entryToDelete.date, entryToDelete.date, id);

        const prevEntry = db.prepare(`
          SELECT balance FROM cash_book 
          WHERE center_id = ? AND (date < ? OR (date = ? AND id < ?))
          ORDER BY date DESC, id DESC LIMIT 1
        `).get(centerId, entryToDelete.date, entryToDelete.date, id);

        let currentBalance = prevEntry ? prevEntry.balance : 0;
        for (const subEntry of subsequentEntries) {
          currentBalance = currentBalance + subEntry.income - subEntry.expense;
          db.prepare("UPDATE cash_book SET balance = ? WHERE id = ?").run(currentBalance, subEntry.id);
        }
      });

      transaction();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Petty Cash
  app.get("/api/petty-cash", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const rows = db.prepare("SELECT * FROM petty_cash WHERE center_id = ? ORDER BY date DESC, id DESC").all(centerId);
    const balance = rows.reduce((acc, r) => r.type === 'refill' ? acc + r.amount : acc - r.amount, 0);
    res.json({ entries: rows, balance });
  });

  app.post("/api/petty-cash", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { amount, description, beneficiary, receipt_no, type, date } = req.body;

    if (type === 'expense' && amount > 1000) {
      return res.status(400).json({ success: false, error: "El gasto no puede exceder los RD$1,000 por compra." });
    }

    const info = db.prepare(`
      INSERT INTO petty_cash (center_id, amount, description, beneficiary, receipt_no, type, date) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(centerId, amount, description, beneficiary, receipt_no, type, date);

    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/petty-cash/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    db.prepare("DELETE FROM petty_cash WHERE id = ? AND center_id = ?").run(id, centerId);
    res.json({ success: true });
  });

  // MINERD Codes
  app.get("/api/minerd-codes", (req, res) => {
    const rows = db.prepare("SELECT * FROM minerd_codes ORDER BY code ASC").all();
    res.json(rows);
  });

  app.get("/api/minerd-codes/search", (req, res) => {
    const { q } = req.query;
    const rows = db.prepare("SELECT * FROM minerd_codes WHERE code LIKE ? OR description LIKE ? LIMIT 10")
      .all(`%${q}%`, `%${q}%`);
    res.json(rows);
  });

  // Inventory
  app.get("/api/inventory", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const rows = db.prepare("SELECT * FROM inventory WHERE center_id = ? ORDER BY created_at DESC").all(centerId);
    res.json(rows);
  });

  app.put("/api/inventory/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id } = req.params;
    const { minerd_code, quantity, unit_price } = req.body;
    db.prepare("UPDATE inventory SET minerd_code = ?, quantity = ?, unit_price = ? WHERE id = ? AND center_id = ?").run(minerd_code, quantity, unit_price || 0, id, centerId);
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const income = db.prepare("SELECT SUM(amount) as total FROM bank_transactions WHERE center_id = ? AND type = 'income'").get(centerId).total || 0;
    const expense = db.prepare("SELECT SUM(amount) as total FROM bank_transactions WHERE center_id = ? AND type = 'expense'").get(centerId).total || 0;
    const balance = income - expense;

    const inventoryValue = db.prepare("SELECT SUM(quantity * unit_price) as total FROM inventory WHERE center_id = ?").get(centerId).total || 0;

    const pettyCashIncome = db.prepare("SELECT SUM(amount) as total FROM petty_cash WHERE center_id = ? AND type = 'refill'").get(centerId).total || 0;
    const pettyCashExpense = db.prepare("SELECT SUM(amount) as total FROM petty_cash WHERE center_id = ? AND type = 'expense'").get(centerId).total || 0;
    const pettyCashBalance = pettyCashIncome - pettyCashExpense;

    const categorySpending = db.prepare(`
      SELECT 'General' as category, SUM(amount) as total 
      FROM bank_transactions 
      WHERE center_id = ? AND type = 'expense'
    `).all(centerId);

    // Cash flow by month for current year
    const currentYear = new Date().getFullYear().toString();
    const cashFlowRaw = db.prepare(`
      SELECT 
        strftime('%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as ingresos,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as egresos
      FROM bank_transactions
      WHERE center_id = ? AND strftime('%Y', date) = ?
      GROUP BY month
      ORDER BY month ASC
    `).all(centerId, currentYear);

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const cashFlow = monthNames.map((name, index) => {
      const monthStr = (index + 1).toString().padStart(2, '0');
      const found = cashFlowRaw.find((r: any) => r.month === monthStr);
      return {
        name,
        ingresos: found ? found.ingresos : 0,
        egresos: found ? found.egresos : 0
      };
    });

    res.json({ balance, income, expense, inventoryValue, pettyCashBalance, categorySpending, cashFlow });
  });

  // Bulk Processing
  app.put("/api/process-bulk/:id", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });
    const { id: quoteId } = req.params;

    const {
      supplier,
      quote,
      requisition,
      purchase_order,
      check,
      items
    } = req.body;

    try {
      const transaction = db.transaction(() => {
        // 1. Update Supplier
        let supplierId;
        const existingSupplier = db.prepare("SELECT id FROM suppliers WHERE rnc = ? AND center_id = ?").get(supplier.rnc, centerId);
        if (existingSupplier) {
          supplierId = (existingSupplier as any).id;
          db.prepare("UPDATE suppliers SET name = ?, type = ?, phone = ?, address = ? WHERE id = ? AND center_id = ?")
            .run(supplier.name, supplier.type, supplier.phone, supplier.address, supplierId, centerId);
        } else {
          const info = db.prepare("INSERT INTO suppliers (center_id, name, rnc, type, phone, address) VALUES (?, ?, ?, ?, ?, ?)")
            .run(centerId, supplier.name, supplier.rnc, supplier.type, supplier.phone, supplier.address);
          supplierId = info.lastInsertRowid;
        }

        // 2. Update Quote
        db.prepare("UPDATE quotes SET supplier_id = ?, type = ?, total_amount = ?, subtotal = ?, itbis = ? WHERE id = ? AND center_id = ?")
          .run(supplierId, quote.type, quote.total_amount, quote.subtotal, quote.itbis, quoteId, centerId);

        // 3. Update Requisition
        const currentReq = db.prepare("SELECT id FROM requisitions WHERE quote_id = ? AND center_id = ?").get(quoteId, centerId);
        if (currentReq) {
          db.prepare("UPDATE requisitions SET poa_year = ? WHERE id = ? AND center_id = ?")
            .run(requisition.poa_year, (currentReq as any).id, centerId);

          // 4. Update PO
          const currentPo = db.prepare("SELECT id FROM purchase_orders WHERE requisition_id = ? AND center_id = ?").get((currentReq as any).id, centerId);
          if (currentPo) {
            db.prepare("UPDATE purchase_orders SET supplier_id = ?, total_amount = ?, subtotal = ?, itbis = ?, ncf = ? WHERE id = ? AND center_id = ?")
              .run(supplierId, purchase_order.total_amount, purchase_order.subtotal, purchase_order.itbis, purchase_order.ncf, (currentPo as any).id, centerId);

            // 5. Update Check
            const currentCheck = db.prepare("SELECT id FROM checks WHERE purchase_order_id = ? AND center_id = ?").get((currentPo as any).id, centerId);
            if (currentCheck) {
              db.prepare(`
                UPDATE checks SET check_number = ?, date = ?, amount_gross = ?, retention_isr = ?, retention_itbis = ?, amount_net = ?, beneficiary = ?
                WHERE id = ? AND center_id = ?
              `).run(check.check_number, check.date, check.amount_gross, check.retention_isr, check.retention_itbis, check.amount_net, check.beneficiary, (currentCheck as any).id, centerId);
            }
          }
        }

        // 6. Delete old items and insert new
        db.prepare("DELETE FROM quote_items WHERE quote_id = ? AND center_id = ?").run(quoteId, centerId);
        const insertItem = db.prepare("INSERT INTO quote_items (center_id, quote_id, description, quantity, unit_price, total, minerd_code) VALUES (?, ?, ?, ?, ?, ?, ?)");
        items.forEach((item: any) => {
          insertItem.run(centerId, quoteId, item.name, item.quantity, item.unit_price, item.total, item.minerd_code || '');
        });

        const poId = currentReq ? db.prepare("SELECT id FROM purchase_orders WHERE requisition_id = ?").get((currentReq as any).id) : null;
        const checkId = poId ? db.prepare("SELECT id FROM checks WHERE purchase_order_id = ?").get((poId as any).id) : null;
        return { quoteId, requisitionId: currentReq ? (currentReq as any).id : null, poId: poId ? (poId as any).id : null, checkId: checkId ? (checkId as any).id : null };
      });

      const ids = transaction();
      res.json({ success: true, ...ids });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/process-bulk", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const {
      supplier,
      quote,
      requisition,
      purchase_order,
      check,
      bank_transaction,
      items
    } = req.body;

    try {
      const transaction = db.transaction(() => {
        // 1. Supplier (upsert by RNC and center_id)
        let supplierId;
        const existingSupplier = db.prepare("SELECT id FROM suppliers WHERE rnc = ? AND center_id = ?").get(supplier.rnc, centerId);
        if (existingSupplier) {
          supplierId = existingSupplier.id;
          db.prepare("UPDATE suppliers SET name = ?, type = ?, phone = ?, address = ? WHERE id = ? AND center_id = ?")
            .run(supplier.name, supplier.type, supplier.phone, supplier.address, supplierId, centerId);
        } else {
          const info = db.prepare("INSERT INTO suppliers (center_id, name, rnc, type, phone, address) VALUES (?, ?, ?, ?, ?, ?)")
            .run(centerId, supplier.name, supplier.rnc, supplier.type, supplier.phone, supplier.address);
          supplierId = info.lastInsertRowid;
        }

        // 2. Quote
        const quoteInfo = db.prepare("INSERT INTO quotes (center_id, supplier_id, type, total_amount, subtotal, itbis, description) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(centerId, supplierId, quote.type, quote.total_amount, quote.subtotal, quote.itbis, quote.description);
        const quoteId = quoteInfo.lastInsertRowid;

        // 3. Requisition
        const reqInfo = db.prepare("INSERT INTO requisitions (center_id, quote_id, code, poa_year, description) VALUES (?, ?, ?, ?, ?)")
          .run(centerId, quoteId, requisition.code, requisition.poa_year, quote.description);
        const requisitionId = reqInfo.lastInsertRowid;

        // 4. Purchase Order
        const poInfo = db.prepare("INSERT INTO purchase_orders (center_id, requisition_id, supplier_id, total_amount, subtotal, itbis, ncf, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
          .run(centerId, requisitionId, supplierId, purchase_order.total_amount, purchase_order.subtotal, purchase_order.itbis, purchase_order.ncf, purchase_order.description);
        const poId = poInfo.lastInsertRowid;

        // 5. Check
        const checkInfo = db.prepare(`
          INSERT INTO checks (center_id, check_number, date, amount_gross, retention_isr, retention_itbis, amount_net, beneficiary, purchase_order_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(centerId, check.check_number, check.date, check.amount_gross, check.retention_isr, check.retention_itbis, check.amount_net, check.beneficiary, poId);
        const checkId = checkInfo.lastInsertRowid;

        // 6. Bank Transaction
        db.prepare("INSERT INTO bank_transactions (center_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?)")
          .run(centerId, bank_transaction.type, bank_transaction.amount, bank_transaction.description, bank_transaction.date);

        // 6.1 Cash Book Entry
        const lastEntry = db.prepare("SELECT balance FROM cash_book WHERE center_id = ? ORDER BY date DESC, id DESC LIMIT 1").get(centerId);
        const lastBalance = lastEntry ? lastEntry.balance : 0;
        const newBalance = lastBalance - check.amount_net;

        db.prepare(`
          INSERT INTO cash_book (center_id, date, reference_no, beneficiary, concept, income, expense, balance, retention_isr, retention_itbis, related_id, related_type) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          centerId,
          check.date,
          check.check_number,
          check.beneficiary,
          purchase_order.description || 'Pago a Suplidor',
          0,
          check.amount_net,
          newBalance,
          check.retention_isr,
          check.retention_itbis,
          checkId,
          'check'
        );

        // 7. Items (Inventory / Services)
        if (items && Array.isArray(items)) {
          for (const item of items) {
            const itemTotal = item.total || (item.quantity * item.unit_price);
            db.prepare(`
              INSERT INTO quote_items (center_id, quote_id, description, quantity, unit_price, total, minerd_code) 
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(centerId, quoteId, item.name, item.quantity, item.unit_price, itemTotal, item.minerd_code);

            if (quote.type === 'materials') {
              const existingItem = db.prepare("SELECT id FROM inventory WHERE name LIKE ? AND center_id = ?").get(`%${item.name}%`, centerId) as any;

              if (existingItem) {
                db.prepare(`
                  UPDATE inventory 
                  SET quantity = quantity + ?, unit_price = ?, minerd_code = ? 
                  WHERE id = ?
                `).run(item.quantity, item.unit_price, item.minerd_code, existingItem.id);
              } else {
                db.prepare(`
                  INSERT INTO inventory (center_id, name, description, quantity, unit_price, min_quantity, category, minerd_code) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(centerId, item.name, item.name, item.quantity, item.unit_price, 5, 'Materiales', item.minerd_code);
              }
            }
          }
        }

        return { quoteId, requisitionId, poId, checkId };
      });

      const result = transaction();
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/reset", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    try {
      const resetTransaction = db.transaction((cid) => {
        // Clear all transactional tables mapped to this specific center
        db.prepare("DELETE FROM bank_transactions WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM cash_book WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM checks WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM purchase_orders WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM requisitions WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM quote_items WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM quotes WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM inventory WHERE center_id = ?").run(cid);
        db.prepare("DELETE FROM petty_cash WHERE center_id = ?").run(cid);
      });
      resetTransaction(centerId);
      res.json({ success: true, message: "Datos de transacciones borrados exitosamente" });
    } catch (error: any) {
      console.error("Error resetting data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports", (req, res) => {
    const centerId = (req as any).centerId;
    if (!centerId) return res.status(400).json({ error: "Center ID required" });

    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    try {
      const quotes = db.prepare(`
        SELECT q.*, s.name as supplier_name 
        FROM quotes q 
        JOIN suppliers s ON q.supplier_id = s.id 
        WHERE q.center_id = ? AND q.created_at BETWEEN ? AND ?
      `).all(centerId, startDate + " 00:00:00", endDate + " 23:59:59");

      const cashBook = db.prepare(`
        SELECT * FROM cash_book 
        WHERE center_id = ? AND date BETWEEN ? AND ?
      `).all(centerId, startDate, endDate);

      const pettyCash = db.prepare(`
        SELECT * FROM petty_cash 
        WHERE center_id = ? AND date BETWEEN ? AND ?
      `).all(centerId, startDate, endDate);

      const inventory = db.prepare(`
        SELECT * FROM inventory 
        WHERE center_id = ? AND created_at BETWEEN ? AND ?
      `).all(centerId, startDate + " 00:00:00", endDate + " 23:59:59");

      const quoteItems = db.prepare(`
        SELECT qi.*, q.created_at as quote_date, sup.name as supplier_name
        FROM quote_items qi
        JOIN quotes q ON qi.quote_id = q.id
        JOIN suppliers sup ON q.supplier_id = sup.id
        WHERE q.center_id = ? AND q.created_at BETWEEN ? AND ?
      `).all(centerId, startDate + " 00:00:00", endDate + " 23:59:59");

      res.json({
        quotes,
        cashBook,
        pettyCash,
        inventory,
        quoteItems
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SPA Fallback - MUST BE LAST
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.get("/api/backup-db", (req, res) => {
    try {
      if (!fs.existsSync(DB_PATH)) {
        return res.status(404).json({ error: "Base de datos no encontrada" });
      }
      res.download(DB_PATH, `backup-genesis-${new Date().toISOString().split('T')[0]}.db`);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/restore-db", upload.single("backup"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });

    try {
      // Close current connection
      db.close();

      // Backup current DB just in case
      if (fs.existsSync(DB_PATH)) {
        fs.renameSync(DB_PATH, DB_PATH + ".bak");
      }

      // Save new DB
      fs.writeFileSync(DB_PATH, req.file.buffer);

      // Reopen connection
      db = new Database(DB_PATH);

      res.json({ success: true, message: "Base de datos restaurada correctamente" });
    } catch (error: any) {
      console.error("Error restoring database:", error);
      // Try to recover if possible
      if (!fs.existsSync(DB_PATH) && fs.existsSync(DB_PATH + ".bak")) {
        fs.renameSync(DB_PATH + ".bak", DB_PATH);
        db = new Database(DB_PATH);
      }
      res.status(500).json({ error: "Error al restaurar la base de datos: " + error.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
