"use client";
import { ConstantsContext } from "@/contexts/ConstantsProvider";
import { getMyEvents } from "@/utils/user";
import {
  Center,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tag,
  Text,
  Flex,
  TableCaption,
} from "@chakra-ui/react";

import React, { useContext, useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";

export default function Infos() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [myEvents, setMyEvents] = useState<
    Awaited<ReturnType<typeof getMyEvents>>
  >([]);

  const constants = useContext(ConstantsContext);

  useEffect(() => {
    const fetchMyEvents = async () => {
      setMyEvents(await getMyEvents(address!, publicClient));
    };
    fetchMyEvents();
  }, [address, publicClient]);

  return (
    <Center>
      <Flex direction={"column"} gap={10}>
        <TableContainer>
          <Table variant="simple">
          <TableCaption placement="top">
              Activité sur votre adresse
            </TableCaption>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th isNumeric>Valeur</Th>
              </Tr>
            </Thead>
            <Tbody>
              {myEvents.map((event, index) => (
                <Tr key={index}>
                  <Td>{new Date(event.timestamp * 1000).toLocaleString()}</Td>
                  <Td>{event.type}</Td>
                  <Td isNumeric>
                    {event.type === "mint" && (
                      <Text color={"green"}>+{event.value} GRC</Text>
                    )}
                    {event.type === "slash" && (
                      <Text color={"red"}>-{event.value} GRC</Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <TableContainer>
          <Table variant="simple">
            <TableCaption placement="top">
              Paramètre de l&apos;application
            </TableCaption>
            <Thead>
              <Tr>
                <Th>Paremètre</Th>
                <Th isNumeric>Valeur</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>GRC offert à l&apos;inscription</Td>
                <Td isNumeric>
                  <Text color={"green"}>
                    +{constants?.bsd.onboardingMintAmount} GRC
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>Montant minimum de GRC à bloquer</Td>
                <Td isNumeric>
                  <Text>{constants?.vault.minLockAmount} GRC</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>Récompense utilisateur pour chaque déchet traité</Td>
                <Td isNumeric>
                  <Text color={"green"}>
                    +{constants?.bsd.rewardMintAmount} GRC
                  </Text>
                </Td>
              </Tr>
              <Tr>
                <Td>Pénalité utilisateur</Td>
                <Td isNumeric>
                  <Text color={"red"}>-{constants?.bsd.slashAmount} GRC</Text>
                </Td>
              </Tr>
              <Tr>
                <Td>Délai de traitement destinataire</Td>
                <Td isNumeric>{constants?.bsd.maxProcessTime! / 60} minutes</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Center>
  );
}
