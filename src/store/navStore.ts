import { createContext, useContext } from "react";

export type NavContextValue = {
  openOrder: (orderId: string) => void;
};

export const NavContext = createContext<NavContextValue>({
  openOrder: () => {},
});

export const useNav = () => useContext(NavContext);
