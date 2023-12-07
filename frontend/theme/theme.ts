// 1. Import the extendTheme function
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// 2. Extend the theme to include custom colors, fonts, etc
// Base color #43b753 https://smart-swatch.netlify.app/#43b753
const colors = {
  brand: {
    50: "#e4fbe8",
    100: "#c3ebc9",
    200: "#a0dea8",
    300: "#7bcf87",
    400: "#57c166",
    500: "#3ea84c",
    600: "#2e833a",
    700: "#1f5d28",
    800: "#103916",
    900: "#001500",
  },
  components: {
    50: "#f6fbf4",
    100: "#e4f2dc",
    200: "#d0e8c3",
    300: "#bbdda6",
    400: "#a2d187",
    500: "#86c362",
    600: "#6bb141",
    700: "#5b9838",
    800: "#48782c",
    900: "#2a461a",
  },
};

const semanticTokens = {
  colors: {
    "chakra-body-bg": { _light: "brand.50", _dark: "gray.800" },
    presentation: {
      background: { _light: "brand.100", _dark: "brand.600" },
      icon: { _light: "cyan.600", _dark: "cyan.200" },
      iconBackground: { _light: "brand.200", _dark: "brand.700" },
    },
  },
};

const components = {
  Button: {
    defaultProps: {
      colorScheme: "components",
    },
  },
};

// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  components,
});
