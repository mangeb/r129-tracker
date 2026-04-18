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
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Check } from "lucide-react";
import type { Task, Phase } from "@shared/schema";

const CATEGORIES = ["engine", "suspension", "brakes", "electrical", "interior", "exterior", "transmission", "cooling", "misc"];
const STATUSES = ["todo", "in_progress", "blocked", "completed"];
const PRIORITIES = ["low", "medium", "high", "critical"];

function statusColor(s: string) {
  switch (s) {
    case "completed": return "default";
    case "in_progress": return "default";
    case "blocked": return "destructive";
    default: return "secondary";
  }
}

function priorityColor(p: string) {
  switch (p) {
    case "critical": return "text-red-400";
    case "high": return "text-orange-400";
    case "medium": return "text-yellow-400";
    default: return "text-muted-foreground";
  }
}

export default function TasksPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phaseId, setPhaseId] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");

  const { data: tasks = [], isLoading } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: phases = [] } = useQuery<Phase[]>({ queryKey: ["/api/phases"] });

  const createTask = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Task created" });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Task deleted" });
    },
  });

  function resetForm() {
    setTitle(""); setDescription(""); setPhaseId(""); setStatus("todo");
    setPriority("medium"); setCategory(""); setEstimatedCost(""); setNotes("");
  }

  function handleCreate() {
    if (!title || !phaseId) {
      toast({ title: "Title and phase are required", variant: "destructive" });
      return;
    }
    createTask.mutate({
      title,
      description: description || null,
      phaseId: Number(phaseId),
      status,
      priority,
      category: category || null,
      estimatedCost: estimatedCost ? Number(estimatedCost) : null,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    });
  }

  const filtered = tasks.filter((t) => {
    if (filterPhase !== "all" && t.phaseId !== Number(filterPhase)) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-4 md:space-y-6" data-testid="tasks-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight" data-testid="text-page-title">Tasks</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {tasks.length} total · {tasks.filter((t) => t.status === "completed").length} completed
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-task">
              <Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Add Task</span><span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-task-title" />
              <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} data-testid="input-task-description" />
              <div className="grid grid-cols-2 gap-3">
                <Select value={phaseId} onValueChange={setPhaseId}>
                  <SelectTrigger data-testid="select-task-phase"><SelectValue placeholder="Phase" /></SelectTrigger>
                  <SelectContent>
                    {phases.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-task-category"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger data-testid="select-task-priority"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Est. cost ($)"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  data-testid="input-task-cost"
                />
              </div>
              <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-task-notes" />
              <Button onClick={handleCreate} disabled={createTask.isPending} className="w-full" data-testid="button-submit-task">
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters — horizontal scroll on mobile */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        <Select value={filterPhase} onValueChange={setFilterPhase}>
          <SelectTrigger className="w-[130px] md:w-[160px] shrink-0 text-xs md:text-sm" data-testid="filter-phase"><SelectValue placeholder="All Phases" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {phases.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px] md:w-[140px] shrink-0 text-xs md:text-sm" data-testid="filter-status"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[130px] md:w-[150px] shrink-0 text-xs md:text-sm" data-testid="filter-category"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              {tasks.length === 0
                ? "No tasks yet. Add your first task to begin tracking your build."
                : "No tasks match the current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const phase = phases.find((p) => p.id === task.phaseId);
            return (
              <Card key={task.id} className="group" data-testid={`task-card-${task.id}`}>
                <CardContent className="py-3 px-3 md:px-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    {/* Quick toggle complete */}
                    <button
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        task.status === "completed"
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40 hover:border-primary"
                      }`}
                      onClick={() =>
                        updateTask.mutate({
                          id: task.id,
                          status: task.status === "completed" ? "todo" : "completed",
                          completedAt: task.status === "completed" ? null : new Date().toISOString(),
                        })
                      }
                      data-testid={`button-toggle-${task.id}`}
                    >
                      {task.status === "completed" && <Check className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-medium leading-tight ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </span>
                            <span className={`text-xs font-medium shrink-0 ${priorityColor(task.priority)}`}>
                              {task.priority === "critical" ? "!!!" : task.priority === "high" ? "!!" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {phase && (
                              <span className="text-[11px] text-muted-foreground">{phase.name}</span>
                            )}
                            {task.category && (
                              <Badge variant="outline" className="text-[10px] capitalize h-4 px-1">{task.category}</Badge>
                            )}
                            {task.estimatedCost != null && (
                              <span className="text-[11px] text-muted-foreground md:hidden">${task.estimatedCost.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {task.estimatedCost != null && (
                            <span className="text-xs text-muted-foreground hidden md:inline">${task.estimatedCost.toLocaleString()}</span>
                          )}
                          <Badge variant={statusColor(task.status)} className="text-[10px] md:text-xs capitalize">
                            {task.status.replace("_", " ")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="md:opacity-0 md:group-hover:opacity-100 h-7 w-7 p-0 shrink-0"
                            onClick={() => deleteTask.mutate(task.id)}
                            data-testid={`button-delete-${task.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
