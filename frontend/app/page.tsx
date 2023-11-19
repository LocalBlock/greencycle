"use client";
import Hero from "@/components/Hero";
import Presentation from "@/components/Presentation";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
} from "@chakra-ui/react";

import { useNetwork } from "wagmi";

export default function Home() {

  const { chain } = useNetwork();

  return (
    <Box as="main">
      {chain?.unsupported && (
        <Alert status="error" justifyContent={"center"}>
          <AlertIcon />
          <AlertTitle>Mauvais network</AlertTitle>Cette application est
          opérationnel uniquement sur le réseau TestNet de polygon (Mumbai)
          <br />
          Veuillez changer le network sur votre wallet.
        </Alert>
      )}
      <Hero />
      <Presentation />
    </Box>
  );
}
