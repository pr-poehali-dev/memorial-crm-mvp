import { createContext, useContext } from "react";
import { CuttingTask } from "@/components/pages/cutting/cutting.types";

export type TaskUpdater = Partial<CuttingTask> | ((prev: CuttingTask) => Partial<CuttingTask>);

export type TasksContextValue = {
  tasks: CuttingTask[];
  setTasks: (tasks: CuttingTask[]) => void;
  addTask: (t: CuttingTask) => void;
  updateTask: (id: string, updater: TaskUpdater) => void;
};

export const TasksContext = createContext<TasksContextValue>({
  tasks: [],
  setTasks: () => {},
  addTask: () => {},
  updateTask: () => {},
});

export const useTasks = () => useContext(TasksContext);
