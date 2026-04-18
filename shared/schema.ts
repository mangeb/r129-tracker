import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project phases for organizing work
export const phases = sqliteTable("phases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  status: text("status").notNull().default("planned"), // planned, in_progress, completed
  color: text("color").notNull().default("#d4a017"),
});

export const insertPhaseSchema = createInsertSchema(phases).omit({ id: true });
export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type Phase = typeof phases.$inferSelect;

// Tasks within phases
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phaseId: integer("phase_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"), // todo, in_progress, blocked, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  estimatedCost: real("estimated_cost"),
  actualCost: real("actual_cost"),
  notes: text("notes"),
  category: text("category"), // engine, suspension, brakes, electrical, interior, exterior, transmission, cooling, misc
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Parts list with sourcing info
export const parts = sqliteTable("parts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id"),
  name: text("name").notNull(),
  partNumber: text("part_number"),
  category: text("category").notNull(),
  vendor: text("vendor"),
  vendorUrl: text("vendor_url"),
  estimatedPrice: real("estimated_price"),
  actualPrice: real("actual_price"),
  status: text("status").notNull().default("needed"), // needed, ordered, shipped, received, installed
  notes: text("notes"),
  isOem: integer("is_oem", { mode: "boolean" }).default(false),
});

export const insertPartSchema = createInsertSchema(parts).omit({ id: true });
export type InsertPart = z.infer<typeof insertPartSchema>;
export type Part = typeof parts.$inferSelect;

// Vendors / specialist shops
export const vendors = sqliteTable("vendors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url"),
  specialty: text("specialty"),
  notes: text("notes"),
  rating: integer("rating"), // 1-5
});

export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true });
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// Research notes / knowledge base entries
export const knowledgeBase = sqliteTable("knowledge_base", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // known_issue, mod_guide, reference, tip
  tags: text("tags"), // JSON array stored as text
  sourceUrl: text("source_url"),
  createdAt: text("created_at").notNull(),
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({ id: true });
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;

// Expense log
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id"),
  partId: integer("part_id"),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  vendor: text("vendor"),
  date: text("date").notNull(),
  category: text("category").notNull(),
  receiptUrl: text("receipt_url"),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
