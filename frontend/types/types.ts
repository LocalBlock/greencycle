import { Address } from "viem";

export type Roles = "producer" | "transporter" | "recipient";

export enum Status {
  Created,
  Shipped,
  Rejected,
  Accepted,
  Processed,
  Claimed,
}

export type Waste = {
  code: string;
  name: string;
  quantity: number;
  quantityType: string;
  consistence: "Solide" | "Liquide" | "Gazeux" | "";
  packagingInfos: {
    type: "Benne" | "Citerne" | "Grv" | "Fût" | "";
    quantity: number;
  }[];
  declarationDate?: number;
};

export type Producer = {
  company: {
    name: string;
    siret: string;
    address: string;
    postalCode: number;
    city: string;
    infos: string;
  };
  walletAddress: Address;
};

export type Transporter = {
  company: {
    name: string;
    siret: string;
    address: string;
    postalCode: number;
    city: string;
    infos: string;
  };
  walletAddress: Address;
};

export type Recipient = {
  company: {
    name: string;
    siret: string;
    address: string;
    postalCode: number;
    city: string;
    infos: string;
  };
  walletAddress: Address;
};
export type BsdMetaData = {
  producer: Producer;
  transporter?: Transporter & { pickupDate: number };
  recipient: Recipient & {
    quantityReceived?: number;
    isWasteAccepted?: boolean;
    rejectedReason?: string;
    wasteDecisionDate?: number;
    operationProcessed?: string;
    operationDescription?: string;
    finalDate?: number;
  };
  waste: Waste;
};

export type Bsd = {
  id: number;
  metadata: BsdMetaData;
} & BsdDataContract;

/**
 * Return type from getBsdData contract call
 */
export type BsdDataContract = {
  status: Status;
  owner: Address;
  producer: {
    walletAddress: Address;
  };
  transporter: {
    walletAddress: Address;
    pickupDate: bigint;
    deliveryDate: bigint;
  };
  recipient: {
    walletAddress: Address;
    wasteDecisionDate: bigint;
    finalDate: bigint;
  };
};

export type ContractConstants = {
  bsd: {
    maxProcessTime: number;
    onboardingMintAmount: number;
    rewardMintAmount: number;
    slashAmount: number;
  };
  vault: {
    minLockAmount: number;
  };
};

export type TxSteps = {
  status: "success" | "idle" | "loading" | "ipfs" | "approve";
  description: string;
}[];
