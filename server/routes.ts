import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export function registerRoutes(server: Server, app: Express) {
  // === PHASES ===
  app.get("/api/phases", (_req, res) => {
    res.json(storage.getPhases());
  });
  app.post("/api/phases", (req, res) => {
    const phase = storage.createPhase(req.body);
    res.status(201).json(phase);
  });
  app.patch("/api/phases/:id", (req, res) => {
    const phase = storage.updatePhase(Number(req.params.id), req.body);
    if (!phase) return res.status(404).json({ error: "Phase not found" });
    res.json(phase);
  });
  app.delete("/api/phases/:id", (req, res) => {
    storage.deletePhase(Number(req.params.id));
    res.status(204).send();
  });

  // === TASKS ===
  app.get("/api/tasks", (req, res) => {
    const phaseId = req.query.phaseId ? Number(req.query.phaseId) : undefined;
    res.json(storage.getTasks(phaseId));
  });
  app.get("/api/tasks/:id", (req, res) => {
    const task = storage.getTask(Number(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });
  app.post("/api/tasks", (req, res) => {
    const task = storage.createTask(req.body);
    res.status(201).json(task);
  });
  app.patch("/api/tasks/:id", (req, res) => {
    const task = storage.updateTask(Number(req.params.id), req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });
  app.delete("/api/tasks/:id", (req, res) => {
    storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  // === PARTS ===
  app.get("/api/parts", (req, res) => {
    const taskId = req.query.taskId ? Number(req.query.taskId) : undefined;
    res.json(storage.getParts(taskId));
  });
  app.post("/api/parts", (req, res) => {
    const part = storage.createPart(req.body);
    res.status(201).json(part);
  });
  app.patch("/api/parts/:id", (req, res) => {
    const part = storage.updatePart(Number(req.params.id), req.body);
    if (!part) return res.status(404).json({ error: "Part not found" });
    res.json(part);
  });
  app.delete("/api/parts/:id", (req, res) => {
    storage.deletePart(Number(req.params.id));
    res.status(204).send();
  });

  // === VENDORS ===
  app.get("/api/vendors", (_req, res) => {
    res.json(storage.getVendors());
  });
  app.post("/api/vendors", (req, res) => {
    const vendor = storage.createVendor(req.body);
    res.status(201).json(vendor);
  });
  app.patch("/api/vendors/:id", (req, res) => {
    const vendor = storage.updateVendor(Number(req.params.id), req.body);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  });
  app.delete("/api/vendors/:id", (req, res) => {
    storage.deleteVendor(Number(req.params.id));
    res.status(204).send();
  });

  // === KNOWLEDGE BASE ===
  app.get("/api/knowledge", (req, res) => {
    const category = req.query.category as string | undefined;
    res.json(storage.getKnowledgeEntries(category));
  });
  app.post("/api/knowledge", (req, res) => {
    const entry = storage.createKnowledgeEntry(req.body);
    res.status(201).json(entry);
  });
  app.patch("/api/knowledge/:id", (req, res) => {
    const entry = storage.updateKnowledgeEntry(Number(req.params.id), req.body);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  });
  app.delete("/api/knowledge/:id", (req, res) => {
    storage.deleteKnowledgeEntry(Number(req.params.id));
    res.status(204).send();
  });

  // === EXPENSES ===
  app.get("/api/expenses", (_req, res) => {
    res.json(storage.getExpenses());
  });
  app.post("/api/expenses", (req, res) => {
    const expense = storage.createExpense(req.body);
    res.status(201).json(expense);
  });
  app.delete("/api/expenses/:id", (req, res) => {
    storage.deleteExpense(Number(req.params.id));
    res.status(204).send();
  });

  // === DASHBOARD ===
  app.get("/api/dashboard", (_req, res) => {
    res.json(storage.getDashboardStats());
  });
}
