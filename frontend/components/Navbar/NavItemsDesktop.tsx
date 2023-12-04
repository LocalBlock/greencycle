import { Box, Flex, Link } from "@chakra-ui/react";
import NextLink from 'next/link'

export default function NavItemsDesktop() {
  return (
    <Flex as={"nav"} gap={8} display={{base:"none",md:"inherit"}}>
      <Link as={NextLink} href="/" scroll={false}>Home</Link>
      <Link as={NextLink} href="/bsd" scroll={false}>BSD</Link>
      <Link as={NextLink} href="/infos" scroll={false}>Infos</Link>
      {/* <Link as={NextLink} href="/page3" scroll={false}>Page3</Link> */}
    </Flex>
  );
}
