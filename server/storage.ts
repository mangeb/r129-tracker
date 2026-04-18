import { 
  phases, tasks, parts, vendors, knowledgeBase, expenses,
  type Phase, type InsertPhase,
  type Task, type InsertTask,
  type Part, type InsertPart,
  type Vendor, type InsertVendor,
  type KnowledgeBase, type InsertKnowledgeBase,
  type Expense, type InsertExpense,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("r129.db");
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
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

export interface IStorage {
  // Phases
  getPhases(): Phase[];
  getPhase(id: number): Phase | undefined;
  createPhase(phase: InsertPhase): Phase;
  updatePhase(id: number, phase: Partial<InsertPhase>): Phase | undefined;
  deletePhase(id: number): void;

  // Tasks
  getTasks(phaseId?: number): Task[];
  getTask(id: number): Task | undefined;
  createTask(task: InsertTask): Task;
  updateTask(id: number, task: Partial<InsertTask>): Task | undefined;
  deleteTask(id: number): void;

  // Parts
  getParts(taskId?: number): Part[];
  getPart(id: number): Part | undefined;
  createPart(part: InsertPart): Part;
  updatePart(id: number, part: Partial<InsertPart>): Part | undefined;
  deletePart(id: number): void;

  // Vendors
  getVendors(): Vendor[];
  getVendor(id: number): Vendor | undefined;
  createVendor(vendor: InsertVendor): Vendor;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Vendor | undefined;
  deleteVendor(id: number): void;

  // Knowledge Base
  getKnowledgeEntries(category?: string): KnowledgeBase[];
  getKnowledgeEntry(id: number): KnowledgeBase | undefined;
  createKnowledgeEntry(entry: InsertKnowledgeBase): KnowledgeBase;
  updateKnowledgeEntry(id: number, entry: Partial<InsertKnowledgeBase>): KnowledgeBase | undefined;
  deleteKnowledgeEntry(id: number): void;

  // Expenses
  getExpenses(): Expense[];
  getExpense(id: number): Expense | undefined;
  createExpense(expense: InsertExpense): Expense;
  deleteExpense(id: number): void;

  // Dashboard stats
  getDashboardStats(): {
    totalTasks: number;
    completedTasks: number;
    totalBudget: number;
    totalSpent: number;
    partsNeeded: number;
    partsReceived: number;
  };
}

export class SqliteStorage implements IStorage {
  // Phases
  getPhases(): Phase[] {
    return db.select().from(phases).all();
  }
  getPhase(id: number): Phase | undefined {
    return db.select().from(phases).where(eq(phases.id, id)).get();
  }
  createPhase(phase: InsertPhase): Phase {
    return db.insert(phases).values(phase).returning().get();
  }
  updatePhase(id: number, data: Partial<InsertPhase>): Phase | undefined {
    return db.update(phases).set(data).where(eq(phases.id, id)).returning().get();
  }
  deletePhase(id: number): void {
    db.delete(phases).where(eq(phases.id, id)).run();
  }

  // Tasks
  getTasks(phaseId?: number): Task[] {
    if (phaseId !== undefined) {
      return db.select().from(tasks).where(eq(tasks.phaseId, phaseId)).all();
    }
    return db.select().from(tasks).all();
  }
  getTask(id: number): Task | undefined {
    return db.select().from(tasks).where(eq(tasks.id, id)).get();
  }
  createTask(task: InsertTask): Task {
    return db.insert(tasks).values(task).returning().get();
  }
  updateTask(id: number, data: Partial<InsertTask>): Task | undefined {
    return db.update(tasks).set(data).where(eq(tasks.id, id)).returning().get();
  }
  deleteTask(id: number): void {
    db.delete(tasks).where(eq(tasks.id, id)).run();
  }

  // Parts
  getParts(taskId?: number): Part[] {
    if (taskId !== undefined) {
      return db.select().from(parts).where(eq(parts.taskId, taskId)).all();
    }
    return db.select().from(parts).all();
  }
  getPart(id: number): Part | undefined {
    return db.select().from(parts).where(eq(parts.id, id)).get();
  }
  createPart(part: InsertPart): Part {
    return db.insert(parts).values(part).returning().get();
  }
  updatePart(id: number, data: Partial<InsertPart>): Part | undefined {
    return db.update(parts).set(data).where(eq(parts.id, id)).returning().get();
  }
  deletePart(id: number): void {
    db.delete(parts).where(eq(parts.id, id)).run();
  }

  // Vendors
  getVendors(): Vendor[] {
    return db.select().from(vendors).all();
  }
  getVendor(id: number): Vendor | undefined {
    return db.select().from(vendors).where(eq(vendors.id, id)).get();
  }
  createVendor(vendor: InsertVendor): Vendor {
    return db.insert(vendors).values(vendor).returning().get();
  }
  updateVendor(id: number, data: Partial<InsertVendor>): Vendor | undefined {
    return db.update(vendors).set(data).where(eq(vendors.id, id)).returning().get();
  }
  deleteVendor(id: number): void {
    db.delete(vendors).where(eq(vendors.id, id)).run();
  }

  // Knowledge Base
  getKnowledgeEntries(category?: string): KnowledgeBase[] {
    if (category) {
      return db.select().from(knowledgeBase).where(eq(knowledgeBase.category, category)).all();
    }
    return db.select().from(knowledgeBase).all();
  }
  getKnowledgeEntry(id: number): KnowledgeBase | undefined {
    return db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id)).get();
  }
  createKnowledgeEntry(entry: InsertKnowledgeBase): KnowledgeBase {
    return db.insert(knowledgeBase).values(entry).returning().get();
  }
  updateKnowledgeEntry(id: number, data: Partial<InsertKnowledgeBase>): KnowledgeBase | undefined {
    return db.update(knowledgeBase).set(data).where(eq(knowledgeBase.id, id)).returning().get();
  }
  deleteKnowledgeEntry(id: number): void {
    db.delete(knowledgeBase).where(eq(knowledgeBase.id, id)).run();
  }

  // Expenses
  getExpenses(): Expense[] {
    return db.select().from(expenses).all();
  }
  getExpense(id: number): Expense | undefined {
    return db.select().from(expenses).where(eq(expenses.id, id)).get();
  }
  createExpense(expense: InsertExpense): Expense {
    return db.insert(expenses).values(expense).returning().get();
  }
  deleteExpense(id: number): void {
    db.delete(expenses).where(eq(expenses.id, id)).run();
  }

  // Dashboard
  getDashboardStats() {
    const allTasks = this.getTasks();
    const allParts = this.getParts();
    const allExpenses = this.getExpenses();

    return {
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === "completed").length,
      totalBudget: allTasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0),
      totalSpent: allExpenses.reduce((sum, e) => sum + e.amount, 0),
      partsNeeded: allParts.filter(p => p.status === "needed").length,
      partsReceived: allParts.filter(p => p.status === "received" || p.status === "installed").length,
    };
  }
}

export const storage = new SqliteStorage();
