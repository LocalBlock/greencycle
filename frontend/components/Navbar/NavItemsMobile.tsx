import { Box, Flex, Link } from "@chakra-ui/react";
import NextLink from 'next/link'

export default function NavItemsMobile({onClose}:{onClose:()=>void}) {
  return (
    <Flex gap={5} direction={"column"}>
      <Link as={NextLink} href="/" scroll={false} onClick={onClose}>Home</Link>
      <Link as={NextLink} href="/page1" scroll={false} onClick={onClose}>Page1</Link>
      <Link as={NextLink} href="/page2" scroll={false} onClick={onClose}>Page2</Link>
    </Flex>
  );
}
