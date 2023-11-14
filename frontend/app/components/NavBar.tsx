"use client";
import { Flex, IconButton, useColorMode } from "@chakra-ui/react";
import React from "react";
import { FaSun, FaMoon } from "react-icons/fa6";

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
      <Flex justifyContent={"end"} p={"1rem"}>
        <IconButton
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          aria-label="Toggle color mode"
        />
      </Flex>
  );
}
