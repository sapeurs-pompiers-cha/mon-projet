import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { Sidebar } from "./components/Sidebar";

// Pages
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import AgentDetails from "./pages/AgentDetails";
import Trainings from "./pages/Trainings";
import TrainingEntry from "./pages/TrainingEntry";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto pb-20">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/agents" component={Agents} />
            <Route path="/agents/:id" component={AgentDetails} />
            <Route path="/trainings" component={Trainings} />
            <Route path="/training-entry" component={TrainingEntry} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
