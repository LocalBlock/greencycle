"use client";
import { RoleContext } from "@/contexts/role-provider";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
} from "@chakra-ui/react";
import { useContext } from "react";
import { useAccount } from "wagmi";

export default function BsdLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();
  const role = useContext(RoleContext);
  return (
    <Box>
      {isConnected ? (
        <Flex direction={"column"} mt={"2rem"}>
          {!role ? (
            <Alert
              status="warning"
              justifyContent={"center"}
              flexDirection={"column"}
            >
              <Flex>
                <AlertIcon />
                <AlertTitle>Inconnu</AlertTitle>
              </Flex>
              <AlertDescription>
                Cette adresse est inconnue de GreenCycle 😢
              </AlertDescription>
            </Alert>
          ) : (
            children
          )}
        </Flex>
      ) : (
        <Alert
          status="error"
          justifyContent={"center"}
          flexDirection={"column"}
        >
          <Flex>
            <AlertIcon />
            <AlertTitle>Non connecté</AlertTitle>
          </Flex>
          <AlertDescription>
            Connecter votre wallet pour interagir avec cette application
          </AlertDescription>
        </Alert>
      )}
    </Box>
  );
}
