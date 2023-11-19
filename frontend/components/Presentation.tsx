import { Box, Center, Container, Grid, GridItem } from "@chakra-ui/react";
import {
  FaHandHoldingHeart,
  FaOilWell,
  FaTruckMonster,
  FaTowerBroadcast,
} from "react-icons/fa6";
import PresentationItem from "./PresentationItem";

export default function Presentation() {
  return (
    <Box as={"section"} bgColor={"presentation.background"}>
      <Container maxWidth={"container.xl"} py={"2rem"}>
        <Grid
          templateColumns={{ base: "repeat(1,1fr)", md: "repeat(3,1fr)" }}
          gap={6}
        >
          <GridItem>
            <PresentationItem
              title="Title presentation 1"
              description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Soluta unde
          fuga et quae doloribus harum ad, esse asperiores laborum fugiat
          provident voluptatem temporibus pariatur repellat autem debitis
          voluptatum ipsum earum."
              icon={FaHandHoldingHeart}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Title presentation 2 mais bien plus longue"
              description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Soluta unde
          fuga et quae doloribus harum ad, esse asperiores laborum fugiat
          provident voluptatem temporibus pariatur repellat autem debitis
          voluptatum ipsum earum."
              icon={FaOilWell}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Title presentation 3"
              description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Soluta unde
          fuga et quae doloribus harum ad, esse asperiores laborum fugiat
          provident voluptatem temporibus pariatur repellat autem debitis
          voluptatum ipsum earum."
              icon={FaTruckMonster}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Title presentation 4"
              description="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Soluta unde
          fuga et quae doloribus harum ad, esse asperiores laborum fugiat
          provident voluptatem temporibus pariatur repellat autem debitis
          voluptatum ipsum earum."
              icon={FaTowerBroadcast}
            />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
