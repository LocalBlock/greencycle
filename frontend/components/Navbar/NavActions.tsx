import {
    IconButton,
    Flex,
    useColorMode,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerBody,
    DrawerHeader,
    DrawerFooter,
  } from "@chakra-ui/react";
  import { FaSun, FaMoon, FaBars } from "react-icons/fa6";
  import NavItemsMobile from "./NavItemsMobile";
  import WalletManager from "./WalletManager";
  
  export default function NavActions() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
      <Flex gap={2} flex={{base:"inherit",md:"1"}} justifyContent={"end"}>
        <WalletManager />
  
        <IconButton
          display={{ base: "none", md: "inherit" }}
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          aria-label="toogle darkmode"
        />
        {/* Hamburger menu in mobile */}
        <IconButton
          icon={<FaBars />}
          aria-label="Menu"
          display={{ base: "inherit", md: "none" }}
          onClick={onOpen}
        />
        <Drawer isOpen={isOpen} placement="top" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>GreenCycle</DrawerHeader>
            <DrawerBody>
              <NavItemsMobile onClose={onClose} />
            </DrawerBody>
            <DrawerFooter>
              <IconButton
                icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                aria-label="dark mode"
              />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Flex>
    );
  }
  
