import { createContext, useContext, type ReactNode } from "react";

const IntroContext = createContext<{ ready: boolean }>({ ready: true });

export const IntroProvider = ({ ready, children }: { ready: boolean; children: ReactNode }) => (
  <IntroContext.Provider value={{ ready }}>{children}</IntroContext.Provider>
);

export const useIntroReady = () => useContext(IntroContext).ready;
