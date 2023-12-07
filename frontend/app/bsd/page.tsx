"use client";
import ListBsd from "@/components/Bsd/ListBsd";
import { RoleContext } from "@/contexts/RoleProvider";
import { Box, Button, Flex } from "@chakra-ui/react";
import NextLink from "next/link";
import { useContext } from "react";

export default function Bsd() {
  const role = useContext(RoleContext);

  return (
    <Flex direction={"column"} gap={5}>
      {role === "producer" && (
        <Box margin={"auto"}>
          <Button as={NextLink} href="/bsd/add">
            Créer un BSD
          </Button>
        </Box>
      )}
      <Box>
        <ListBsd />
      </Box>
    </Flex>
  );
}
