import { createContext, useContext } from "react";
import { CuttingTask } from "@/components/pages/cutting/cutting.types";

/* ─── Демо-задачи для старта ─── */
export const initTasks: CuttingTask[] = [
  {
    id: "t1",
    blankTypeId: "bt1",
    materialName: "Гранит чёрный",
    totalQty: 10,
    doneQty: 4,
    inProgressQty: 0,
    status: "active",
    createdAt: "28.04.2026",
    deadline: "05.05.2026",
  },
  {
    id: "t2",
    blankTypeId: "bt2",
    materialName: "Гранит серый",
    totalQty: 6,
    doneQty: 0,
    inProgressQty: 0,
    status: "pending",
    createdAt: "29.04.2026",
  },
];

/* ─── patch может быть объектом или функцией (updater) ─── */
export type TaskUpdater = Partial<CuttingTask> | ((prev: CuttingTask) => Partial<CuttingTask>);

/* ─── Тип контекста ─── */
export type TasksContextValue = {
  tasks: CuttingTask[];
  addTask: (t: CuttingTask) => void;
  updateTask: (id: string, updater: TaskUpdater) => void;
};

export const TasksContext = createContext<TasksContextValue>({
  tasks: initTasks,
  addTask: () => {},
  updateTask: () => {},
});

export const useTasks = () => useContext(TasksContext);
