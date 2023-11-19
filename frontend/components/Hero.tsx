import {
  Box,
  Flex,
  Heading,
  Text,
  Link,
  Button,
  Container,
} from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";

export default function Hero() {
  return (
    <Box as="section">
      <Container maxWidth={"container.xl"}>
        <Flex
          justifyContent={"space-between"}
          alignItems={"center"}
          height={"70vh"}
          gap={2}
          direction={{ base: "column", md: "row" }}
        >
          <Flex width={"100%"} direction={"column"} gap={3} paddingTop={5}>
            <Heading
              as={"h1"}
              size={{ base: "sm", md: "xl" }}
              bgGradient="linear(to-r, #a0dea8, #103916)"
              bgClip="text"
            >
              Bienvenue sur l’innovation du Recycle To Earn
            </Heading>
            <Text fontSize={{ base: "sm", md: "lg" }}>
              Ce projet a pour but d&apos;améliorer la traçabilité des déchets
              au travers de la technologie blockchain tout en intégrant la
              réglementation environnementale en vigueur. Notre solution tend à
              impliquer l&apos;ensemble des acteurs du déchet, de son producteur
              au centre de traitement final, à respecter leur devoir
              réglementaire qui sera programmé au travers de smart contract tout
              en développant par ailleurs un système de reward pour les
              récompenser de leur action pour l&apos;environnement, un des
              enjeux majeurs de notre siècle.
            </Text>
            <Button as={NextLink} href="/" w={"fit-content"}>
              En savoir plus
            </Button>
          </Flex>
          <Box
            backgroundImage={"hero.png"}
            backgroundSize={"contain"}
            backgroundPosition={"right"}
            backgroundRepeat={"no-repeat"}
            width={"100%"}
            height={"100%"}
          ></Box>
        </Flex>
      </Container>
    </Box>
  );
}
