import { Box, Container, Grid, GridItem } from "@chakra-ui/react";
import {
  FaTruck ,
  FaTruckMonster,
  FaTowerBroadcast,
} from "react-icons/fa6";
import PresentationItem from "./PresentationItem";
import { GiNuclearWaste } from "react-icons/gi";
import { MdFactory } from "react-icons/md";

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
              title="Producteur de déchets"
              description="Vous pouvez suivre votre déchet jusqu'a son traitement. Ne perdez pas de temps en paperasse, GreenCycle le fait pour vous."
              icon={GiNuclearWaste}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Transporteur"
              description="Vous pouvez consultez les déchets prêt à être transporter."
              icon={FaTruck}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Centre de traitement"
              description="Suivez les déchets des producteurs, qui vous sont destinés"
              icon={MdFactory}
            />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
