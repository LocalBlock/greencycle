import { Address, formatEther, parseEther, zeroAddress } from "viem";
import defaultUsersDev from "@/data/defaultUsersDev.json";
import defaultUsersProd from "@/data/defaultUsersProd.json";
import { Producer, Recipient, Roles, Transporter } from "@/types/types";
import { bsdContractConfig } from "@/contracts/BSD";
import { grcContractConfig } from "@/contracts/GRC";
import { PublicClient } from "wagmi";

export function getRole(address: Address | undefined) {
  switch (process.env.NODE_ENV) {
    case "test":
    case "development":
      {
        if (
          defaultUsersDev.producers.some(
            (producer) => producer.walletAddress === address
          )
        )
          return "producer" as Roles;
        if (
          defaultUsersDev.transporters.some(
            (transporter) => transporter.walletAddress === address
          )
        )
          return "transporter" as Roles;
        if (
          defaultUsersDev.recipients.some(
            (recipient) => recipient.walletAddress === address
          )
        )
          return "recipient" as Roles;
      }

      break;
    case "production":
      if (
        defaultUsersProd.producers.some(
          (producer) => producer.walletAddress === address
        )
      )
        return "producer" as Roles;
      if (
        defaultUsersProd.transporters.some(
          (transporter) => transporter.walletAddress === address
        )
      )
        return "transporter" as Roles;
      if (
        defaultUsersProd.recipients.some(
          (recipient) => recipient.walletAddress === address
        )
      )
        return "recipient" as Roles;

      break;
  }
}

export function getUserData(address: Address) {
  const role = getRole(address);

  let result: Producer | Transporter | Recipient | undefined;

  if (role === "producer") result = getProducer(address);
  if (role === "transporter") result = getTransporter(address);
  if (role === "recipient") result = getRecipient(address);

  return result;
}

export function getProducer(address: Address) {
  const { producers } =
    process.env.NODE_ENV === "development" ? defaultUsersDev : defaultUsersProd;
  const result = producers.find((role) => role.walletAddress === address);
  if (result) return result as Producer;
  return undefined;
}

export function getTransporter(address: Address) {
  const { transporters } =
    process.env.NODE_ENV === "development" ? defaultUsersDev : defaultUsersProd;
  const result = transporters.find((role) => role.walletAddress === address);
  if (result) return result as Transporter;
  return undefined;
}

export function getRecipient(address: Address) {
  const { recipients } =
    process.env.NODE_ENV === "development" ? defaultUsersDev : defaultUsersProd;
  const result = recipients.find((role) => role.walletAddress === address);
  if (result) return result as Recipient;
  return undefined;
}

export async function getMyEvents(
  address: Address,
  publicClient: PublicClient
) {
  // Mint Events
  const logs = await publicClient.getContractEvents({
    address: grcContractConfig.contractAddress,
    abi: grcContractConfig.abi,
    eventName: "Transfer",
    args: {
      from: zeroAddress,
      to: address,
    },
    fromBlock: BigInt(grcContractConfig.blockNumber),
  });

  const allMint = await Promise.all(
    logs.map(async (log) => {
      return {
        timestamp: Number(
          (
            await publicClient.getBlock({
              blockNumber: log.blockNumber,
            })
          ).timestamp
        ),
        type: "mint",
        value: formatEther(log.args.value!),
      };
    })
  );

  const logs2 = await publicClient.getContractEvents({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    eventName: "userSlashed",
    args: {
      shashedAddress: address,
    },
    fromBlock: BigInt(bsdContractConfig.blockNumber),
  });

  const allSlash = await Promise.all(
    logs2.map(async (log) => {
      return {
        timestamp: Number(
          (
            await publicClient.getBlock({
              blockNumber: log.blockNumber,
            })
          ).timestamp
        ),
        type: "slash",
        value: formatEther(log.args.slashedAmount!),
      };
    })
  );

  //Trie
  const allUserEvent = [...allMint, ...allSlash];
  allUserEvent.sort((a, b) => b.timestamp - a.timestamp);

  return allUserEvent;
}
