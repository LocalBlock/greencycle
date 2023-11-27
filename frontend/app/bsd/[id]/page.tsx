"use client";
import { Bsd, Status } from "@/types/types";
import { getOneBsd } from "@/utils/bsd";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import QRCode from "qrcode";
import wasteCodes from "@/data/wasteCodes.json";
import { FaRegTrashCan, FaTruck } from "react-icons/fa6";
import { MdFactory } from "react-icons/md";
import StatusBadge from "@/components/Bsd/StatusBadge";
import { IconContext } from "react-icons";
import { FiPackage } from "react-icons/fi";
import { RoleContext } from "@/contexts/role-provider";
import Transport from "@/components/Bsd/Transport";
import RecipientRefuse from "@/components/Bsd/RecipientRefuse";
import RecipientAccept from "@/components/Bsd/RecipientAccept";
import RecipientProcess from "@/components/Bsd/RecipientProcess";
import operationCodes from "@/data/operationCodes.json";

const fakeBsd: Bsd = {
  id: 0,
  status: Status.Created,
  owner: "0x0000000000000000000000000000000000000000",
  producerAddress: "0x0000000000000000000000000000000000000000",
  transporterAddress: "0x0000000000000000000000000000000000000000",
  recipientAddress: "0x0000000000000000000000000000000000000000",
  metadata: {
    producer: {
      company: {
        name: "Loading...",
        address: "Loading..",
        city: "Loading..",
        siret: "loading",
        postalCode: 75000,
        infos: "loading...",
      },
      walletAddress: "0x0",
    },
    recipient: {
      company: {
        name: "Loading...",
        address: "Loading..",
        city: "Loading..",
        siret: "loading",
        postalCode: 75000,
        infos: "loading...",
      },
      walletAddress: "0x0",
    },
    waste: {
      name: "Loading...",
      code: "00 00 00",
      quantity: 0,
      quantityType: "Loading...",
      consistence: "",
      packagingInfos: [],
    },
  },
};

export default function Bsd({ params }: { params: { id: number } }) {
  const [bsd, setBsd] = useState<Bsd>(fakeBsd);
  const [qrCode, setQrCode] = useState("");

  const role = useContext(RoleContext);

  useEffect(() => {
    const fetchOneBsd = async () => {
      setBsd(await getOneBsd(params.id));
      setQrCode(await QRCode.toDataURL(params.id.toString(), { width: 150 }));
    };
    window.addEventListener("transportStarted", fetchOneBsd);
    window.addEventListener("recipientAccepted", fetchOneBsd);
    window.addEventListener("recipientRejected", fetchOneBsd);
    window.addEventListener("recipientProcessed", fetchOneBsd);
    fetchOneBsd();
    return () => {
      window.removeEventListener("transportStarted", fetchOneBsd); //Cleanup
      window.removeEventListener("recipientAccepted", fetchOneBsd); //Cleanup
      window.removeEventListener("recipientRejected", fetchOneBsd); //Cleanup
      window.removeEventListener("recipientProcessed", fetchOneBsd); //Cleanup
    };
  }, [params.id]);

  return (
    <Flex justifyContent={"center"} margin={10}>
      <Card>
        <CardHeader>
          <Flex justifyContent={"space-between"} gap={2}>
            <Box>
              <Flex gap={2} alignItems={"center"}>
                <Heading as={"h3"} size={"lg"}>
                  {bsd?.metadata.waste.name}
                </Heading>
                <Box>
                  <StatusBadge status={bsd.status} />
                </Box>
              </Flex>
              <Text>
                {
                  wasteCodes.find(
                    (wasteCode) => wasteCode.code === bsd.metadata.waste.code
                  )?.description
                }
              </Text>
              <Flex gap={1}>
                <Text>{bsd.metadata.waste.quantity} tonne(s)</Text>
                <Text>{bsd.metadata.waste.quantityType}</Text>
                <Text>{bsd.metadata.waste.consistence}</Text>
              </Flex>
              <Flex>
                <IconContext.Provider value={{ size: "2rem" }}>
                  {bsd.metadata.waste.packagingInfos.map(
                    (packaging, index1) => (
                      <Tooltip
                        key={index1}
                        label={`${packaging.quantity} ${packaging.type}`}
                      >
                        <Box>
                          <FiPackage />
                        </Box>
                      </Tooltip>
                    )
                  )}
                </IconContext.Provider>
              </Flex>
              <Box mt={5}>
                {bsd.metadata.waste.declarationDate && (
                  <Text>
                    Déclaré le :{" "}
                    {new Date(
                      bsd.metadata.waste.declarationDate
                    ).toLocaleString()}
                  </Text>
                )}
                {bsd.metadata.transporter && (
                  <Text>
                    Tranporté le :{" "}
                    {new Date(
                      bsd.metadata.transporter.pickupDate
                    ).toLocaleString()}
                  </Text>
                )}
                {bsd.metadata.recipient.wasteDecisionDate && (
                  <Text>
                    {bsd.metadata.recipient.isWasteAccepted
                      ? "Accepté le : "
                      : "Refusé le : "}
                    {new Date(
                      bsd.metadata.recipient.wasteDecisionDate
                    ).toLocaleString()}
                  </Text>
                )}
                {bsd.metadata.recipient.finalDate && (
                  <Text>
                    Traité le :{" "}
                    {new Date(
                      bsd.metadata.recipient.finalDate
                    ).toLocaleString()}
                  </Text>
                )}
              </Box>
            </Box>

            <Image
              src={qrCode}
              alt="test"
              fallbackSrc="https://via.placeholder.com/150"
              boxSize={"150px"}
            />
          </Flex>
        </CardHeader>
        <CardBody>
          <Box>
            <Tabs>
              <TabList>
                <Tab>
                  <FaRegTrashCan />
                  &nbsp;Producteur
                </Tab>
                <Tab>
                  <FaTruck />
                  &nbsp;Transporteur
                </Tab>
                <Tab>
                  <MdFactory />
                  &nbsp;Destinataire
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Box>
                    <Text>{bsd.metadata.producer.company.name}</Text>
                    <Text>{bsd.metadata.producer.company.siret}</Text>
                    <Text>{bsd.metadata.producer.company.address}</Text>
                    <Flex gap={1}>
                      <Text>{bsd.metadata.producer.company.postalCode}</Text>
                      <Text>{bsd.metadata.producer.company.city}</Text>
                    </Flex>
                    <Text>{bsd.metadata.producer.company.infos}</Text>
                  </Box>
                </TabPanel>
                <TabPanel>
                  {bsd.metadata.transporter != undefined ? (
                    <Box>
                      <Text>{bsd.metadata.transporter.company.name}</Text>
                      <Text>{bsd.metadata.transporter.company.siret}</Text>
                      <Text>{bsd.metadata.transporter.company.address}</Text>
                      <Flex gap={1}>
                        <Text>
                          {bsd.metadata.transporter.company.postalCode}
                        </Text>
                        <Text>{bsd.metadata.transporter.company.city}</Text>
                      </Flex>
                      <Text>{bsd.metadata.transporter.company.infos}</Text>
                    </Box>
                  ) : (
                    <Text>Aucun transporteur</Text>
                  )}
                </TabPanel>
                <TabPanel>
                  <Box>
                    <Text>{bsd.metadata.recipient.company.name}</Text>
                    <Text>{bsd.metadata.recipient.company.siret}</Text>
                    <Text>{bsd.metadata.recipient.company.address}</Text>
                    <Flex gap={1}>
                      <Text>{bsd.metadata.recipient.company.postalCode}</Text>
                      <Text>{bsd.metadata.recipient.company.city}</Text>
                    </Flex>
                    <Text>{bsd.metadata.recipient.company.infos}</Text>
                    {bsd.status === Status.Processed && (
                      <Box mt={5}>
                        <Text>
                          Opération réalisé :&nbsp;
                          {bsd.metadata.recipient.operationProcessed} -&nbsp;
                          {
                            operationCodes.find(
                              ({ code }) =>
                                code ===
                                bsd.metadata.recipient.operationProcessed
                            )?.description
                          }
                        </Text>
                        <Text>
                          {bsd.metadata.recipient.operationDescription}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </CardBody>
        {role === "transporter" && bsd.status != Status.Shipped && (
          <CardFooter>
            <Transport bsd={bsd} />
          </CardFooter>
        )}
        {role === "recipient" && bsd.status === Status.Shipped && (
          <CardFooter>
            {!bsd.metadata.recipient.isWasteAccepted && (
              <Flex gap={2}>
                <RecipientAccept bsd={bsd} />
                <RecipientRefuse bsd={bsd} />
              </Flex>
            )}
          </CardFooter>
        )}
        {role === "recipient" && bsd.status === Status.Accepted && (
          <CardFooter>
            <RecipientProcess bsd={bsd} />
          </CardFooter>
        )}
      </Card>
    </Flex>
  );
}
