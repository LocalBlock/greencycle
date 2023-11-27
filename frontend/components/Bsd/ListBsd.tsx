"use client";
import { Bsd } from "@/types/types";
import { getMyBsd } from "@/utils/bsd";
import {
  Link,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Center,
  Tag,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import NextLink from "next/link";
import StatusBadge from "@/components/Bsd/StatusBadge";
import { getUserData } from "@/utils/user";

export default function ListBsd() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [allBsd, setAllBsd] = useState<Bsd[]>([]);

  useEffect(() => {
    let ignore = false;
    const fetchBsd = async () => {
      if (!address) throw new Error("fetch BSD : Address undefined");
      if (!ignore) {
        const myAllBsd = await getMyBsd(address, publicClient);
        if (!myAllBsd) throw new Error("myAllBsd est indéfini");
        setAllBsd(myAllBsd);
      }
    };
    //console.log("useEffect [fetchBsd]");
    fetchBsd();
    return () => {
      ignore = true;
    };
  }, [address, publicClient]);
  return (
    <Center>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>N°</Th>
              <Th>Status</Th>
              <Th>Proprietaire</Th>
              <Th>Dénomination</Th>
              <Th isNumeric>Quantité</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {allBsd.map((bsd) => (
              <Tr key={bsd.id}>
                <Td>{bsd.id}</Td>
                <Td>
                  <StatusBadge status={bsd.status} />
                </Td>
                <Td>
                  {getUserData(bsd.owner)?.company.name}&nbsp;
                  {bsd.owner === address && <Tag>Vous</Tag>}
                </Td>
                <Td>{bsd.metadata.waste.name}</Td>
                <Td isNumeric>{bsd.metadata.waste.quantity}</Td>
                <Td>
                  <Link as={NextLink} href={`/bsd/${bsd.id}`} scroll={false}>
                    Détails
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Center>
  );
}
