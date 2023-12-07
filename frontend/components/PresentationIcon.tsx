import { Flex, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";

export default function PresentationIcon({ icon }: { icon: IconType }) {
  return (
    <Flex
      bgColor={"presentation.iconBackground"}
      borderRadius={10}
      width={"min"}
      padding={3}
    >
      <Icon as={icon} boxSize={10} color={"presentation.icon"} />
    </Flex>
  );
}
