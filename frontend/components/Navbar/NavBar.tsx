"use client";
import { Flex, Heading } from "@chakra-ui/react";
import  Image from 'next/image'
import React, { useEffect, useState } from "react";
import { Varela_Round } from "next/font/google";
import NavItemsDesktop from "./NavItemsDesktop";
import NavActions from "./NavActions";
const varela = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    // Attacher l'événement de défilement à la fenêtre
    window.addEventListener("scroll", handleScroll);
    // Détacher l'événement de défilement lorsque le composant est démonté
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <Flex
      as={"header"}
      width={"100%"}
      position={"sticky"}
      top={0}
      zIndex={"sticky"}
      justifyContent={"space-between"}
      p={"0.8rem"}
      alignItems={"center"}
      boxShadow={scrolled ? "0 3px 4px rgba(0, 0, 0, 0.2)" : "none"}
      transition="box-shadow 0.3s"
      bgGradient={"linear(to-r, #c3ebc9, #3ea84c)"}
    >
      <Flex alignItems={"center"} gap={2} flex={1}>
        <Image src="/logo.png" alt="GreenCycle" width={50} height={50} />
        <Heading
          as={"h1"}
          fontFamily={varela.style.fontFamily}
          bgGradient={"linear(to-r, #a0dea8, #103916)"}
          bgClip={"text"}
          fontSize={{ base: "sm", md: "2xl" }}
        >
          GreenCycle
        </Heading>
      </Flex>
      <NavItemsDesktop />
      <NavActions />
    </Flex>
  );
}
