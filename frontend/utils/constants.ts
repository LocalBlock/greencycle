import { ContractConstants } from "@/types/types";
import { bsdContractConfig } from "@/contracts/BSD";
import { grcvaultContractConfig } from "@/contracts/GRCVault";
import { readContract } from "@wagmi/core";
import { formatEther } from "viem";

export async function getContractConstants(): Promise<ContractConstants> {
  const maxProcessTime = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "MAX_PROCESS_TIME",
  });

  const onboardingMintAmount = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "ONBOARDING_MINT_AMOUNT",
  });
  const rewardMintAmount = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "REWARD_MINT_AMOUNT",
  });
  const slashAmount = await readContract({
    address: bsdContractConfig.contractAddress,
    abi: bsdContractConfig.abi,
    functionName: "SLASH_AMOUNT",
  });
  const minLockAmount = await readContract({
    address: grcvaultContractConfig.contractAddress,
    abi: grcvaultContractConfig.abi,
    functionName: "MIN_LOCK_AMOUNT",
  });

  return {
    bsd: {
      maxProcessTime: Number(maxProcessTime),
      onboardingMintAmount: Number(formatEther(onboardingMintAmount)),
      rewardMintAmount: Number(formatEther(rewardMintAmount)),
      slashAmount: Number(formatEther(slashAmount)),
    },
    vault: { minLockAmount: Number(formatEther(minLockAmount)) },
  };
}
