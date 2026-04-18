import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/app-layout";
import Dashboard from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import PartsPage from "@/pages/parts";
import TimelinePage from "@/pages/timeline";
import KnowledgePage from "@/pages/knowledge";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/parts" component={PartsPage} />
        <Route path="/timeline" component={TimelinePage} />
        <Route path="/knowledge" component={KnowledgePage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <AppRouter />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
