import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Text,
  Heading,
} from "@chakra-ui/react";

import defaultUsersDev from "@/data/defaultUsersDev.json";
import defaultUsersProd from "@/data/defaultUsersProd.json";
import { useState } from "react";
import { Recipient } from "@/types/types";

const allRecipient = (
  process.env.NODE_ENV === "development"
    ? defaultUsersDev.recipients
    : defaultUsersProd.recipients
) as Recipient[];

export default function RecepientForm({
  setRecipient,
}: {
  setRecipient: (recipient: (typeof allRecipient)[number]) => void;
}) {
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);

  return (
    <VStack
      borderStyle={"solid"}
      borderWidth={"medium"}
      borderRadius={10}
      p={2}
    >
            <Heading as={"h4"} size={"md"} mb={1}>
        Destinataire
      </Heading>
      <FormControl isRequired>
        <FormLabel>Installation de traitement</FormLabel>
        <Select
          placeholder="Sélectionnez une installation de traitement"
          onChange={(e) => {
            setRecipient(allRecipient[e.target.selectedIndex - 1]);
            setSelectedRecipientIndex(e.target.selectedIndex);
          }}
        >
          {allRecipient.map((recipient, index) => (
            <option key={index} value={recipient.walletAddress}>
              {recipient.company.name}
            </option>
          ))}
        </Select>
      </FormControl>
      {selectedRecipientIndex > 0 && (
        <Box>
          <Text>
            {allRecipient[selectedRecipientIndex - 1].company.address}
          </Text>
          <Text>
            {allRecipient[selectedRecipientIndex - 1].company.postalCode}&nbsp;
            {allRecipient[selectedRecipientIndex - 1].company.city}
          </Text>
          <Text>{allRecipient[selectedRecipientIndex - 1].company.infos}</Text>
        </Box>
      )}
    </VStack>
  );
}
