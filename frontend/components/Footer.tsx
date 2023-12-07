"use client";
import { Flex, Icon, Text } from "@chakra-ui/react";

import { FaHeart } from "react-icons/fa6";

export default function Footer() {
  return (
    <Flex
      as={"footer"}
      py={5}
      width={"100%"}
      justifyContent={"center"}
    >
      <Text>Un projet de la promotion Finney de l&apos;école blockchain Alyra fait avec&nbsp;</Text>
      <Icon mt={1} color={"red"} as={FaHeart} />
    </Flex>
  );
}
