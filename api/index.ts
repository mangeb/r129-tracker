import express from "express";
import initSqlJs, { type Database } from "sql.js";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

// --- In-memory SQLite via sql.js ---
let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;
  const SQL = await initSqlJs();

  // Try to load the seed database file
  const dbPath = path.resolve(process.cwd(), "data", "r129.db");
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    // Fallback: create empty in-memory db with schema
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS phases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'planned',
        color TEXT NOT NULL DEFAULT '#d4a017'
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phase_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        estimated_cost REAL,
        actual_cost REAL,
        notes TEXT,
        category TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT
      );
      CREATE TABLE IF NOT EXISTS parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        name TEXT NOT NULL,
        part_number TEXT,
        category TEXT NOT NULL,
        vendor TEXT,
        vendor_url TEXT,
        estimated_price REAL,
        actual_price REAL,
        status TEXT NOT NULL DEFAULT 'needed',
        notes TEXT,
        is_oem INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT,
        specialty TEXT,
        notes TEXT,
        rating INTEGER
      );
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        source_url TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        part_id INTEGER,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        vendor TEXT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        receipt_url TEXT
      );
    `);
  }
  return db;
}

function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

function queryAll(database: Database, sql: string, params: any[] = []): any[] {
  const stmt = database.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(snakeToCamel(stmt.getAsObject()));
  }
  stmt.free();
  return rows;
}

function queryOne(database: Database, sql: string, params: any[] = []): any | undefined {
  const rows = queryAll(database, sql, params);
  return rows[0];
}

function runSql(database: Database, sql: string, params: any[] = []): void {
  database.run(sql, params);
}

function getLastInsertId(database: Database): number {
  const row = queryOne(database, "SELECT last_insert_rowid() as id");
  return row.id;
}

// === PHASES ===
app.get("/api/phases", async (_req, res) => {
  const database = await getDb();
  res.json(queryAll(database, "SELECT * FROM phases ORDER BY \"order\" ASC"));
});

app.post("/api/phases", async (req, res) => {
  const database = await getDb();
  const { name, description, order, status, color } = req.body;
  runSql(database, "INSERT INTO phases (name, description, \"order\", status, color) VALUES (?, ?, ?, ?, ?)",
    [name, description || null, order || 0, status || "planned", color || "#d4a017"]);
  const id = getLastInsertId(database);
  res.json(queryOne(database, "SELECT * FROM phases WHERE id = ?", [id]));
});

app.patch("/api/phases/:id", async (req, res) => {
  const database = await getDb();
  const id = Number(req.params.id);
  const fields = req.body;
  const sets = Object.keys(fields).map(k => {
    const col = k === "order" ? '"order"' : k.replace(/[A-Z]/g, l => '_' + l.toLowerCase());
    return `${col} = ?`;
  }).join(", ");
  const vals = Object.values(fields);
  runSql(database, `UPDATE phases SET ${sets} WHERE id = ?`, [...vals, id]);
  const phase = queryOne(database, "SELECT * FROM phases WHERE id = ?", [id]);
  phase ? res.json(phase) : res.status(404).json({ message: "Not found" });
});

app.delete("/api/phases/:id", async (req, res) => {
  const database = await getDb();
  const id = Number(req.params.id);
  runSql(database, "DELETE FROM tasks WHERE phase_id = ?", [id]);
  runSql(database, "DELETE FROM phases WHERE id = ?", [id]);
  res.json({ success: true });
});

// === TASKS ===
app.get("/api/tasks", async (_req, res) => {
  const database = await getDb();
  res.json(queryAll(database, "SELECT * FROM tasks"));
});

app.post("/api/tasks", async (req, res) => {
  const database = await getDb();
  const { title, description, phaseId, status, priority, estimatedCost, notes, category, createdAt } = req.body;
  runSql(database, "INSERT INTO tasks (title, description, phase_id, status, priority, estimated_cost, notes, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [title, description || null, phaseId, status || "todo", priority || "medium", estimatedCost || null, notes || null, category || null, createdAt || new Date().toISOString()]);
  const id = getLastInsertId(database);
  res.json(queryOne(database, "SELECT * FROM tasks WHERE id = ?", [id]));
});

app.patch("/api/tasks/:id", async (req, res) => {
  const database = await getDb();
  const id = Number(req.params.id);
  const fields = req.body;
  const colMap: Record<string, string> = {
    phaseId: "phase_id", estimatedCost: "estimated_cost", actualCost: "actual_cost",
    createdAt: "created_at", completedAt: "completed_at"
  };
  const sets = Object.keys(fields).map(k => `${colMap[k] || k} = ?`).join(", ");
  const vals = Object.values(fields);
  runSql(database, `UPDATE tasks SET ${sets} WHERE id = ?`, [...vals, id]);
  const task = queryOne(database, "SELECT * FROM tasks WHERE id = ?", [id]);
  task ? res.json(task) : res.status(404).json({ message: "Not found" });
});

app.delete("/api/tasks/:id", async (req, res) => {
  const database = await getDb();
  runSql(database, "DELETE FROM tasks WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

// === PARTS ===
app.get("/api/parts", async (_req, res) => {
  const database = await getDb();
  res.json(queryAll(database, "SELECT * FROM parts"));
});

app.post("/api/parts", async (req, res) => {
  const database = await getDb();
  const { name, partNumber, category, vendor, vendorUrl, estimatedPrice, notes, isOem, status } = req.body;
  runSql(database, "INSERT INTO parts (name, part_number, category, vendor, vendor_url, estimated_price, notes, is_oem, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [name, partNumber || null, category, vendor || null, vendorUrl || null, estimatedPrice || null, notes || null, isOem ? 1 : 0, status || "needed"]);
  const id = getLastInsertId(database);
  res.json(queryOne(database, "SELECT * FROM parts WHERE id = ?", [id]));
});

app.patch("/api/parts/:id", async (req, res) => {
  const database = await getDb();
  const id = Number(req.params.id);
  const fields = req.body;
  const colMap: Record<string, string> = {
    partNumber: "part_number", vendorUrl: "vendor_url", estimatedPrice: "estimated_price",
    actualPrice: "actual_price", isOem: "is_oem", taskId: "task_id"
  };
  const sets = Object.keys(fields).map(k => `${colMap[k] || k} = ?`).join(", ");
  const vals = Object.values(fields).map(v => v === true ? 1 : v === false ? 0 : v);
  runSql(database, `UPDATE parts SET ${sets} WHERE id = ?`, [...vals, id]);
  const part = queryOne(database, "SELECT * FROM parts WHERE id = ?", [id]);
  part ? res.json(part) : res.status(404).json({ message: "Not found" });
});

app.delete("/api/parts/:id", async (req, res) => {
  const database = await getDb();
  runSql(database, "DELETE FROM parts WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

// === KNOWLEDGE BASE ===
app.get("/api/knowledge", async (_req, res) => {
  const database = await getDb();
  res.json(queryAll(database, "SELECT * FROM knowledge_base"));
});

app.post("/api/knowledge", async (req, res) => {
  const database = await getDb();
  const { title, content, category, tags, sourceUrl, createdAt } = req.body;
  runSql(database, "INSERT INTO knowledge_base (title, content, category, tags, source_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [title, content, category, tags || null, sourceUrl || null, createdAt || new Date().toISOString()]);
  const id = getLastInsertId(database);
  res.json(queryOne(database, "SELECT * FROM knowledge_base WHERE id = ?", [id]));
});

app.delete("/api/knowledge/:id", async (req, res) => {
  const database = await getDb();
  runSql(database, "DELETE FROM knowledge_base WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

// === EXPENSES ===
app.get("/api/expenses", async (_req, res) => {
  const database = await getDb();
  res.json(queryAll(database, "SELECT * FROM expenses"));
});

app.post("/api/expenses", async (req, res) => {
  const database = await getDb();
  const { description, amount, vendor, date, category } = req.body;
  runSql(database, "INSERT INTO expenses (description, amount, vendor, date, category) VALUES (?, ?, ?, ?, ?)",
    [description, amount, vendor || null, date, category]);
  const id = getLastInsertId(database);
  res.json(queryOne(database, "SELECT * FROM expenses WHERE id = ?", [id]));
});

app.delete("/api/expenses/:id", async (req, res) => {
  const database = await getDb();
  runSql(database, "DELETE FROM expenses WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
});

// === DASHBOARD ===
app.get("/api/dashboard", async (_req, res) => {
  const database = await getDb();
  const allTasks = queryAll(database, "SELECT * FROM tasks");
  const allParts = queryAll(database, "SELECT * FROM parts");
  const allExpenses = queryAll(database, "SELECT * FROM expenses");

  res.json({
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t: any) => t.status === "completed").length,
    totalBudget: allTasks.reduce((sum: number, t: any) => sum + (t.estimated_cost || 0), 0),
    totalSpent: allExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
    partsNeeded: allParts.filter((p: any) => p.status === "needed").length,
    partsReceived: allParts.filter((p: any) => p.status === "received" || p.status === "installed").length,
  });
});

export default app;
