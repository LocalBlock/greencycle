"use client";
import { Flex, Icon, Text } from "@chakra-ui/react";

import { FaHeart } from "react-icons/fa6";

export default function Footer() {
  return (
    <Flex
      as={"footer"}
      py={5}
      position={"fixed"}
      bottom={0}
      left={"50%"}
      transform={"translateX(-50%)"}
      alignItems={"center"}
      width={"max-content"}
    >
      <Text>A project from Finney promotion Alyra school made with&nbsp;</Text>
      <Icon mt={1} color={"red"} as={FaHeart} />
    </Flex>
  );
}
