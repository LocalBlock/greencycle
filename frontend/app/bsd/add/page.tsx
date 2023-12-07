"use client";

import CreateBSD from "@/components/Bsd/CreateBSD";
import { RoleContext } from "@/contexts/RoleProvider";

import { Box, Text } from "@chakra-ui/react";
import { useContext } from "react";


export default function Page() {

  const role = useContext(RoleContext)

  return (
    <Box maxWidth={"800px"} margin={"auto"}>
      {role ? (
        role === "producer" ? (
          <CreateBSD />
        ) : (
          <Text>Role différent de poducer</Text>
        )
      ) : (
        <Text>Role undéfini</Text>
      )}
    </Box>
  );
}
