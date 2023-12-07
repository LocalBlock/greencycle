import { Box, Flex, Heading } from "@chakra-ui/react";
import React from "react";

export default function Video() {
  return (
    <Flex direction={"column"} alignItems={"center"} gap={10} mt={5}>
      <Heading>Présentation du projet</Heading>
        <video src="https://cdn.localblock.dev/testVideo.mp4" controls>
          le fichier videos ne peux etre lu
        </video>
    </Flex>
  );
}
