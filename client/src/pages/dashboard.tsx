import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import {
  ListChecks,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import type { Task, Part, Phase } from "@shared/schema";

export default function Dashboard() {
  const { data: stats } = useQuery<{
    totalTasks: number;
    completedTasks: number;
    totalBudget: number;
    totalSpent: number;
    partsNeeded: number;
    partsReceived: number;
  }>({ queryKey: ["/api/dashboard"] });

  const { data: phases } = useQuery<Phase[]>({ queryKey: ["/api/phases"] });
  const { data: tasks } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: parts } = useQuery<Part[]>({ queryKey: ["/api/parts"] });

  const taskProgress = stats ? (stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0) : 0;

  const recentTasks = (tasks || [])
    .filter((t) => t.status !== "completed")
    .slice(0, 5);

  const urgentParts = (parts || [])
    .filter((p) => p.status === "needed")
    .slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6" data-testid="dashboard-page">
      <div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight" data-testid="text-page-title">
          Project Dashboard
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          1994 Mercedes-Benz SL500 R129 Restomod
        </p>
      </div>

      {/* Stats Cards — 2x2 grid on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" data-testid="stats-grid">
        <Card data-testid="card-tasks-progress">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 px-3 md:px-6 pt-3 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Tasks</CardTitle>
            <ListChecks className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <div className="text-xl md:text-2xl font-bold">
              {stats?.completedTasks || 0}/{stats?.totalTasks || 0}
            </div>
            <Progress value={taskProgress} className="mt-2 h-1.5" />
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{taskProgress}% complete</p>
          </CardContent>
        </Card>

        <Card data-testid="card-budget">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 px-3 md:px-6 pt-3 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Budget</CardTitle>
            <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <div className="text-xl md:text-2xl font-bold">
              ${(stats?.totalBudget || 0).toLocaleString()}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Estimated total</p>
          </CardContent>
        </Card>

        <Card data-testid="card-spent">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 px-3 md:px-6 pt-3 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Spent</CardTitle>
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <div className="text-xl md:text-2xl font-bold">
              ${(stats?.totalSpent || 0).toLocaleString()}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {stats && stats.totalBudget > 0
                ? `${Math.round((stats.totalSpent / stats.totalBudget) * 100)}% of budget`
                : "No budget set"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-parts">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 px-3 md:px-6 pt-3 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Parts</CardTitle>
            <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <div className="text-xl md:text-2xl font-bold">
              {stats?.partsReceived || 0}/{(stats?.partsNeeded || 0) + (stats?.partsReceived || 0)}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">received / total</p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Active Tasks */}
        <Card data-testid="card-active-tasks">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            {recentTasks.length === 0 ? (
              <p className="text-xs md:text-sm text-muted-foreground">No active tasks. Add tasks to get started.</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between py-1.5 md:py-2 border-b border-border last:border-0 gap-2"
                    data-testid={`task-row-${task.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{task.title}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground capitalize">{task.category || "Uncategorized"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {task.estimatedCost && (
                        <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">
                          ${task.estimatedCost.toLocaleString()}
                        </span>
                      )}
                      <Badge
                        variant={
                          task.status === "in_progress"
                            ? "default"
                            : task.status === "blocked"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] md:text-xs"
                        data-testid={`badge-status-${task.id}`}
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parts Needed */}
        <Card data-testid="card-parts-needed">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Parts Needed</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            {urgentParts.length === 0 ? (
              <p className="text-xs md:text-sm text-muted-foreground">No parts needed. Add parts to your shopping list.</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {urgentParts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-start justify-between py-1.5 md:py-2 border-b border-border last:border-0 gap-2"
                    data-testid={`part-row-${part.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{part.name}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{part.vendor || "No vendor"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {part.estimatedPrice && (
                        <span className="text-[10px] md:text-xs text-muted-foreground">
                          ${part.estimatedPrice.toLocaleString()}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px] md:text-xs capitalize">
                        {part.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phase Overview */}
      {phases && phases.length > 0 && (
        <Card data-testid="card-phases-overview">
          <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Project Phases</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
            <div className="space-y-3">
              {phases.sort((a, b) => a.order - b.order).map((phase) => {
                const phaseTasks = (tasks || []).filter((t) => t.phaseId === phase.id);
                const completed = phaseTasks.filter((t) => t.status === "completed").length;
                const pct = phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0;
                return (
                  <div key={phase.id} className="space-y-1" data-testid={`phase-row-${phase.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span className="text-xs md:text-sm font-medium truncate">{phase.name}</span>
                      </div>
                      <span className="text-[10px] md:text-xs text-muted-foreground shrink-0 ml-2">
                        {completed}/{phaseTasks.length}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
