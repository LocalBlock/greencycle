import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

import { getProducer } from "@/utils/user";
import { Recipient, Waste } from "@/types/types";
import WasteForm from "../forms/WasteForm";
import RecepientForm from "../forms/RecepientForm";

import Mint from "./Mint";

export default function CreateBSD() {
  const { address } = useAccount();

  const [waste, setWaste] = useState<Waste>({
    code: "",
    name: "",
    quantity: 0,
    quantityType: "",
    consistence: "",
    packagingInfos: [],
  });

  const [recipient, setRecipient] = useState<Recipient>();

  const producer = getProducer(address!);
  if (!producer) throw new Error("User not found");

  const isWasteValid =
    waste.code != "" &&
    waste.name != "" &&
    waste.quantity != 0 &&
    waste.quantityType != "" &&
    waste.consistence != undefined &&
    waste.packagingInfos.length != 0;

  //console.log("[Render] Create BSD");
  return (
    <Box mt={"1rem"}>
      <Heading mb={5}>Créer un BSD</Heading>

      <Flex direction={"column"} gap={5}>
        <Box
          borderStyle={"solid"}
          borderWidth={"medium"}
          borderRadius={10}
          p={2}
        >
          <Box textAlign={"center"}>
            <Heading as={"h4"} size={"md"} mb={1}>
              Producteur
            </Heading>
          </Box>
          <Text>{producer.company.name}</Text>
          <Text>{producer.company.address}</Text>
          <Flex gap={2}>
            <Text>{producer.company.postalCode}</Text>
            <Text>{producer.company.city}</Text>
          </Flex>
        </Box>

        <WasteForm waste={waste} setWasteData={setWaste} />
        <RecepientForm setRecipient={setRecipient} />
        <Box>
          <Mint
            isButtondisabled={!isWasteValid || recipient === undefined}
            waste={waste}
            producer={producer}
            recipient={recipient!}
          />
        </Box>
      </Flex>
    </Box>
  );
}
