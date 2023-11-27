import { Bsd, BsdMetaData, Producer, Recipient, Waste } from "@/types/types";
import { Address } from "viem";
import { getTransporter, getUserData } from "./user";

export function initMetadata(
  producer: Producer,
  recipient: Recipient,
  waste: Waste
) {
  const wasteWithDeclarationDate={...waste,declarationDate:Date.now()}
  const bsdMetadata: BsdMetaData = { producer, waste:wasteWithDeclarationDate, recipient: recipient };
  return bsdMetadata;
}

export async function uploadToIpfs(bsdMetadata: BsdMetaData) {
  const result = await fetch("/api/ipfs/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bsdMetadata),
  });
  if (result.ok) {
    const cid = await result.json();
    return cid;
  }
}

export async function getIpfsData(ipfsURI: string) {
  const cid = ipfsURI.substring(7); // without ipfs://
  const result = await fetch("/api/ipfs/get?cid=" + cid, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (result.ok) {
    const BsdMetadata = (await result.json()) as BsdMetaData;
    return BsdMetadata;
  }
}

export function updateMetadataTransport(
  bsdMetadata: BsdMetaData,
  transporterAddress: Address
): BsdMetaData {
  const transporterData = getTransporter(transporterAddress);
  if (!transporterData) throw new Error("Transporter Data not found");
  const transporterDataWithDate = {
    ...transporterData,
    pickupDate: Date.now(),
  };

  const newMetadata = { ...bsdMetadata, transporter: transporterDataWithDate };
  return newMetadata;
}

export function updateMetadataRecipientReject(
  bsdMetadata: BsdMetaData,
  reason: string
): BsdMetaData {
  const recipientData = {
    ...bsdMetadata.recipient,
    isWasteAccepted: false,
    rejectedReason: reason,
    wasteDecisionDate: Date.now(),
  };

  const newMetadata = { ...bsdMetadata, recipient: recipientData };
  return newMetadata;
}

export function updateMetadataRecipientAccept(
  bsdMetadata: BsdMetaData,
  quantity: number
): BsdMetaData {
  const recipientData = {
    ...bsdMetadata.recipient,
    isWasteAccepted: true,
    quantityReceived:quantity,
    wasteDecisionDate: Date.now(),
  };

  const newMetadata = { ...bsdMetadata, recipient: recipientData };
  return newMetadata;
}

export function updateMetadataRecipientProcess(
  bsdMetadata: BsdMetaData,
  operationCode:string,
  operationDescription: string
): BsdMetaData {
  const recipientData = {
    ...bsdMetadata.recipient,
    operationProcessed:operationCode,
    operationDescription,
    finalDate: Date.now(),
  };

  const newMetadata = { ...bsdMetadata, recipient: recipientData };
  return newMetadata;
}
