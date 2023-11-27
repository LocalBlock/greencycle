import { Status } from "@/types/types";
import { Badge } from "@chakra-ui/react";
import React from "react";

export default function StatusBadge({ status }: { status: Status }) {
  //Status
  switch (status) {
    case Status.Created:
      return <Badge colorScheme={"purple"}>Créé</Badge>;
    case Status.Shipped:
      return <Badge colorScheme={"teal"}>En transit</Badge>;
    case Status.Accepted:
      return <Badge colorScheme={"yellow"}>Reçu</Badge>;
    case Status.Processed:
      return <Badge colorScheme={"green"}>Finalisé</Badge>;
    case Status.Rejected:
      return <Badge colorScheme={"red"}>Refusé</Badge>;
    case Status.Claimed:
      return <Badge colorScheme={"red"}>Réclamation</Badge>;
  }
}
