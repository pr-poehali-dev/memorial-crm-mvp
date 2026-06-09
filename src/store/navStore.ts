import { createContext, useContext } from "react";

export type NavContextValue = {
  openOrder: (orderId: string) => void;
  openCuttingTask: (taskId: string) => void;
};

export const NavContext = createContext<NavContextValue>({
  openOrder: () => {},
  openCuttingTask: () => {},
});

export const useNav = () => useContext(NavContext);
