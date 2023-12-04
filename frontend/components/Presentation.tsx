import { Box, Container, Grid, GridItem } from "@chakra-ui/react";
import {
  FaTruck,
  FaHandHoldingDollar,
  FaPersonMilitaryPointing,
} from "react-icons/fa6";
import PresentationItem from "./PresentationItem";
import { FaEthereum } from "react-icons/fa";
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
              description="Suivez votre déchet jusqu'a son traitement. Ne perdez pas de temps avec des documents administratifs. GreenCycle le fait pour vous, et assure la traçabilité grâce à la blockchain et à la solution de stockage décentralisée IPFS."
              icon={GiNuclearWaste}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Transporteur"
              description="Consultez les déchets prêt à être transportés. Vous avez accès à l'ensemble des transports déjà effectués."
              icon={FaTruck}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Centre de traitement"
              description="Suivez les déchets des producteurs, qui vous sont destinés. Vous avez accès à toutes les informations qui vous sont nécessaires avant même d'avoir recu le déchet"
              icon={MdFactory}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="GRC Token (ERC20)"
              description="Le token de GreenCycle, assurant l'économie du projet."
              icon={FaEthereum}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Récompenses"
              description="Que vous soyez un producteur, un transporteur, ou un centre de traitement, vous gagnez des GRC token pour chaque déchets traités."
              icon={FaHandHoldingDollar}
            />
          </GridItem>
          <GridItem>
            <PresentationItem
              title="Pénalités"
              description='En cas de non respect des régles, vous pouvez perdre des GRC, ils sont "brulés" et perdus à jamais.'
              icon={FaPersonMilitaryPointing}
            />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
