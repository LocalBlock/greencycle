import type { Metadata } from "next";
import { Providers } from "./providers";
import NavBar from "@/components/Navbar/NavBar";
import Footer from "@/components/Footer";
import { Box } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "GreenCycle",
  description: "Recycle to earn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        suppressHydrationWarning={true}
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Providers>
          <NavBar />
          <Box as="main" flex={1}>
            {children}
          </Box>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
