import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, DollarSign } from "lucide-react";
import type { Phase, Task, Expense } from "@shared/schema";

const PHASE_COLORS = ["#d4a017", "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#0891b2", "#ea580c", "#6366f1"];

export default function TimelinePage() {
  const { toast } = useToast();
  const [phaseDialogOpen, setPhaseDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  // Phase form
  const [phaseName, setPhaseName] = useState("");
  const [phaseDesc, setPhaseDesc] = useState("");
  const [phaseColor, setPhaseColor] = useState(PHASE_COLORS[0]);

  // Expense form
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expVendor, setExpVendor] = useState("");
  const [expCategory, setExpCategory] = useState("misc");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: phases = [] } = useQuery<Phase[]>({ queryKey: ["/api/phases"] });
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: expenses = [] } = useQuery<Expense[]>({ queryKey: ["/api/expenses"] });

  const createPhase = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/phases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phases"] });
      setPhaseDialogOpen(false);
      setPhaseName(""); setPhaseDesc("");
      toast({ title: "Phase created" });
    },
  });

  const updatePhase = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await apiRequest("PATCH", `/api/phases/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phases"] });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/phases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Phase deleted" });
    },
  });

  const createExpense = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/expenses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setExpenseDialogOpen(false);
      setExpDesc(""); setExpAmount(""); setExpVendor(""); setExpCategory("misc");
      toast({ title: "Expense logged" });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Expense removed" });
    },
  });

  function handleCreatePhase() {
    if (!phaseName) { toast({ title: "Phase name required", variant: "destructive" }); return; }
    createPhase.mutate({ name: phaseName, description: phaseDesc || null, order: phases.length, color: phaseColor });
  }

  function handleCreateExpense() {
    if (!expDesc || !expAmount) { toast({ title: "Description and amount required", variant: "destructive" }); return; }
    createExpense.mutate({
      description: expDesc,
      amount: Number(expAmount),
      vendor: expVendor || null,
      category: expCategory,
      date: expDate,
    });
  }

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Cost by category
  const costByCategory: Record<string, { estimated: number; spent: number }> = {};
  for (const t of tasks) {
    const cat = t.category || "misc";
    if (!costByCategory[cat]) costByCategory[cat] = { estimated: 0, spent: 0 };
    costByCategory[cat].estimated += t.estimatedCost || 0;
  }
  for (const e of expenses) {
    const cat = e.category || "misc";
    if (!costByCategory[cat]) costByCategory[cat] = { estimated: 0, spent: 0 };
    costByCategory[cat].spent += e.amount;
  }

  return (
    <div className="space-y-4 md:space-y-6" data-testid="timeline-page">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight" data-testid="text-page-title">Timeline & Costs</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {phases.length} phases · Est. ${totalEstimated.toLocaleString()} · Spent ${totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-1.5 md:gap-2 shrink-0">
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs md:text-sm px-2 md:px-3" data-testid="button-add-expense">
                <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-1" />
                <span className="hidden md:inline">Log Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Log Expense</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Description" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} data-testid="input-expense-desc" />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Amount ($)" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} data-testid="input-expense-amount" />
                  <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} data-testid="input-expense-date" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Vendor" value={expVendor} onChange={(e) => setExpVendor(e.target.value)} data-testid="input-expense-vendor" />
                  <Select value={expCategory} onValueChange={setExpCategory}>
                    <SelectTrigger data-testid="select-expense-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["engine", "suspension", "brakes", "electrical", "interior", "exterior", "transmission", "cooling", "misc"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateExpense} disabled={createExpense.isPending} className="w-full" data-testid="button-submit-expense">
                  {createExpense.isPending ? "Logging..." : "Log Expense"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={phaseDialogOpen} onOpenChange={setPhaseDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs md:text-sm px-2 md:px-3" data-testid="button-add-phase">
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-1" />
                <span className="hidden md:inline">Add Phase</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New Phase</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Phase name" value={phaseName} onChange={(e) => setPhaseName(e.target.value)} data-testid="input-phase-name" />
                <Textarea placeholder="Description (optional)" value={phaseDesc} onChange={(e) => setPhaseDesc(e.target.value)} data-testid="input-phase-desc" />
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PHASE_COLORS.map((c) => (
                      <button
                        key={c}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${phaseColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setPhaseColor(c)}
                        data-testid={`color-${c}`}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreatePhase} disabled={createPhase.isPending} className="w-full" data-testid="button-submit-phase">
                  {createPhase.isPending ? "Creating..." : "Create Phase"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget overview — stacks to single col on mobile */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card data-testid="card-total-budget">
          <CardContent className="pt-3 md:pt-6 px-3 md:px-6 pb-3 md:pb-6">
            <p className="text-[10px] md:text-sm text-muted-foreground">Estimated</p>
            <p className="text-lg md:text-2xl font-bold mt-0.5">${totalEstimated.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-spent">
          <CardContent className="pt-3 md:pt-6 px-3 md:px-6 pb-3 md:pb-6">
            <p className="text-[10px] md:text-sm text-muted-foreground">Spent</p>
            <p className="text-lg md:text-2xl font-bold mt-0.5">${totalSpent.toLocaleString()}</p>
            {totalEstimated > 0 && (
              <Progress value={Math.min((totalSpent / totalEstimated) * 100, 100)} className="h-1 md:h-1.5 mt-1.5" />
            )}
          </CardContent>
        </Card>
        <Card data-testid="card-remaining">
          <CardContent className="pt-3 md:pt-6 px-3 md:px-6 pb-3 md:pb-6">
            <p className="text-[10px] md:text-sm text-muted-foreground">Remaining</p>
            <p className={`text-lg md:text-2xl font-bold mt-0.5 ${totalEstimated - totalSpent < 0 ? "text-red-400" : ""}`}>
              ${(totalEstimated - totalSpent).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost breakdown by category */}
      {Object.keys(costByCategory).length > 0 && (
        <Card data-testid="card-cost-breakdown">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <div className="space-y-2.5 md:space-y-3">
              {Object.entries(costByCategory)
                .sort(([, a], [, b]) => b.estimated - a.estimated)
                .map(([cat, data]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm capitalize">{cat}</span>
                      <span className="text-[10px] md:text-xs text-muted-foreground">
                        ${data.spent.toLocaleString()} / ${data.estimated.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={data.estimated > 0 ? Math.min((data.spent / data.estimated) * 100, 100) : 0} className="h-1" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground">Project Phases</h3>
        {sortedPhases.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No phases defined yet. Create your first phase to start planning.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3 md:left-5 top-0 bottom-0 w-px bg-border" />

            {sortedPhases.map((phase) => {
              const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);
              const completed = phaseTasks.filter((t) => t.status === "completed").length;
              const pct = phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0;
              const phaseEstimated = phaseTasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

              return (
                <div key={phase.id} className="relative pl-8 md:pl-12 pb-4 md:pb-6" data-testid={`timeline-phase-${phase.id}`}>
                  {/* Dot */}
                  <div
                    className="absolute left-1.5 md:left-3.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-background"
                    style={{ backgroundColor: phase.color, top: "4px" }}
                  />

                  <Card>
                    <CardContent className="py-3 px-3 md:py-4 md:px-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs md:text-sm font-semibold">{phase.name}</h4>
                            <Badge
                              variant={
                                phase.status === "completed"
                                  ? "default"
                                  : phase.status === "in_progress"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-[10px] md:text-xs capitalize"
                            >
                              {phase.status.replace("_", " ")}
                            </Badge>
                          </div>
                          {phase.description && (
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 line-clamp-2">{phase.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Select
                            value={phase.status}
                            onValueChange={(val) => updatePhase.mutate({ id: phase.id, status: val })}
                          >
                            <SelectTrigger className="h-6 w-auto text-[10px] md:text-xs px-1.5" data-testid={`select-phase-status-${phase.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => deletePhase.mutate(phase.id)}
                            data-testid={`button-delete-phase-${phase.id}`}
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] md:text-xs text-muted-foreground">{completed}/{phaseTasks.length} tasks</span>
                        {phaseEstimated > 0 && (
                          <span className="text-[10px] md:text-xs text-muted-foreground">Est. ${phaseEstimated.toLocaleString()}</span>
                        )}
                      </div>
                      {phaseTasks.length > 0 && (
                        <Progress value={pct} className="h-1 mt-1.5" />
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense log */}
      {expenses.length > 0 && (
        <Card data-testid="card-expense-log">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Expense Log</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <div className="space-y-1.5 md:space-y-2">
              {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((exp) => (
                <div key={exp.id} className="flex items-start justify-between py-1.5 md:py-2 border-b border-border last:border-0 group gap-2" data-testid={`expense-row-${exp.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate">{exp.description}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] md:text-xs text-muted-foreground">{exp.date}</span>
                      {exp.vendor && <span className="text-[10px] md:text-xs text-muted-foreground">· {exp.vendor}</span>}
                      <Badge variant="outline" className="text-[10px] capitalize h-4 px-1">{exp.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs md:text-sm font-semibold">${exp.amount.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:opacity-0 md:group-hover:opacity-100 h-6 w-6 p-0"
                      onClick={() => deleteExpense.mutate(exp.id)}
                      data-testid={`button-delete-expense-${exp.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
