import { createContext, useContext } from "react";

const NavbarVisibilityContext = createContext({ visible: true, headerHeight: 0 });

export const NavbarVisibilityProvider = NavbarVisibilityContext.Provider;

export const useNavbarVisibility = () => useContext(NavbarVisibilityContext);
