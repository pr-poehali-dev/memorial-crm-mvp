import { createContext, useContext } from "react";
import { Place, Employee, BlankType } from "@/components/pages/cutting/cutting.types";

export type CuttingRefs = {
  places:     Place[];
  employees:  Employee[];
  blankTypes: BlankType[];
};

export const CuttingRefContext = createContext<CuttingRefs>({
  places:     [],
  employees:  [],
  blankTypes: [],
});

export const useCuttingRefs = () => useContext(CuttingRefContext);
