import { createContext, useContext } from "react";
export const NavCtx = createContext({ page: "dashboard", params: {}, nav: () => {} });
export const useNav = () => useContext(NavCtx);
