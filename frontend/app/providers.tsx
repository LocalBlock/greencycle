"use client";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { theme } from "@/theme/theme";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "./wagmiConfig";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <CacheProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>{mounted && children}</WagmiConfig>
      </ChakraProvider>
    </CacheProvider>
  );
}
