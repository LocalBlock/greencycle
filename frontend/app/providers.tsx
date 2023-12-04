"use client";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { theme } from "@/theme/theme";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "./wagmiConfig";
import { useState, useEffect } from "react";
import RoleProvider from "@/contexts/RoleProvider";
import ConstantsProvider from "@/contexts/ConstantsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <CacheProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <RoleProvider>
            <ConstantsProvider>{mounted && children}</ConstantsProvider>
          </RoleProvider>
        </WagmiConfig>
      </ChakraProvider>
    </CacheProvider>
  );
}
