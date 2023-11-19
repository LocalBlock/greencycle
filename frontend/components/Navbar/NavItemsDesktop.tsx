import { Box, Flex, Link } from "@chakra-ui/react";
import NextLink from 'next/link'

export default function NavItemsDesktop() {
  return (
    <Flex as={"nav"} gap={8} display={{base:"none",md:"inherit"}}>
      <Link as={NextLink} href="/" scroll={false}>Home</Link>
      <Link as={NextLink} href="/page1" scroll={false}>Page1</Link>
      <Link as={NextLink} href="/page2" scroll={false}>Page2</Link>
      <Link as={NextLink} href="/page3" scroll={false}>Page3</Link>
      <Link as={NextLink} href="/page4" scroll={false}>Page4</Link>
    </Flex>
  );
}
