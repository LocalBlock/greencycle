import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import PresentationIcon from "./PresentationIcon";
import { IconType } from "react-icons";

export default function PresentationItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: IconType;
}) {
  return (
    <Box>
      <Flex alignItems={"center"} mb={1}>
        <PresentationIcon icon={icon} />
        <Heading as={"h3"} size={"md"} ml={3} color={"blue.400"}>
          {title}
        </Heading>
      </Flex>

      <Text>{description}</Text>
    </Box>
  );
}
