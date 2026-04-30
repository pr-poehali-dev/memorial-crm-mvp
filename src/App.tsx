
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TasksContext, initTasks, TaskUpdater } from "./store/tasksStore";
import { CuttingTask } from "./components/pages/cutting/cutting.types";

const queryClient = new QueryClient();

const App = () => {
  const [tasks, setTasks] = useState<CuttingTask[]>(initTasks);

  const addTask = (t: CuttingTask) => setTasks(prev => [t, ...prev]);
  const updateTask = (id: string, updater: TaskUpdater) =>
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const patch = typeof updater === "function" ? updater(t) : updater;
      return { ...t, ...patch };
    }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TasksContext.Provider value={{ tasks, addTask, updateTask }}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TasksContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;