"use client";
import {
  Box,
  Flex,
  Heading,
  Image,
  Progress,
} from "@chakra-ui/react";

import Countdown from "./components/Countdown";
import { Varela_Round } from "next/font/google";
const varela = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {

  return (
    <Box
      top={"50%"}
      left={"50%"}
      position={"fixed"}
      transform={"translate(-50%,-50%)"}
      textAlign={"center"}
    >
      <Image
        src="logo.png"
        alt="GreenCycle"
        boxSize={"200px"}
        margin={"auto"}
      />
      <Heading
        as={"h1"}
        fontFamily={varela.style.fontFamily}
        bgGradient={"linear(to-r, #a0dea8, #103916)"}
        bgClip={"text"}
        fontSize={"5xl"}
      >
        GreenCycle
      </Heading>
      <Flex direction={"column"} gap={3}>
        <Heading as={"h2"} size={"md"}>
          The first recycle to earn
        </Heading>
        <Countdown targetDate="December 8, 2023 23:59:59" />
        <Progress size="xs" colorScheme="brand" isIndeterminate />
        <Box>

        </Box>
      </Flex>
    </Box>
  );
}
