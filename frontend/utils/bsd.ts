import { Address } from "viem";
import { getRole } from "./user";
import { PublicClient } from "wagmi";
import { bsdContractConfig } from "@/contracts/BSD";
import { readContract } from "@wagmi/core";
import { getIpfsData } from "./metadata";
import { Bsd, BsdDataContract } from "@/types/types";

export async function getMyBsd(address: Address, publicClient: PublicClient) {
  const role = getRole(address);
  switch (role) {
    case "producer": {
      // Get all TokenId Minted to producer address
      const allTokenId = await getTokenIdFromTransferEvents(
        publicClient,
        "0x0000000000000000000000000000000000000000",
        address
      );
      if (allTokenId.length === 0) return [];

      // get metadata and build BSD
      const allBsd = await Promise.all(
        allTokenId.map(async (id) => {
          return await getOneBsd(id);
        })
      );
      return allBsd;
    }

    case "transporter": {
      // Get all tokenId Minted (Get events)
      const allMintedTokenid = await getTokenIdFromTransferEvents(
        publicClient,
        "0x0000000000000000000000000000000000000000"
      );

      // Get owned tokenid (Read contract)
      const myTokenIds = await getTokenIdsOf(address);

      // Get all tokenId tranfered from transporter (get event)
      const allTranferedTokenid = await getTokenIdFromTransferEvents(
        publicClient,
        address
      );

      // Remove all doublons
      const allTokenId = Array.from(
        new Set([...allMintedTokenid, ...myTokenIds, ...allTranferedTokenid])
      );

      // get metadata and build BSD
      const allBsd = await Promise.all(
        allTokenId.map(async (id) => {
          return await getOneBsd(id);
        })
      );
      return allBsd;
    }

    case "recipient": {
      const allTokenId = await getTokenIdFromToRecipientEvent(
        publicClient,
        address
      );
      // get metadata and build BSD
      const allBsd = await Promise.all(
        allTokenId.map(async (id) => {
          return await getOneBsd(id);
        })
      );
      return allBsd;
    }
  }
}

export async function getOneBsd(id: number) {
  // get Metadata
  const bsdMetadata = await getMetadata(id);

  if (!bsdMetadata)
    throw new Error("Pas de metadata pour le tokenId : " + Number(id));

  // Get BSD Data
  const bsdDataContract = await getBsdData(id);

  // Build BSD
  const bsd: Bsd = {
    id: Number(id),
    metadata: bsdMetadata,
    ...bsdDataContract,
  };
  return bsd;
}

async function getTokenIdFromToRecipientEvent(
  publicClient: PublicClient,
  address: Address
) {
  const logs = await publicClient.getContractEvents({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    eventName: "toRecipient",
    args: {
      recipient: address,
    },
    fromBlock: BigInt(bsdContractConfig.blockNumber),
  });

  return logs.map((log) => Number(log.args.tokenId!));
}

async function getTokenIdFromTransferEvents(
  publicClient: PublicClient,
  from?: Address,
  to?: Address
) {
  const logs = await publicClient.getContractEvents({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    eventName: "Transfer",
    args: {
      from,
      to,
    },
    fromBlock: BigInt(bsdContractConfig.blockNumber),
  });

  return logs.map((log) => Number(log.args.tokenId!));
}

/**
 * Fetch ipfs URI from contract and fetch metadata from IPFS
 * @param id tokenId
 * @returns BSD Metadata
 */
async function getMetadata(id: number) {
  const ipfs = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "tokenURI",
    args: [BigInt(id)],
  });

  return await getIpfsData(ipfs);
}

/**
 * Fetch bsd Data from contract
 * @param id tokenId
 * @returns object
 */
async function getBsdData(id: number) {
  const bsdStructData = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "getBsdData",
    args: [BigInt(id)],
  });

  // Get owner
  const owner = await getOwnerOf(id);

  const bsdData = {
    status: bsdStructData.status,
    owner,
    producerAddress: bsdStructData.producer,
    transporterAddress: bsdStructData.transporter,
    recipientAddress: bsdStructData.recipient,
  };
  return bsdData;
}

/**
 * Call "myTokenIds" to retrieve all tokenId from owner
 * @param address Owner
 * @returns Array of tokenId
 */
async function getTokenIdsOf(address: Address) {
  const myTokenIds = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "getTokenIdsOf",
    args: [address],
  });
  return myTokenIds.map((tokenId) => Number(tokenId));
}

/**
 * Call "owerOf" to retrieve the owner
 * @param tokenId Token Id
 * @returns Owner address
 */
async function getOwnerOf(tokenId: number) {
  const ownerAddress = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });
  return ownerAddress;
}
