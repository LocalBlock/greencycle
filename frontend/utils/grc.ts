import { Address, formatEther, hexToSignature } from "viem";
import { grcContractConfig } from "@/contracts/GRC";
import { grcvaultContractConfig } from "@/contracts/GRCVault";
import { signTypedData, readContract } from "@wagmi/core";
import { bsdContractConfig } from "@/contracts/BSD";

export async function getBalanceOf(address: Address) {
  const balance = await readContract({
    address: grcContractConfig.contractAddress,
    abi: grcContractConfig.abi,
    functionName: "balanceOf",
    args: [address],
  });
  return formatEther(balance);
}

export async function getGrcTokenLock(owner: Address) {
  const balance = await readContract({
    address: grcvaultContractConfig.contractAddress,
    abi: grcvaultContractConfig.abi,
    functionName: "balanceOf",
    args: [owner],
  });
  return formatEther(balance);
}

/**
 * Pas réussi à faire un vrai permit avec wagmi! => Abandon de la feature
 * @param owner
 * @param chainId
 * @param value
 * @returns
 */
// export async function getPermitSignature(
//   owner: Address,
//   chainId: number,
//   value: bigint
// ) {
//   // Duration in seconds
//   const allowanceDuration = 60 * 60 * 24 * 30; // 30 jours

//   // Deadline : current time + duration in seconds
//   const deadline = BigInt(Math.floor(Date.now() / 1000) + allowanceDuration);

//   // Spender : BsdContract
//   const spender = bsdContractConfig.contractAddress;

//   // get the current nonce for owner
//   const nonces = await readContract({
//     address: grcContractConfig.contractAddress,
//     abi: grcContractConfig.abi,
//     functionName: "nonces",
//     args: [owner],
//   });

//   // Set the domain parameters
//   const domain = {
//     name: "GreenCycle",
//     version: "1",
//     chainId,
//     verifyingContract: grcContractConfig.contractAddress,
//   } as const;

//   // set the Permit type parameters
//   const types = {
//     Permit: [
//       {
//         name: "owner",
//         type: "address",
//       },
//       {
//         name: "spender",
//         type: "address",
//       },
//       {
//         name: "value",
//         type: "uint256",
//       },
//       {
//         name: "nonce",
//         type: "uint256",
//       },
//       {
//         name: "deadline",
//         type: "uint256",
//       },
//     ],
//   } as const;

//   // Sign the Permit type data with the owner's private key
//   const signature = await signTypedData({
//     domain,
//     primaryType: "Permit",
//     message: {
//       owner,
//       spender,
//       value,
//       nonce: nonces,
//       deadline,
//     },
//     types,
//   });
//   // Split the signature into its components
//   const sig = hexToSignature(signature);
//   //return signature
//   return { owner, spender, value, deadline, sig };
// }
